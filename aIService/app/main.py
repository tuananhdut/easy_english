from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from transformers import Wav2Vec2CTCTokenizer, Wav2Vec2ForCTC
from transformers import Wav2Vec2FeatureExtractor
from transformers import Wav2Vec2Processor
from tokenizers.processors import TemplateProcessing
import torch
import soundfile as sf
import librosa
import pronouncing
import re
from jiwer import cer
import tempfile
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants from environment variables
MODEL_DIR = os.getenv("MODEL_DIR")
ALLOWED_AUDIO_TYPES = os.getenv("ALLOWED_AUDIO_TYPES", "audio/wav,audio/mpeg,audio/mp3").split(",")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10")) * 1024 * 1024  # Convert MB to bytes
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Global variables
processor = None
model = None
device = None

def initialize_model():
    """Initialize the Wav2Vec2 model and processor"""
    global processor, model, device
    try:
        processor = Wav2Vec2Processor.from_pretrained(MODEL_DIR)
        model = Wav2Vec2ForCTC.from_pretrained(MODEL_DIR)
        model.eval()
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        return True
    except Exception as e:
        print(f"Error initializing model: {e}")
        return False

def process_audio(input_path: str):
    """
    Process audio file using librosa
    
    Args:
        input_path: Path to input audio file
        
    Returns:
        tuple: (audio_data, sample_rate)
    """
    try:
        # Load audio file using librosa
        audio_data, sample_rate = librosa.load(input_path, sr=16000)
        return audio_data, sample_rate
    except Exception as e:
        print(f"Error processing audio: {e}")
        return None, None

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
    # Shutdown
    # Clean up resources if needed

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

def sentence_to_phonemes(sentence):
    """
    Convert a sentence to phonemes using pronouncing library
    
    Args:
        sentence (str): Input sentence
        
    Returns:
        str: Phoneme sequence
    """
    words = sentence.lower().split()
    phoneme_sequence = ""

    for word in words:
        phones = pronouncing.phones_for_word(word)
        if phones:
            # Get first pronunciation and split into phonemes
            phonemes = phones[0].split()
            # Remove stress numbers (0, 1, 2)
            cleaned_phonemes = [re.sub(r'\d', '', p) for p in phonemes]
            phoneme_sequence += "".join(cleaned_phonemes)
        else:
            # If phonemes not found
            phoneme_sequence += f"[UNK:{word}]"

    return phoneme_sequence.lower()

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
        predicted_ids = torch.argmax(logits, dim=-1)
        predicted_text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        # Clean predicted text
        predicted_text = predicted_text.replace("h#", "")
        predicted_text = predicted_text.replace("[PAD]", "")
        predicted_text = predicted_text.replace(" ", "")

        # Calculate accuracy if expected word is provided
        accuracy = 0
        if expected_word:
            expected_phonemes = sentence_to_phonemes(expected_word)
            accuracy = 1 - cer(expected_phonemes, predicted_text)

        # Clean up temporary files
        os.unlink(temp_audio_path)

        return {
            "status": "success",
            "recognized_text": predicted_text,
            "expected_word": expected_word,
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