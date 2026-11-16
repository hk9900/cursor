#!/usr/bin/env python3
"""Ingest Hassan Google Takeout slim zip into docs/data.js Fitbit series.

Usage:
  python3 health-coach/scripts/ingest_takeout_slim.py /path/to/takeout-slim.zip

Expects Takeout/Google Health/Physical Activity_GoogleData + Health Fitness Data_GoogleData.
Writes: docs/data.js (fitbitDays/burn/active/steps/rhr/sleep/export) and health-coach/fitbit-latest.json
"""
from __future__ import annotations
import csv, json, re, sys, zipfile
from collections import defaultdict
from datetime import datetime, date, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

REPO = Path(__file__).resolve().parents[2]
DATA_JS = REPO / "docs" / "data.js"
SUMMARY = REPO / "health-coach" / "fitbit-latest.json"
LISBON = ZoneInfo("Europe/Lisbon")
CUT_START = date(2026, 9, 23)
HEIGHT_M = 1.803


def day_key(ts: str) -> str:
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(LISBON).date().isoformat()


def parse_dt(ts: str):
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(LISBON)


def extract_zip(zpath: Path, out: Path) -> Path:
    out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            name = info.filename.replace("\\", "/")
            dest = out / name
            if info.is_dir() or name.endswith("/"):
                dest.mkdir(parents=True, exist_ok=True)
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(z.read(info))
    # find Takeout root
    cands = list(out.rglob("Physical Activity_GoogleData"))
    if not cands:
        raise SystemExit("Physical Activity_GoogleData not found in zip")
    return cands[0].parent.parent  # Google Health -> Takeout


def read_csvs(folder: Path, pattern: str):
    for f in sorted(folder.glob(pattern)):
        with f.open(newline="") as fh:
            yield from csv.DictReader(fh)


def sum_max_per_ts(folder, pattern, value_key):
    by_day_ts = defaultdict(dict)
    for row in read_csvs(folder, pattern):
        ts = row["timestamp"]
        d = day_key(ts)
        if date.fromisoformat(d) < CUT_START:
            continue
        v = float(row[value_key])
        prev = by_day_ts[d].get(ts)
        by_day_ts[d][ts] = v if prev is None else max(prev, v)
    return {d: sum(m.values()) for d, m in by_day_ts.items()}


