<div align="center">
  <img src="extension/assets/VeriFeed-Logo.png" alt="VeriFeed Logo" width="200" />

  <h1>VeriFeed</h1>

  <p>An AI-powered browser extension for real-time deepfake video detection<br/>on Facebook, backed by a ResNeXt50+LSTM model and a bilingual NLP chatbot.</p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white" />
    <img src="https://img.shields.io/badge/Flask-3.0.3-000000?style=flat-square&logo=flask&logoColor=white" />
    <img src="https://img.shields.io/badge/PyTorch-2.9.0-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" />
    <img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
    <img src="https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white" />
  </p>
</div>

---

## Related Repositories

| Repository | Description |
|---|---|
| [VeriFeed-Frontend](https://github.com/christinaesico456/VeriFeed-Frontend) | Main website / landing page for VeriFeed |
| [VeriFeed (this repo)](https://github.com/gwenndestura/VeriFeed) | Browser extension + Flask backend |

---

## Overview

**VeriFeed** is a deepfake video detection system built as a Chrome/Firefox browser extension with a Flask-powered AI backend. As users browse Facebook, VeriFeed analyzes videos in real time, classifying them as **REAL** or **FAKE** with a confidence score. The system uses a ResNeXt50 + Bidirectional LSTM neural network trained on the DFDC dataset, achieving **91.43% accuracy**.

A bilingual (English & Filipino) NLP chatbot is integrated directly into the extension popup, allowing users to ask context-aware questions about detection results in natural language.

---

## Features

- **Deepfake Detection** — ResNeXt50 + Bidirectional LSTM model with 91.43% accuracy; analyzes up to 20 frames per video and returns real/fake probability distributions
- **Real-Time Extension UI** — Popup interface with animated confidence bars, server health monitoring, and compact mode support
- **Facebook Integration** — Content script detects and captures video frames directly from the Facebook feed
- **Bilingual Chatbot** — Intent-based NLP chatbot supporting English and Filipino (94.98% accuracy) with context-aware responses and full conversation history
- **Natural Language Generation** — Human-readable analysis summaries with confidence assessments and risk-level categorization
- **Secure API Backend** — JWT authentication, API key validation, rate limiting, CORS restrictions, input sanitization, and path traversal prevention
- **Optimized Inference** — Parallel frame decoding, smart frame sampling, face detection with stride optimization, and CUDA/CPU fallback support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | [Flask](https://flask.palletsprojects.com/) 3.0.3 |
| Deep Learning | [PyTorch](https://pytorch.org/) 2.9.0 · TorchVision 0.24.0 |
| Model Architecture | ResNeXt50 + Bidirectional LSTM |
| Computer Vision | OpenCV 4.10.0 · face-recognition 1.3.0 · Pillow 10.4.0 |
| NLP / Chatbot | Sentence Transformers (embedding-based intent classification) |
| Authentication | PyJWT 2.10.1 · API Key headers |
| Production Server | Waitress 3.0.0 (WSGI) |
| Browser Extension | Vanilla JavaScript · Manifest V3 (Chrome & Firefox) |
| Client-Side ML | TensorFlow.js · Universal Sentence Encoder |
| Language | Python 3.8+ · JavaScript (ES2022) |

---

## Getting Started

### Prerequisites

Ensure you have the following installed before proceeding:

- **Python** `3.8+`
- **pip** (bundled with Python)
- **Google Chrome** or **Firefox**

---

### Backend Setup

**1. Clone the repository**

```bash
git clone https://github.com/gwenndestura/VeriFeed.git
```

**2. Navigate into the project directory**

```bash
cd VeriFeed
```

**3. Create and activate a virtual environment**

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Unix / macOS
source venv/bin/activate
```

**4. Install dependencies**

```bash
pip install -r requirements.txt
```

**5. Configure environment variables**

Create a `.env` file inside the `backend/` folder:

```env
FLASK_SECRET_KEY=your_jwt_signing_secret
API_KEY=your_api_authentication_key
ADMIN_API_KEY=your_admin_operations_key
FLASK_DEBUG=False
MAX_CONTENT_MB=100
RATE_LIMIT_PER_MINUTE=20
RATE_LIMIT_PER_HOUR=200
RATE_LIMIT_PER_DAY=1000
PORT=5000
```

**6. Start the backend server**

```bash
python backend/src/app.py
```

The server runs at `http://localhost:5000`.

---

### Extension Installation

**1. Open your browser's extension management page**

- **Chrome:** `chrome://extensions/`
- **Firefox:** `about:addons`

**2. Enable Developer Mode** (toggle in the top-right corner)

**3. Click "Load unpacked"** and select the `extension/` folder

The VeriFeed icon will appear in your browser toolbar. Navigate to Facebook to start detecting deepfake videos.

---

### Alternative Deployment

| Method | File |
|---|---|
| Docker | `backend/Dockerfile` |
| Heroku | `backend/Procfile` |
| Windows | `backend/start.bat` |
| Unix / Linux | `backend/start.sh` |

---

## Project Structure

```
VeriFeed/
├── backend/
│   ├── src/
│   │   ├── app.py                    # Main Flask API application
│   │   └── keys.py                   # Configuration keys
│   ├── models/
│   │   └── model_acc_91.43_...pt     # Trained PyTorch model (91.43% accuracy)
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables (not committed)
│   ├── Dockerfile                    # Docker deployment config
│   ├── Procfile                      # Heroku deployment config
│   ├── start.bat                     # Windows startup script
│   └── start.sh                      # Unix startup script
│
├── extension/
│   ├── manifest.json                 # Manifest V3 extension config
│   ├── popup.html                    # Extension popup UI
│   ├── scripts/
│   │   ├── popup.js                  # Popup logic and UI state
│   │   ├── background.js             # Background service worker
│   │   ├── content.js                # Facebook page video integration
│   │   ├── auth.js                   # Authentication and API communication
│   │   ├── nlp-chatbot.js            # Chatbot integration
│   │   └── nlg.js                    # Natural Language Generation
│   ├── styles/
│   │   └── styles.css                # Extension styling
│   └── assets/
│       └── VeriFeed-Logo.png         # Extension icon and logo
│
├── nlptraining/                      # NLP chatbot training pipeline
├── deepfake_detection/               # Deepfake detection research module
├── dfdc_repo/                        # DFDC dataset and training repo
├── chatbot_model_best.pkl            # Trained chatbot model (94.98% accuracy)
├── best_model_summary.json           # Model metadata
├── training_history.png              # Training performance visualization
└── requirements.txt                  # Root-level Python requirements
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Server health check |
| POST | `/auth/token` | API Key | Generate JWT token |
| POST | `/predict` | JWT | Analyze frames → prediction result |
| POST | `/frame_analyze` | JWT | Alternative prediction endpoint |
| POST | `/api/nlp/question` | JWT | Bilingual chatbot Q&A |
| GET | `/model/info` | JWT | Retrieve model metadata |
| POST | `/model/reload` | Admin Key | Hot-reload the model |

**Sample `/predict` request:**

```json
{
  "frames": ["base64_frame_1", "base64_frame_2", "..."]
}
```

**Sample response:**

```json
{
  "prediction": "FAKE",
  "confidence": 87.5,
  "real_probability": 12.5,
  "fake_probability": 87.5,
  "faces_analyzed": 20,
  "frames_processed": 60,
  "processing_time": 2.3
}
```

---

## Development Team

| Name | Role |
|---|---|
| Princess Gwenn A. Destura | Full-stack Developer |
| Christina M. Esico | Frontend Developer |
| Angel Vhea P. Melindo | Backend Developer |

---

<div align="center">
  <sub>For questions and support, reach us at verifeedofficial@gmail.com</sub>
</div>
