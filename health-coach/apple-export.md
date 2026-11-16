# Apple Health export → Health Coach

Hassan can send **export.zip** / **export 2.zip** from Apple Health. Attach in chat (zip may be ~10 MB; agent extracts `export.xml` only).

## Ingest

```bash
python3 health-coach/scripts/ingest_apple_export.py /path/to/export.zip
```

Updates:
- `docs/data.js` → `energyDays`, `intake`, `proteinApple`, `carbsApple`, `fatApple`, `burnOnIntake`, `deficit`, `apple.*`, `meta.appleThrough`
- `health-coach/apple-latest.json`

Burn/deficit join Fitbit series from the latest Google Takeout ingest (`export.calories`). Days after Fitbit-through show intake only (burn = null).

## Source of truth

Dietary Energy / Protein / Carbs / Fat come from **Shortcuts → Food Log** writes into Apple Health. They should track chat Food Logs closely; small deltas mean a missed tap or a Health edit.

## Coach use

- Prefer Apple daily intake for day-level charts.
- Prefer Notes Sunday week averages for weekly calibration.
- Still never eat Fitbit burn back.
