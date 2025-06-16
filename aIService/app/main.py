from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
import soundfile as sf
import librosa
import pronouncing
import re
import tempfile
import os
from contextlib import asynccontextmanager
import editdistance
from dotenv import load_dotenv
import noisereduce as nr
from typing import List

# Load environment variables
load_dotenv()

# Constants from environment variables
MODEL_DIR = os.getenv("MODEL_DIR")
ALLOWED_AUDIO_TYPES = os.getenv("ALLOWED_AUDIO_TYPES", "audio/wav,audio/wave,audio/mpeg,audio/mp3").split(",")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10")) * 1024 * 1024  # Convert MB to bytes
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
PYANNOTE_TOKEN = os.getenv("PYANNOTE_TOKEN")

# Global variables
processor = None
model = None
device = None
PAD_ID = None

def initialize_model():
    """Initialize the Wav2Vec2 model and processor"""
    global processor, model, device, PAD_ID
    try:
        processor = Wav2Vec2Processor.from_pretrained(MODEL_DIR)
        PAD_ID = processor.tokenizer.encode("[PAD]")[0] 
        model = Wav2Vec2ForCTC.from_pretrained(MODEL_DIR)
        model.eval()
        
        # Initialize device first
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print("bạn đang chạy trên :", device)
        model.to(device)
        
        return True
    except Exception as e:
        print(f"Error initializing model: {e}")
        return False

def clean_audio(speech, sample_rate):
    # Bước 1: Giảm tiếng ồn nền
    speech = nr.reduce_noise(
        y=speech,
        sr=sample_rate,
        stationary=False, 
        prop_decrease=0.6  # Giảm 80% cường độ tiếng ồn
    )

    speech, _ = librosa.effects.trim(speech, top_db=60)

    return speech

def process_audio(input_path: str):
    """
    Process audio file using librosa and pyannote
    
    Args:
        input_path: Path to input audio file
        
    Returns:
        tuple: (audio_data, sample_rate)
    """
    try:
        speech, sample_rate = sf.read(input_path)
        if sample_rate != 16000:
            speech = librosa.resample(speech, orig_sr=sample_rate, target_sr=16000)
            sample_rate = 16000

        speech = clean_audio(speech, sample_rate)
        return speech, sample_rate
    except Exception as e:
        print(f"Error processing audio: {e}")
        return None, None
    
# Hàm chèn [PAD] giữa các ID khác nhau, trừu khi đã có [PAD]
def insert_pad_between_different_ids(token_ids: List[int], pad_id: int) -> List[int]:
    result = []
    for i in range(len(token_ids)):
        result.append(token_ids[i])  
        if i < len(token_ids) - 1:
            if token_ids[i] != token_ids[i + 1] and token_ids[i] != pad_id and token_ids[i + 1] != pad_id:
                result.append(pad_id)
    return result

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    if not initialize_model():
        raise Exception("Failed to initialize model")
    yield

app = FastAPI(
    title="Word Accuracy Recognition API",
    description="""
    API for recognizing word accuracy using Wav2Vec2 model.
    
    ## Features
    * Convert audio to text
    * Calculate word accuracy using phonemes
    * Support for WAV and MP3 audio files
    
    ## Usage
    1. Send a POST request to `/recognize` with an audio file and expected word
    2. Receive the accuracy score and recognized text
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def map_similar_phonemes(phonemes):
    # Ánh xạ phoneme tương tự
    mapping = {
        'p': 'P', 'b': 'P','aa': 'aa','ao': 'aa',
        'ih': 'ih','ah': 'ih','iy': 'ih','er': 'r',
    }
    return [mapping.get(p, p) for p in phonemes]


def sentence_to_phonemes(sentence):
    words = sentence.lower().split()
    phoneme_sequence = []

    for word in words:
        phones = pronouncing.phones_for_word(word)
        if phones:
            phonemes = phones[0].split()
            cleaned_phonemes = [re.sub(r'\d', '', p).lower() for p in phonemes]
            phoneme_sequence.extend(cleaned_phonemes)
        else:
            phoneme_sequence.append(f"[unk:{word}]") 
    return phoneme_sequence
    
def compute_per(pred_phonemes, ref_phonemes):
    pred_mapped = map_similar_phonemes(pred_phonemes)
    ref_mapped = map_similar_phonemes(ref_phonemes)

    distance = editdistance.eval(pred_mapped, ref_mapped)
    per = distance / len(ref_phonemes) if ref_phonemes else 0.0
    return 1-per

@app.get("/")
async def root():
    """Root endpoint to check if API is running"""
    return {"message": "Word Accuracy Recognition API is running"}

@app.post("/recognize")
async def recognize_word(
    audio_file: UploadFile = File(..., description="Audio file (WAV or MP3 format)"),
    expected_word: str = Form(None, description="Expected word to compare with")
):
    """
    Recognize word from audio and calculate accuracy
    
    Args:
        audio_file: WAV or MP3 audio file
        expected_word: Expected word to compare with (from form-data)
        
    Returns:
        dict: Recognition results including accuracy
    """
    # Validate file type
    if audio_file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_AUDIO_TYPES)}"
        )

    # Validate file size
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    while chunk := await audio_file.read(chunk_size):
        file_size += len(chunk)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE/1024/1024}MB"
            )
    
    # Reset file pointer
    await audio_file.seek(0)

    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_audio:
            content = await audio_file.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        # Process audio using librosa
        speech, sample_rate = process_audio(temp_audio_path)
        if speech is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to process audio file"
            )

        # Process audio
        inputs = processor(speech, sampling_rate=sample_rate, return_tensors="pt", padding=True)
        input_values = inputs.input_values.to(device)

        # Get predictions
        with torch.no_grad():
            logits = model(input_values).logits
    
        # Dự đoán ID token
        predicted_ids = torch.argmax(logits, dim=-1)

        # Chèn [PAD] giữa các ID khác nhau
        predicted_ids = predicted_ids[0].tolist()  # Lấy batch đầu tiên
        predicted_ids = insert_pad_between_different_ids(predicted_ids, PAD_ID)

        # Decode ra text và tách thành mảng token
        predicted_text = processor.batch_decode([torch.tensor(predicted_ids)], skip_special_tokens=True)[0]
        predicted_text = predicted_text.replace("h#", "")
        predicted_text = predicted_text.replace(" ", "[PAD]")
        predicted_list = [item for item in predicted_text.split("[PAD]") if item != '']

        accuracy = 0
        if expected_word:
            expected_phonemes = sentence_to_phonemes(expected_word)
            # print(expected_phonemes)
            # print(predicted_list)
            accuracy = compute_per(expected_phonemes,predicted_list)

        # Clean up temporary files
        os.unlink(temp_audio_path)

        return {
            "status": "success",
            "recognized_text": predicted_list,
            "expected_word": expected_phonemes,
            "accuracy": accuracy
        }

    except Exception as e:
        # Clean up temporary files in case of error
        if 'temp_audio_path' in locals():
            os.unlink(temp_audio_path)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT, reload=True)  