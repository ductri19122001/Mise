# Mise

Mise is a phone-first restaurant menu reconciliation prototype. It helps an owner or manager review inconsistencies across Counter, Uber Eats, and Skip.

The current repository contains the UI prototype and the first REST API boundary. CSV scanning, reconciliation rules, PostgreSQL persistence, and forecasting are intentionally not connected yet.

## Prerequisites

- Node.js 20 or newer
- npm
- Python 3.11 or newer for the optional API
- Expo Go on a phone if testing the native preview

## Run the UI prototype

From the repository root:

```powershell
npm install
npm run web -- --port 8082
```

Open `http://localhost:8082` in a browser. The web prototype has three visible screens:

- `Issues`: main review queue and workflow status
- `Margins`: channel price, commission, net revenue, and margin statistics
- `Ingredients`: menu items using an ingredient and their estimated margin

To preview on a phone with Expo Go:

```powershell
npx expo start
```

Scan the QR code from the same Wi-Fi network.

## Run the optional API

Open a second terminal:

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`; documentation is available at `http://localhost:8000/docs`.

The frontend currently uses local mock data. When API integration is enabled, set the API base URL before starting Expo:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:8000"
npm run web -- --port 8082
```

## Project structure

```text
src/app/              Expo Router screens
src/components/       Shared navigation and UI components
src/lib/api.ts        Typed REST client boundary
backend/app/main.py   FastAPI endpoints and temporary fixtures
backend/app/          CSV reconciliation entry point
```

## Planned workflow

```text
Capture CSV files
  -> Normalize menu data
  -> Reconcile Counter / Uber Eats / Skip
  -> Create issues and recommendations
  -> Owner reviews and approves
  -> Store snapshots and decisions in PostgreSQL
```

## Validation

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
```