def ingest(takeout_root: Path):
    PA = takeout_root / "Google Health" / "Physical Activity_GoogleData"
    HF = takeout_root / "Google Health" / "Health Fitness Data_GoogleData"
    if not PA.exists():
        raise SystemExit(f"missing {PA}")

    steps = defaultdict(lambda: defaultdict(int))
    for row in read_csvs(PA / "Steps", "steps_*.csv"):
        d = day_key(row["timestamp"])
        if date.fromisoformat(d) < CUT_START:
            continue
        v = int(float(row["steps"]))
        steps[d][row["data source"]] += v
        steps[d]["ALL"] += v

    cals = sum_max_per_ts(PA / "Calories", "calories_*.csv", "calories")
    ae = sum_max_per_ts(PA / "Active Energy Burned", "active_energy_burned_*.csv", "Kilocalories")

    dist_m = defaultdict(lambda: defaultdict(float))
    for row in read_csvs(PA / "Distance", "distance_*.csv"):
        d = day_key(row["timestamp"])
        if date.fromisoformat(d) < CUT_START:
            continue
        dist_m[d][row["data source"]] += float(row["distance"])

    am_ts = defaultdict(lambda: defaultdict(lambda: [0, 0, 0]))
    for row in read_csvs(PA / "Active Minutes", "active_minutes_*.csv"):
        d = day_key(row["timestamp"])
        if date.fromisoformat(d) < CUT_START:
            continue
        ts = row["timestamp"]
        vals = [int(float(row["light"] or 0)), int(float(row["moderate"] or 0)), int(float(row["very"] or 0))]
        cur = am_ts[d][ts]
        am_ts[d][ts] = [max(cur[i], vals[i]) for i in range(3)]
    am = {}
    for d, tmap in am_ts.items():
        L = M = V = 0
        for Lmv in tmap.values():
            L += Lmv[0]; M += Lmv[1]; V += Lmv[2]
        am[d] = {"light": L, "moderate": M, "very": V}

    azm_ts = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for row in read_csvs(PA / "Active Zone Minutes", "active_zone_minutes_*.csv"):
        d = day_key(row["timestamp"])
        if date.fromisoformat(d) < CUT_START:
            continue
        z = row["heart rate zone"]
        v = int(float(row["total minutes"]))
        ts = row["timestamp"]
        azm_ts[d][ts][z] = max(azm_ts[d][ts][z], v)
    azm = defaultdict(lambda: defaultdict(int))
    for d, tmap in azm_ts.items():
        for zones in tmap.values():
            for z, v in zones.items():
                azm[d][z] += v

    sed_ts = defaultdict(set)
    for row in read_csvs(PA / "Activity Level", "activity_level_*.csv"):
        d = day_key(row["timestamp"])
        if date.fromisoformat(d) < CUT_START:
            continue
        if row["level"] == "SEDENTARY":
            sed_ts[d].add(row["timestamp"])
    sed = {d: len(s) for d, s in sed_ts.items()}

    hrz_ts = defaultdict(lambda: defaultdict(set))
    for row in read_csvs(PA / "Time In Heart Rate Zone", "time_in_heart_rate_zone_*.csv"):
        d = day_key(row["timestamp"])
        if date.fromisoformat(d) < CUT_START:
            continue
        z = row.get("heart rate zone type") or ""
        if z:
            hrz_ts[d][z].add(row["timestamp"])
    hrz = {d: {z: len(s) for z, s in zm.items()} for d, zm in hrz_ts.items()}

    rhr = {}
    with open(PA / "Daily Resting Heart Rate" / "daily_resting_heart_rate.csv") as fh:
        for row in csv.DictReader(fh):
            d = day_key(row["timestamp"])
            if date.fromisoformat(d) >= CUT_START:
                rhr[d] = round(float(row["beats per minute"]), 1)

    wmap = {}
    with open(PA / "Weight" / "weight.csv") as fh:
        for row in csv.DictReader(fh):
            kg = float(row["weight grams"]) / 1000.0
            d = day_key(row["timestamp"])
            wmap[d] = {"date": d, "kg": round(kg, 1), "bmi": round(kg / (HEIGHT_M ** 2), 2)}
    fitbit_weights = [wmap[k] for k in sorted(wmap)]

    by_wake = {}
    sleep_file = next(HF.glob("UserSleeps_*.csv"), None)
    score_file = next(HF.glob("UserSleepScores_*.csv"), None)
    if sleep_file:
        with sleep_file.open() as fh:
            for row in csv.DictReader(fh):
                asleep = int(float(row["minutes_asleep"] or 0))
                if asleep < 120:
                    continue
                end = parse_dt(row["sleep_end"]).date().isoformat()
                s = {"wake": end, "asleep": asleep, "awake": int(float(row["minutes_awake"] or 0)), "id": row["sleep_id"]}
                if end not in by_wake or asleep > by_wake[end]["asleep"]:
                    by_wake[end] = s
    scores = {}
    if score_file:
        with score_file.open() as fh:
            for row in csv.DictReader(fh):
                scores[row["sleep_id"]] = {
                    "overall": round(float(row["overall_score"]), 1) if row["overall_score"] else None,
                    "deep": int(float(row["deep_sleep_minutes"])) if row["deep_sleep_minutes"] else None,
                }

    exercises = []
    ex_file = next(HF.glob("UserExercises_*.csv"), None)
    if ex_file:
        with ex_file.open() as fh:
            for row in csv.DictReader(fh):
                if row.get("deletion_reason") not in ("UNSPECIFIED", "", None):
                    continue
                start = parse_dt(row["exercise_start"])
                if start.date() < CUT_START:
                    continue
                end = parse_dt(row["exercise_end"])
                mins = max(1, int(round((end - start).total_seconds() / 60)))

                def num(x):
                    try:
                        return int(float(x)) if x not in ("", None) else None
                    except Exception:
                        return None

                hour = start.hour % 12 or 12
                exercises.append({
                    "date": f"{start.month:02d}/{start.day:02d}/{str(start.year)[2:]} {hour}",
                    "name": row.get("activity_name") or "Workout",
                    "kcal": num(row.get("tracker_total_calories") or row.get("summary_calories_kcal") or row.get("manually_logged_total_calories")),
                    "minutes": mins,
                    "steps": num(row.get("tracker_total_steps") or row.get("summary_steps") or row.get("manually_logged_total_steps")),
                    "azm": num(row.get("summary_active_zone_minutes")),
                })

    END = None
    for d in sorted(cals.keys(), reverse=True):
        if cals[d] >= 1800 and steps[d]["ALL"] >= 200:
            END = date.fromisoformat(d)
            break
    if END is None:
        raise SystemExit("no complete Fitbit days found")

    days = []
    d = CUT_START
    while d <= END:
        days.append(d.isoformat())
        d += timedelta(days=1)

    fitbitDays = [f"{x[5:7]}-{x[8:]}" for x in days]
    burn = [int(round(cals.get(d, 0))) for d in days]
    active = [int(round(ae.get(d, 0))) for d in days]
    steps_all = [int(steps[d]["ALL"]) for d in days]
    steps_fb = [int(steps[d].get("Fitbit Air", 0)) for d in days]
    rhr_arr = [rhr.get(d) for d in days]
    distance_km = [round(dist_m[d].get("Fitbit Air", 0) / 1000.0, 2) for d in days]
    lightly = [am.get(d, {}).get("light", 0) for d in days]
    fairly = [am.get(d, {}).get("moderate", 0) for d in days]
    very = [am.get(d, {}).get("very", 0) for d in days]
    sedentary = [sed.get(d, 0) for d in days]
    azm_min = [azm[d].get("FAT_BURN", 0) + azm[d].get("CARDIO", 0) + azm[d].get("PEAK", 0) for d in days]
    zone1 = [float(hrz.get(d, {}).get("LIGHT", 0)) for d in days]
    zone2 = [float(hrz.get(d, {}).get("MODERATE", 0)) for d in days]
    zone3 = [float(hrz.get(d, {}).get("VIGOROUS", 0) + hrz.get(d, {}).get("PEAK", 0)) for d in days]
    below = [float(hrz.get(d, {}).get("OUT_OF_RANGE", 0)) for d in days]

    # Preserve known full-day burn for cut start (device onboarded midday 23 Sep)
    if days and days[0] == "2026-09-23" and burn[0] < 2500:
        burn[0] = 2897
        if active[0] < 300:
            active[0] = 367

    sleep_labels = []; sleep_asleep = []; sleep_deep = []; sleep_eff = []; sleep_row_objs = []; export_sleep = []
    for d in days:
        s = by_wake.get(d)
        if not s:
            continue
        sc = scores.get(s["id"], {})
        deep = sc.get("deep") or 0
        overall = sc.get("overall")
        eff = round(100.0 * s["asleep"] / max(1, s["asleep"] + s["awake"]), 1)
        lab = f"{d[5:7]}-{d[8:]}"
        sleep_labels.append(lab); sleep_asleep.append(s["asleep"]); sleep_deep.append(deep); sleep_eff.append(eff)
        sleep_row_objs.append({"d": lab, "asleep": s["asleep"], "deep": deep, "eff": eff, "score": overall})
        export_sleep.append({"date": d, "asleep": s["asleep"], "deep": deep, "efficiency": eff, "score": overall})

    text = DATA_JS.read_text()
    hc = json.loads(re.match(r"^window\.HC = (\{.*\});\s*$", text, re.S).group(1))
    old_vo2 = {v["date"]: v["vo2"] for v in hc.get("export", {}).get("vo2", [])}
    vo2 = [{"date": d, "vo2": old_vo2[d]} for d in days if d in old_vo2]
    today = date.today().isoformat()

    hc["meta"]["fitbitThrough"] = days[-1]
    hc["meta"]["takeoutIngested"] = today
    hc["meta"]["siteUpdated"] = today
    hc["fitbitDays"] = fitbitDays
    hc["burn"] = burn
    hc["active"] = active
    hc["steps"] = steps_all
    hc["rhr"] = rhr_arr
    hc["sleep"] = {"labels": sleep_labels, "asleep": sleep_asleep, "deep": sleep_deep, "efficiency": sleep_eff, "rows": sleep_row_objs}
    hc["export"] = {
        "days": days, "dayLabels": fitbitDays,
        "steps": steps_fb, "calories": burn, "distanceKm": distance_km,
        "veryActive": very, "fairlyActive": fairly, "lightlyActive": lightly, "sedentary": sedentary,
        "azmMinutes": azm_min, "rhr": rhr_arr,
        "zone1": zone1, "zone2": zone2, "zone3": zone3, "belowZone": below,
        "sleep": export_sleep, "vo2": vo2, "exercises": exercises, "fitbitWeights": fitbit_weights,
        "source": "Google Takeout slim",
        "through": days[-1],
        "note": "Calories/active energy use max-per-minute to avoid multi-stream double count.",
    }
    DATA_JS.write_text("window.HC = " + json.dumps(hc, indent=2, ensure_ascii=False) + ";\n")

    def avg(xs):
        xs = [x for x in xs if x is not None]
        return round(sum(xs) / len(xs), 1) if xs else None

    summary = {
        "ingested": today,
        "cutStart": str(CUT_START),
        "through": days[-1],
        "nDays": len(days),
        "avgBurn": avg(burn),
        "avgSteps": avg(steps_all),
        "avgActive": avg(active),
        "avgRhr": avg([x for x in rhr_arr if x]),
        "weights": fitbit_weights,
        "exercisesN": len(exercises),
        "sleepNights": len(sleep_labels),
    }
    SUMMARY.write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    zpath = Path(sys.argv[1])
    out = Path("/tmp/takeout-ingest")
    if out.exists():
        import shutil
        shutil.rmtree(out, ignore_errors=True)
    root = extract_zip(zpath, out)
    # root is Takeout/
    ingest(root)


if __name__ == "__main__":
    main()
