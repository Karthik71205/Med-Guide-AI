# Mediguide-AI — Patient-first UI

This package is a UI redesign based on the uploaded Mediguide-AI project structure.

## Structure

- HTML pages are separate files in the project root.
- All visual styling is in `css/style.css`.
- JavaScript is separated into individual files under `js/`.
- Existing API endpoint names and authentication/session behavior are preserved.
- The UI is designed around pharmacy, patient hospitality, medicine clarity and safety review.

## Pages

`index.html`, `login.html`, `register.html`, `dashboard.html`, `scan.html`,
`prescription.html`, `results.html`, `history.html`, `schemes.html`,
`subscription.html`, `profile.html`, `settings.html`.

## Important

The frontend still expects your backend at:

`http://127.0.0.1:5000/api`

If your backend is hosted elsewhere, update `API_BASE` in `js/api.js`.

This is a hackathon prototype and the medical-information disclaimer should remain visible.
