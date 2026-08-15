# MedGuide AI API Reference

Base URL:

```text
http://127.0.0.1:5000/api
```

## Public

### GET `/health`

Checks whether the backend is running.

## Authentication

### POST `/auth/register`

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "Demo@123"
}
```

### POST `/auth/login`

```json
{
  "email": "rahul@example.com",
  "password": "Demo@123"
}
```

Returns a JWT access token.

## Protected endpoints

Send:

```text
Authorization: Bearer <JWT>
```

### GET `/profile`

Returns the user's saved health profile.

### PUT `/profile`

```json
{
  "age": 45,
  "sex": "male",
  "weight_kg": 72,
  "conditions": ["diabetes", "hypertension"],
  "preferred_language": "te"
}
```

### POST `/health/reports/scan`

Multipart field:

```text
image=<diagnostic report image>
```

Runs OCR and extracts conservative condition-keyword hints.

### GET `/health/history`

Returns profile, recent medicine scans/analyses, and report scans.

### POST `/medicines/seed`

Loads the prototype medicine dataset into MongoDB.

### POST `/medicines/scan`

Multipart field:

```text
image=<medicine strip or prescription image>
```

Returns OCR text and the best medicine match.

### POST `/medicines/recognize`

```json
{
  "text": "METFORMIN 500 MG"
}
```

### GET `/medicines/<slug>`

Example:

```text
GET /medicines/metformin
```

### POST `/medicines/analyze`

```json
{
  "medicine_name": "metformin"
}
```

Returns:

- medicine information
- uses
- precautions
- common side effects
- profile-specific notes
- risk levels detected by the prototype rules
- patient-friendly explanation
- explanation engine
- prescription guidance
- disclaimer

### POST `/medicines/translate`

```json
{
  "text": "This medicine is commonly used to help control blood sugar.",
  "target_language": "te"
}
```

Supported prototype languages:

- `en`
- `te`
- `hi`

### POST `/medicines/speak`

```json
{
  "text": "This medicine helps control blood sugar.",
  "language": "en"
}
```

Returns an audio URL when TTS is enabled and network access is available.


## Prototype monetization touchpoints

These endpoints are intentionally demo-only. They create a request record but do not process payments or real bookings.

### POST `/actions/consult-doctor`

```json
{
  "specialty": "General Physician"
}
```

### POST `/actions/book-test`

```json
{
  "test_name": "HbA1c"
}
```

### POST `/actions/order-medicine`

```json
{
  "medicine_name": "Metformin 500 mg"
}
```
