# Logging calibration (accuracy over feel-good)

Locked **1 Nov 2026 (W4)** after reconciling Notes deficit vs Sunday scale.  
Hassan asked for **accuracy, not flattering lows**. Update this file on every Sunday weekly log.

## Empirical finding (W1 → W4)

| Signal | Rating | Bias |
|--------|--------|------|
| Fitbit Air / Google Fit **total burn** | Direction strong · absolute soft | Likely **~10–15% high** on walk weeks |
| Food Log / Notes **intake** | Trend strong · absolute soft | Likely **~10–15% low** (oil + starch + “light” assumptions) |
| Notes **deficit** (burn − intake) | Poor as raw fat predictor | Face value ≈ **1.4×** fat-loss deficit over W1→W4 |

- W1→W4 scale: **−2.3 kg**. Notes deficit sum ≈ **25.6k kcal** → predicts **~3.3 kg** fat @ 7,700 kcal/kg.
- Implied true avg deficit ≈ **~840 kcal/day** vs Notes ≈ **~1,220**.
- W4 (no walks): burn dropped and loss slowed — Fitbit **direction** trusted; don’t eat burn back.

**Planning rule:** treat Notes deficit × **~0.65–0.75** when forecasting fat loss. Judge the cut by **scale + waist**, not deficit cosplay.

## Cook-fat default (locked 2 Nov 2026)

Hassan confirmed: **via spray for ~last 3 weeks** (≈ since mid-Oct).  
→ Default household sabzi / bhujia / gosht / qatliyan / shallow cook = **1 spray** (~5–10 kcal), **not** ladle oil — unless he says pot oil, tarka, baghaar, or “oily.”

## Active logging nudges (apply until next Sunday says otherwise)

Bias **up** on ambiguous energy **except** where spray default applies — never invent kcal on pack labels / weighed plain protein.

1. **Sabzi / bhujia / gosht / qatliyan (spray era):** use **spray fat only** (~5–10 kcal on the plate). Do **not** add 9–12 g oil. If he says oily / pot oil / tarka → then use mid–high cut-pot share.
2. **Unweighed medium house roti:** use **~120 kcal · P 4 · C 23 · F 3** (not 115). Big/2-ball still higher.
3. **Mayo / fusion sauces** (e.g. Singaporean rice): if unspecified → **moderate** drizzle; if “heavy” keep heavy; never default to “light” for feel-good.
4. **Photo-only plates:** honest fat range; spray default still applies for home sabzi unless sheen looks ladled.
5. **Labels + weighed AF chicken / egg whites / whey / bread / tostas:** use label math — **no** +10% pad.

## Sunday weekly-log procedure (mandatory)

When Hassan pastes a weekly Notes row (date · weight · waist · tapes · steps · intake · burn · deficit · motiv):

1. Append the row + derived block in `weekly-metrics.md`.
2. Compute for the week just closed:
   - `predicted_kg = week_deficit_kcal / 7700`
   - `actual_kg = prior_Sunday_weight − this_Sunday_weight` (positive = loss)
   - `ratio = predicted_kg / actual_kg` (if actual ≈ 0, note water/stall; don’t explode the nudge)
3. **Nudge intake logging for the coming week:**
   - `ratio ≥ 1.3` for this week **or** rolling 2-week ratio ≥ 1.3 → **tighten accuracy up** one step (more oil/starch on ambiguous plates). Record in “Nudge log” below.
   - `ratio ≤ 0.7` with clear loss → **ease** one step (were overshooting logs).
   - `0.7–1.3` → hold current nudges.
4. Note Fitbit burn vs walks (motiv / skipped walks) — if burn didn’t move when walks did, flag device oddity.
5. Sync `profile.md`, `docs/data.js`, site UI; state the active nudge briefly in the reply (one line).

## Nudge log

| From week | Ratio (pred/act) | Action | Active defaults |
|-----------|------------------|--------|-----------------|
| W4 review (1 Nov) | W1→W4 ≈ **1.4** | **Raise** oil/roti/sauce assumptions | Oil plate ~9–12 g · roti ~120 · mayo default moderate |
| **2 Nov correction** | User: spray × ~3 weeks | **Override oil default → spray** | Sabzi/gosht = **spray** · roti ~120 · mayo moderate · pot oil only if stated |

## Fitbit / burn (locked interpretation)

- Quiet / no-walk day: plan ~**2,550–2,650** true TDEE more than raw ~2,629 print
- Walk day: plan ~**2,800–2,900** more than raw ~3,000 print
- **Never** tell him to eat the burn back
- Prefer Fitbit burn over TILSD steps for activity ranking
