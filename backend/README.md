# MedGuide AI — Prototype Backend

A clean Flask backend for the MedGuide AI hackathon prototype.

## Prototype flow

1. User registers / logs in.
2. User creates a personalized health profile.
3. User uploads a diagnostic report or enters history manually.
4. User uploads/scans a medicine strip or physician prescription, or enters a medicine name.
5. OCR extracts text from uploaded images.
6. Medicine recognition matches the extracted text against the local prototype medicine database.
7. The backend retrieves medicine information.
8. A personalization/correlation layer checks the medicine information against the user's stored health conditions.
9. A patient-friendly explanation is generated.
10. The explanation can be translated to a supported regional language.
11. Optional text-to-speech audio can be generated.
12. The response includes a medical-information disclaimer.

This backend deliberately does NOT independently prescribe, change, or recommend a dosage. Dosage is treated as prescription information and the user is directed to follow their physician's instructions.

## Tech stack

- Python 3.11+ / 3.12
- Flask
- MongoDB via PyMongo
- JWT authentication
- Pillow + Tesseract OCR
- Local JSON medicine dataset for the hackathon prototype
- Optional gTTS for voice output
- CORS
- pytest

## Folder structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── medicine.py
│   │   └── health.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── ocr_service.py
│   │   ├── medicine_service.py
│   │   ├── personalization_service.py
│   │   ├── language_service.py
│   │   └── speech_service.py
│   └── utils/
│       ├── decorators.py
│       └── responses.py
├── data/
│   └── medicines.json
├── uploads/
├── tests/
│   └── test_health.py
├── .env.example
├── .gitignore
├── requirements.txt
├── run.py
└── seed_demo.py
```

## 1. Create the environment

### Windows PowerShell

```powershell
cd backend
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Linux / WSL

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Install Tesseract OCR

Tesseract is an external executable; installing the Python package alone is not enough.

### Ubuntu / WSL

```bash
sudo apt update
sudo apt install -y tesseract-ocr
tesseract --version
```

### Windows

Install Tesseract OCR and add its installation directory to PATH. Then verify:

```powershell
tesseract --version
```

If Tesseract is not on PATH, set:

```env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

## 3. Configure environment

Copy:

```text
.env.example -> .env
```

At minimum:

```env
SECRET_KEY=replace-with-a-long-random-value
JWT_SECRET_KEY=replace-with-another-long-random-value
MONGO_URI=mongodb://localhost:27017/
MONGO_DB=medguide_ai
```

For MongoDB Atlas, use your Atlas connection string instead.

## 4. Start MongoDB

Use either a local MongoDB server or MongoDB Atlas.

The app creates collections automatically when data is first written.

## 5. Run

```bash
python run.py
```

Default:

```text
http://127.0.0.1:5000
```

Health check:

```text
GET /api/health
```

## 6. Demo API flow

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "Demo@123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "rahul@example.com",
  "password": "Demo@123"
}
```

Copy the returned JWT.

For protected routes:

```http
Authorization: Bearer <TOKEN>
```

### Save health profile

```http
PUT /api/profile
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "age": 45,
  "sex": "male",
  "weight_kg": 72,
  "conditions": ["diabetes", "hypertension"],
  "preferred_language": "te"
}
```

### Recognize a medicine by name

```http
POST /api/medicines/recognize
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "text": "METFORMIN 500 MG"
}
```

### Get medicine information

```http
GET /api/medicines/metformin
Authorization: Bearer <TOKEN>
```

### Personalized analysis

```http
POST /api/medicines/analyze
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "medicine_name": "metformin"
}
```

### OCR upload

```http
POST /api/medicines/scan
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

image=<medicine image>
```

### Translate

```http
POST /api/medicines/translate
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "text": "This medicine is commonly used to help control blood sugar.",
  "target_language": "te"
}
```

### Text-to-speech

```http
POST /api/medicines/speak
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "text": "This medicine helps control blood sugar.",
  "language": "en"
}
```

If `gTTS` is installed and internet is available, the response contains an audio URL.

## 7. Suggested hackathon demo

Use one prepared medicine image and one demo profile.

Example profile:

- Age: 45
- Weight: 72 kg
- Conditions: diabetes, hypertension
- Language: Telugu

Demo:

```text
Profile
  ↓
Scan medicine
  ↓
OCR
  ↓
Medicine recognition
  ↓
Medicine information
  ↓
Personalized health check
  ↓
Simple explanation
  ↓
Telugu translation
  ↓
Voice
```

## Safety boundary

This is a hackathon prototype for medication information and accessibility. It is not a diagnostic or prescribing system.

Do not present prototype output as a doctor's diagnosis or as an instruction to start, stop, or change medication. For a real deployment, replace the prototype JSON medicine data with an appropriate structured/licensed drug-information source, implement consent and strong health-data protection, and complete applicable regulatory/compliance review.


## Prototype monetization endpoints

The proposal includes doctor consultation, diagnostic-test booking, and pharmacy ordering as monetization touchpoints. The backend includes demo-only endpoints:

- `POST /api/actions/consult-doctor`
- `POST /api/actions/book-test`
- `POST /api/actions/order-medicine`

They create a demonstration request record in MongoDB. They do not process real payments, prescriptions, pharmacy orders, or clinical appointments.
