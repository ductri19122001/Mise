import csv
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class MenuItem:
    channel: str
    name: str
    price: float


def read_menu_csv(path: Path) -> list[MenuItem]:
    """Read a normalized menu export before it enters the reconciliation engine."""
    with path.open(newline="", encoding="utf-8-sig") as csv_file:
        reader = csv.DictReader(csv_file)
        return [
            MenuItem(
                channel=row["channel"].strip(),
                name=row["name"].strip(),
                price=float(row["price"]),
            )
            for row in reader
        ]
