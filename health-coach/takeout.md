# Google Takeout → Health Coach (monthly)

Hassan exports **Google Takeout slim** monthly (Fitbit / Google Health). Attach the zip in chat (keep under **4 MB** web limit, or split). Coach must ingest the same turn.

## What to include in the slim zip

Prefer:
- `Takeout/Google Health/Physical Activity_GoogleData/` (Steps, Calories, Active Energy, Distance, Active Minutes, AZM, Activity Level, RHR, Weight, HR zones)
- `Takeout/Google Health/Health Fitness Data_GoogleData/` (`UserSleeps_*`, `UserSleepScores_*`, `UserExercises_*`)

Strip huge raw Heart Rate second-by-second files if over the attach limit.

## Ingest

```bash
python3 health-coach/scripts/ingest_takeout_slim.py /path/to/takeout-slim.zip
```

Updates:
- `docs/data.js` → `fitbitDays`, `burn`, `active`, `steps`, `rhr`, `sleep`, `export.*`, `meta.fitbitThrough`, `meta.takeoutIngested`
- `health-coach/fitbit-latest.json` → quick coach summary

Then: refresh `profile.md` Fitbit-through line, commit + push `cursor/health-coach` (Pages deploy).

## Aggregation rules (locked)

- **Burn / active energy:** max value per minute timestamp, then sum (avoids multi-stream double-count in newer Takeouts).
- **Steps (dashboard):** sum **all** sources (Fitbit Air + Phone Health Kit).
- **Steps (`export.steps`):** Fitbit Air only.
- **Distance km:** Fitbit Air meters ÷ 1000.
- **Cut window:** from **2026-09-23**; drop trailing incomplete days (burn &lt; ~1800 or near-zero steps).
- **2026-09-23 burn:** device onboarded midday — keep full-day seed **2897 / active 367** if CSV is partial.
- Never invent days past `meta.fitbitThrough`.

## Coach use

Prefer Takeout burn/steps over Notes TILSD when they disagree. Still: **never eat Fitbit burn back**; treat absolute burn ~10–15% soft on walk weeks (`calibration.md`).
