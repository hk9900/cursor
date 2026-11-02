---
name: food-log
description: >
  Estimate calories/macros from Hassan’s meal photos using his recipe book,
  household history, and food knowledge; then output a one-liner, confidence
  like 85–90% sure, and a tappable shortcuts:// Food Log link for Apple Health.
  Use whenever the user shares a food photo, asks to log a meal, estimate
  calories/macros, or run the Food Log / Health Coach meal workflow.
---

# Food Log (Health Coach)

## When this skill applies

User sends a **meal photo**, describes a plate, or asks to **log / estimate** food for Apple Health via the **Food Log** Shortcut.

## Context to load first

1. Read `/cursor/stores/self/artifacts/health-coach-profile.md` if present.
2. Read recipe / profile notes under `health-coach/` — especially `recipes.md`, `labels.md`, `profile.md`, and **`calibration.md`** (active accuracy nudges).
3. Use prior meal history in the thread (e.g. **Paltay salan = chickpea flour / besan**, not fish).
4. Prefer **his kitchen defaults** and **named recipes in recipes.md** over generic restaurant DB entries.
   - Oil default (**locked 2 Nov**): **1 spray** for household sabzi/gosht/bhujia (in use ~3 weeks). Use **1–1.5 tbsp/pot** only if he says pot oil / tarka / baghaar / oily. Older 2 dish spoons ≈ 5–7 tbsp — only if he reverts.
   - Starch: ≤**2 roti** or ≤**200 g** Qilla rice — not both (Ashirwad chakki atta).
5. Optionally web-search unfamiliar dishes — still adjust to **his portion and oil**.
6. After logging: mirror into `health-coach/food-log.md` **and** refresh `docs/data.js` for Pages (see `.cursor/rules/health-coach-site.mdc`).
7. On **Sunday weekly Notes / weigh-in paste**: run the reconciliation procedure in `health-coach/calibration.md` (nudge logging from scale vs deficit — mandatory).

## Workflow

### 1. Analyze the photo
- Identify dish(es), sides, oil/sheen, starch (roti vs rice), protein, toppings.
- Decide **his plate** vs **shared pot**.

### 2. Ask questions (max 1–3) before finalizing
Only ask what changes the number:
- Finished the whole bowl/plate?
- Roti: normal or big (~2-ball)? Count?
- Rice: flat vs heaped; how much?
- Extra gravy/oil / raita / chai with this meal?
- Confirm dish if ambiguous (trust user corrections, e.g. besan vs meat).

Do **not** re-ask what was already answered.

### 3. Estimate
- Output **kcal, protein g, carbs g, fat g** for **what he ate**.
- Weight toward recipe book + household rules when available.
- **Accuracy > feel-good.** Hassan locked this: do **not** lowball oil/starch/sauce to make the day look cleaner.
  - Apply **active nudges** from `health-coach/calibration.md` (oil plate share, roti default, mayo default).
  - Ambiguous desi fat → prefer **mid–high** of the honest range, not the optimistic floor.
  - Pack labels + weighed plain protein/AF chicken/egg whites → **exact label math** (no pad).
- Confidence must be **calibrated and honest**, not inflated to please the user.
  State as a short range + “sure” (out of 100). Prefer a *true* 75–80 over a flattering 90.
  Rough guide (not a ceiling to push toward):
    - Recipe book + clear answers + simple plate → often **85–92% sure**
    - Photo + answers, oil known, some portion ambiguity → often **78–88% sure**
    - Photo only / ambiguous / heavy oil-soak uncertainty → often **65–80% sure**
- Never use ±kcal bands in the final line.
- Do **not** raise % just because the user asks “why not 90?” — explain the uncertainty instead; only change % if your evidence actually improved.
- Do **not** lower kcal because “he’s on a cut” or to keep the day under 1,800 — log what he ate; the band is a target, not a reporting bias.

### 4. Deliver (required final shape)

Keep the final reply short. After numbers are agreed:

```
Food Log | {Dish name} | {kcal} | {protein} | {carbs} | {fat}
{low}–{high}% sure

[Log to Health](shortcuts://run-shortcut?name=Food%20Log&input=text&text={URL_ENCODED_ONE_LINER})
```

Rules:
- One-liner pipes/spaces exact: `Food Log | name | kcal | P | C | F`
- Next line: e.g. `75–80% sure` or `85–90% sure` (no “Accuracy:” prefix)
- Markdown link label: `Log to Health`
- Shortcut name exactly `Food Log`
- URL-encode one-liner for `text=` (` ` → `%20`, `|` → `%7C`, `+` → `%2B`, `(` → `%28`, `)` → `%29`)

Example:
```
Food Log | Paltay salan (besan) + 2 roti | 800 | 25 | 100 | 30
75–80% sure

[Log to Health](shortcuts://run-shortcut?name=Food%20Log&input=text&text=Food%20Log%20%7C%20Paltay%20salan%20(besan)%20%2B%202%20roti%20%7C%20800%20%7C%2025%20%7C%20100%20%7C%2030)
```

### 5. Do NOT
- Auto-open the link (not possible from cloud chat).
- Prefer `sms:` compose links (user rejected that UX).
- Override numbers if user pastes a Health/Bevel log — **accept as-is** unless they ask.
- Pad the final message with long tables.
- Tell him to eat Fitbit burn back. Fitbit total burn is directionally useful but likely **~10–15% high** on walk weeks (see `calibration.md`).
- Treat Notes deficit as literal fat loss — use × **~0.65–0.75** for forecasting; scale + waist judge the cut.

## Shortcut contract (user phone)

- Name: **Food Log**
- Input: text (the one-liner)
- Split by `|`
- Index **2** = dish name (ignored by Health)
- Index **3** = kcal → Dietary Energy (Cal)
- Index **4** = protein (g)
- Index **5** = carbs (g)
- Index **6** = fat (g)

## SMS backup only

If shortcuts:// fails: send the plain one-liner to **+351926194305**. Prefer shortcuts://.

## Recipe training

When user shares a recipe book, update `health-coach/recipes.md` + store profile so confidence can rise into the **85–95% sure** band.
