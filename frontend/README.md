# MedGuide AI — Frontend

A static, dependency-free frontend for the MedGuide AI Flask backend. No build step —
plain HTML, CSS, and JavaScript, organized into pages and shared modules.

```text
frontend/
├── index.html          Landing page + login / register
├── dashboard.html       Profile summary, quick actions, recent activity
├── scan.html            Medicine scan (image or text) + diagnostic report scan
├── analysis.html        Personalized breakdown, translate, read-aloud, next steps
├── profile.html         Health profile editor
├── history.html         Full activity timeline
├── css/
│   ├── tokens.css        Design tokens: color, type, spacing
│   ├── base.css           Reset + typography
│   └── components.css     Buttons, cards, forms, badges, nav, etc.
└── js/
    ├── api.js             Fetch wrapper + one function per backend endpoint
    ├── nav.js              Shared header/nav renderer
    ├── auth.js             Login / register page logic
    ├── dashboard.js
    ├── scan.js
    ├── analysis.js
    ├── profile.js
    └── history.js
```

## 1. Start the backend first

The frontend expects the Flask API at `http://127.0.0.1:5000/api`. Follow the backend's
own README to install dependencies and run it:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Confirm it's up:

```text
GET http://127.0.0.1:5000/api/health
```

**CORS:** the backend already includes `flask-cors` in `requirements.txt`. Make sure
CORS is enabled for `http://127.0.0.1:5500` (or whichever port you serve the frontend
from) in `app/__init__.py` / `app/config.py`, otherwise the browser will block requests.

**Seed demo data (optional but recommended for the hackathon demo):**

```bash
python seed_demo.py
```

## 2. Serve the frontend

This is a static site — any local web server works. Do not open the HTML files with
`file://`, since `fetch()` and `FormData` uploads behave inconsistently from the
filesystem in some browsers.

**Option A — Python (no install needed, uses the interpreter you already have):**

```bash
cd frontend
python3 -m http.server 5500
```

Then open **http://127.0.0.1:5500**.

**Option B — Node (if you have it installed):**

```bash
cd frontend
npx serve -l 5500
```

**Option C — VS Code:** install the "Live Server" extension, right-click
`index.html`, choose "Open with Live Server."

## 3. Demo walkthrough

1. Open `http://127.0.0.1:5500` → register (or log in with the pre-filled demo
   credentials if you've already registered `rahul@example.com`).
2. You'll land on the **Dashboard**. Click **Update profile** and save age, weight,
   conditions (e.g. `diabetes`, `hypertension`), and preferred language (`te` for
   Telugu).
3. Click **Scan a medicine**. Drop in a photo of a medicine strip, or type a name
   like `METFORMIN 500 MG` and click **Recognize**.
4. Click **Analyze for me** to see the full personalized breakdown: uses,
   precautions, side effects, personalized notes, risk badge, and plain-language
   explanation.
5. Use the **Translate** control to switch the explanation to Telugu or Hindi, and
   **Read aloud** to hear it spoken (requires `gTTS` + internet access on the
   backend).
6. Try **Consult a doctor / Book a related test / Order this medicine** — these hit
   the prototype monetization endpoints and only create a demo record.
7. Visit **History** to see the full timeline of scans.

## Configuring a different backend URL

If the backend isn't on `127.0.0.1:5000`, set this before the other scripts load, in
each HTML file's `<head>` (or add a small `config.js` and include it first):

```html
<script>window.MEDGUIDE_API_BASE = "http://your-host:port/api";</script>
```

## Notes

- All pages except `index.html` require a JWT in `localStorage` (set at login) — if
  it's missing, the page redirects back to `index.html`.
- Response field names are read defensively (`data.medicine_history || data.scans ||
  data.history`, etc.) since the exact backend JSON shape can evolve; if a section
  shows "Couldn't load…", check the browser console/network tab against
  `API_REFERENCE.md` and adjust the matching accessor in the relevant `js/*.js` file.
- This frontend does not diagnose, prescribe, or process real payments — it mirrors
  the backend's own safety boundary.
