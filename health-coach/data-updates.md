# Monthly wearable / Health data updates

Hassan sends **Apple Health `export.zip`** + **Fitbit/Google `With Data`** about once a month.

## What to extract

| Source | Prefer for |
|--------|------------|
| **Fitbit / Google** | Total burn, active burn, steps, AZM, sleep score, RHR, weight |
| **Apple Health** | Dietary Energy / Protein / Carbs / Fat from Food Log Shortcut; steps cross-check |

## After each upload
1. Recompute last 4 weeks: intake avg, burn avg, deficit, steps, weight delta
2. Update `weekly-metrics.md` + `profile.md` Energy section if BMR/TDEE shifted
3. Flag days with intake >> 1800 or protein << 130
4. Compare Apple food totals vs chat Food Log one-liners if mismatches appear

## Latest files received
- 2026-10-14: Fitbit `With Data.zip` + Apple `export.zip`
