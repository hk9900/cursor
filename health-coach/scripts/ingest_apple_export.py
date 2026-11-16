#!/usr/bin/env python3
"""Ingest Apple Health export.zip into docs/data.js dietary series.

Usage:
  python3 health-coach/scripts/ingest_apple_export.py /path/to/export.zip
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path
from xml.etree.ElementTree import iterparse

REPO = Path(__file__).resolve().parents[2]
DATA_JS = REPO / "docs" / "data.js"
SUMMARY = REPO / "health-coach" / "apple-latest.json"
CUT = "2026-09-23"
TYPES = {
    "HKQuantityTypeIdentifierDietaryEnergyConsumed": "kcal",
    "HKQuantityTypeIdentifierDietaryProtein": "p",
    "HKQuantityTypeIdentifierDietaryCarbohydrates": "c",
    "HKQuantityTypeIdentifierDietaryFatTotal": "f",
    "HKQuantityTypeIdentifierBodyMass": "kg",
}


def extract_xml(zpath: Path, out: Path) -> Path:
    out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zpath) as z:
        member = next((n for n in z.namelist() if n.replace("\\", "/").endswith("export.xml")), None)
        if not member:
            raise SystemExit("export.xml not found in zip")
        z.extract(member, out)
        return out / member.replace("\\", "/")


def parse_daily(xml_path: Path):
    daily = defaultdict(lambda: {"kcal": 0.0, "p": 0.0, "c": 0.0, "f": 0.0})
    weights = []
    for _event, elem in iterparse(str(xml_path), events=("end",)):
        if elem.tag != "Record":
            elem.clear()
            continue
        t = elem.get("type")
        if t not in TYPES:
            elem.clear()
            continue
        start = elem.get("startDate") or ""
        if start[:10] < CUT:
            elem.clear()
            continue
        d = start[:10]
        val = float(elem.get("value"))
        key = TYPES[t]
        if key == "kg":
            weights.append({"date": d, "kg": round(val, 2), "source": elem.get("sourceName") or ""})
        else:
            daily[d][key] += val
        elem.clear()
    return daily, weights


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    zpath = Path(sys.argv[1])
    xml = extract_xml(zpath, Path("/tmp/apple-ingest"))
    daily, weights = parse_daily(xml)
    hc = json.loads(re.match(r"^window\.HC = (\{.*\});\s*$", DATA_JS.read_text(), re.S).group(1))

    burn_by = {}
    for i, d in enumerate(hc.get("export", {}).get("days", [])):
        burn_by[d] = hc["export"]["calories"][i]
    for i, lab in enumerate(hc.get("fitbitDays", [])):
        burn_by.setdefault(f"2026-{lab}", hc["burn"][i])

    days = sorted(daily)
    energy_days = [f"{d[5:7]}-{d[8:]}" for d in days]
    intake = [int(round(daily[d]["kcal"])) for d in days]
    protein = [int(round(daily[d]["p"])) for d in days]
    carbs = [int(round(daily[d]["c"])) for d in days]
    fat = [int(round(daily[d]["f"])) for d in days]
    burn = [burn_by.get(d) for d in days]
    deficit = [(burn[i] - intake[i]) if burn[i] is not None else None for i in range(len(days))]
    today = date.today().isoformat()

    hc["energyDays"] = energy_days
    hc["intake"] = intake
    hc["proteinApple"] = protein
    hc["carbsApple"] = carbs
    hc["fatApple"] = fat
    hc["burnOnIntake"] = burn
    hc["deficit"] = deficit
    hc["meta"]["appleThrough"] = days[-1]
    hc["meta"]["appleIngested"] = today
    hc["meta"]["siteUpdated"] = today
    hc["apple"] = {
        "source": "Apple Health export.xml · Dietary* (Shortcuts Food Log)",
        "through": days[-1],
        "ingested": today,
        "days": days,
        "kcal": intake,
        "p": protein,
        "c": carbs,
        "f": fat,
        "burn": burn,
        "deficit": deficit,
        "weights": weights,
        "nDays": len(days),
    }
    DATA_JS.write_text("window.HC = " + json.dumps(hc, indent=2, ensure_ascii=False) + ";\n")

    summary = {
        "ingested": today,
        "through": days[-1],
        "nDays": len(days),
        "avgIntake": round(sum(intake) / len(intake), 1),
        "avgProtein": round(sum(protein) / len(protein), 1),
        "weights": weights,
        "last7": [
            {
                "date": days[i],
                "kcal": intake[i],
                "p": protein[i],
                "c": carbs[i],
                "f": fat[i],
                "burn": burn[i],
                "def": deficit[i],
            }
            for i in range(-7, 0)
        ],
    }
    SUMMARY.write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
