# Mise API

FastAPI REST API for the phone-first PWA. PostgreSQL is the system of record;
the current endpoints use in-memory fixtures so the UI can be developed before
the database schema is finalized.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. OpenAPI documentation is at
`http://localhost:8000/docs`.

## Planned PostgreSQL tables

- `menu_items`: normalized menu items by channel
- `menu_snapshots`: imported CSV snapshots and source metadata
- `issues`: detected inconsistencies and their review status
- `recommendations`: proposed fixes awaiting owner approval
