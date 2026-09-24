---
name: food-log
description: >
  Estimate calories/macros from Hassan’s meal photos using his recipe book,
  household history, and food knowledge; then output a one-liner plus a
  tappable shortcuts:// Food Log link for Apple Health. Use whenever the
  user shares a food photo, asks to log a meal, estimate calories/macros,
  or run the Food Log / Health Coach meal workflow.
---

# Food Log (Health Coach)

## When this skill applies

User sends a **meal photo**, describes a plate, or asks to **log / estimate** food for Apple Health via the **Food Log** Shortcut.

## Context to load first

1. Read `/cursor/stores/self/artifacts/health-coach-profile.md` if present (body, diet rules, labs, logging format).
2. Read any recipe cheat sheet under `health-coach/` in the repo (e.g. `health-coach/recipes.md`, `health-coach/profile.md`).
3. Use prior meal history in the thread.
4. Prefer **his kitchen defaults** (Pakistani home cooking, oil ~2 spoons/pot shared, roti/rice habits) over generic restaurant DB entries.
5. Optionally use web search for unfamiliar dishes — still adjust to **his portion and oil**.

## Workflow

### 1. Analyze the photo
- Identify dish(es), sides, visible oil/sheen, starch (roti vs rice), protein, fried toppings.
- Decide if the photo is **his plate** vs a **shared pot** (utensils, multiple forks, serving spoon in communal bowl).

### 2. Ask questions (max 1–3) before finalizing
Only ask what changes the number. Examples:
- Finished the whole bowl/plate?
- Roti: normal or big (~2-ball)? Count?
- Rice: flat vs heaped; 1 plate or more?
- Extra oil / toppings / raita / chai with this meal?
- Which recipe from the book (if ambiguous)?

If the user already answered in-thread, **do not re-ask**.

### 3. Estimate
- Produce **kcal, protein g, carbs g, fat g** for **what he ate**.
- Weight toward recipe book + household oil/starch rules when available.
- State confidence as a **percentage out of 100**, e.g. `85–90% sure` (not ±kcal bands).
  - Recipe book + clear answers: often **85–95% sure**
  - Photo + answers, no recipe: often **75–85% sure**
  - Photo only / ambiguous: often **60–75% sure**

### 4. Agree, then deliver (required output shape)

Keep the final reply **short**. After numbers are settled:

**One-liner** (plain text, exact pipes and spaces):
```
Food Log | {Dish name} | {kcal} | {protein} | {carbs} | {fat}
```

**Confidence** on the next line, e.g. `75–80% sure`

**Tappable link** (markdown) — Shortcut name must be exactly `Food Log`:
```
[Log to Health](shortcuts://run-shortcut?name=Food%20Log&input=text&text={URL_ENCODED_ONE_LINER})
```

URL-encode the one-liner for `text=` (` ` → `%20`, `|` → `%7C`).

Example final block:
```
Food Log | Chicken biryani | 820 | 35 | 80 | 35
75–80% sure

[Log to Health](shortcuts://run-shortcut?name=Food%20Log&input=text&text=Food%20Log%20%7C%20Chicken%20biryani%20%7C%20820%20%7C%2035%20%7C%2080%20%7C%2035)
```

### 5. Do NOT
- Auto-open the link (impossible from cloud chat).
- Use `sms:` compose links as the primary path (user rejected the compose sheet).
- Override numbers if the user pastes a logged Health/Bevel entry — **accept as-is** unless they ask for a second opinion.
- Dump long tables in the final log message; keep analysis brief, final log block clean.

## Shortcut contract (user phone)

- Shortcut name: **Food Log**
- Input: text (the one-liner)
- Split by `|`
- Index **3** = kcal → Dietary Energy (Cal)
- Index **4** = protein (g)
- Index **5** = carbs (g)
- Index **6** = fat (g)
- Index **2** = dish name (optional; Health may ignore)

## SMS backup only

If shortcuts:// fails, plain one-liner can be sent to **+351926194305** (Message automation). Prefer shortcuts://.

## Recipe training

When the user shares a recipe book, update `health-coach/` cheat sheets and the store profile so later photo estimates tighten toward ±15–25%.
