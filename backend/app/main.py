from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class Issue(BaseModel):
    id: str
    severity: Literal["high", "medium", "low"]
    amount: str
    title: str
    detail: str
    status: Literal["open", "resolved"] = "open"


issues = [
    Issue(
        id="menu-001",
        severity="high",
        amount="-$4,500/yr",
        title="3 items missing from both digital menus",
        detail="Bacon, avocado, halloumi + 7 more",
    ),
    Issue(
        id="menu-002",
        severity="medium",
        amount="-$2,800/yr",
        title="Large coffee size not available on Skip",
        detail="Counter $4.80 / $5.50",
    ),
    Issue(
        id="menu-003",
        severity="medium",
        amount="-$2,250/yr",
        title="Fillet Steak cheaper on Uber Eats",
        detail="Counter $27.00 · Uber Eats $26.00",
    ),
]

app = FastAPI(title="Mise API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:19006"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/issues", response_model=list[Issue])
def list_issues() -> list[Issue]:
    return [issue for issue in issues if issue.status == "open"]


@app.patch("/api/v1/issues/{issue_id}/resolve", response_model=Issue)
def resolve_issue(issue_id: str) -> Issue:
    for issue in issues:
        if issue.id == issue_id:
            issue.status = "resolved"
            return issue
    raise ValueError(f"Issue {issue_id} was not found")
