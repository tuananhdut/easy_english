# Word Accuracy Recognition API

## Mô tả

API sử dụng mô hình Wav2Vec2 để nhận diện từ và đánh giá độ chính xác dựa trên phoneme.

## Hướng dẫn sử dụng

1. Gửi file âm thanh (WAV hoặc MP3)
2. Cung cấp từ mong đợi (`expected_word`)
3. Nhận kết quả gồm văn bản nhận dạng và độ chính xác (accuracy)

## Endpoint

- `POST /recognize`

## Input

- `audio_file`: File âm thanh
- `expected_word`: Từ mong đợi

## Output

```json
{
  "recognized_text": "p ah b l ih k",
  "expected_word": "public",
  "accuracy": 0.83
}
```

## ⚙️ Hướng dẫn cài đặt

### Bước 1 tạo môi trường ảo

python -m venv venv
Kích hoạt:
source venv/bin/activate # Linux/macOS
venv\Scripts\activate # Windows

### Bước 2 cài đặt thư viện cần thiết

pip install -r requirements.txt

### Bước 3 tạo file .env

Tạo file .env ở thư mục gốc và thêm nội dung:
HOST = 0.0.0.0
PORT = 8000
MODEL_DIR = đường dẫn tới model

### Bước 4 chạy ứng dụng

uvicorn app.main:app --reload
