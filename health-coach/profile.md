# Health Coach — Hassan Khan profile

See also: Cursor skill `.cursor/skills/food-log/SKILL.md` for meal photo → estimate → shortcuts:// log.  
**Public dashboard:** https://hk9900.github.io/cursor/ (source `docs/` — keep in sync; see `.cursor/rules/health-coach-site.mdc`).

## Identity & body
- Male, born Aug 1991 (~35) · Lisbon
- Height **180.3 cm** (5′11″)
- **Current (22 Nov 2026 / W7):** **108.7 kg** · waist **45″** · chest 46.5″ · bicep R 14.5″ · thigh R 22″ · WHtR ≈ **0.63**
- Fitbit start **120 kg** (23 Sep) · W0 **115.9** (27 Sep) · W1 **113.5 / 48″** · W2 **112.9 / 46.5″** · W3 **111.5 / 45.5″** · W4 **111.2 / 45″** · W5 **109.9 / 45″** · W6 **109.5 / 45″**
- Past low ~88–92 kg after crash cut; regained ~1 year
- Phased targets: **105–108 → hold 92–95 → later 70–80** aspirational · **entering first band edge**

## Activity & lifestyle
- Fitbit Air (+ **monthly Google Takeout slim**) · Apple Health Food Log Shortcut
- Takeout ingest: `health-coach/takeout.md` + `scripts/ingest_takeout_slim.py` · last ingest **16 Nov 2026** · Fitbit series through **13 Nov 2026** (`meta.fitbitThrough`)
- Apple Health export: `health-coach/apple-export.md` + `scripts/ingest_apple_export.py` · last ingest **16 Nov 2026** · dietary through **16 Nov 2026** (`meta.appleThrough`) · avg intake ~**1,771** · avg protein ~**127 g** (Shortcuts Food Log)
- Sleep aim 6–8 h · lower back history · acidity (chai OK)
- Smokes · family heart-attack history · Coke Zero · fruit for sweet tooth
- Walks are the main NEAT lever (don’t eat Fitbit burn back) · W4 skipped · W5 restored · W6 weather skip · **W7 strong walks** (TILSD ~4.25k/day)
- Takeout week avgs (Lisbon, max-per-minute burn): **W5** burn ~**3,109** · steps ~**7,200** · **W6** (through 13 Nov) burn ~**2,707** · steps ~**3,200** — W7 Notes burn avg ~**3,072**

## Labs (Unilabs 28 Apr 2026)
- Total 219 · LDL 149 · HDL 30 · TG 198 · Glucose 94

## Energy (locked cut)
- **Priority stack (locked 8 Nov):** **1) calorie deficit** → **2) optimal protein** → **3) fats & carbs under check**
  - Never blow the deficit to “fix” macros. Prefer fruit / lean volume over more pizza-mayo when kcal is tight.
  - After kcal is safe, push protein toward **150–170 g** (whey / Light Café / chicken / GY) before adding starch or fat.
  - Fat **45–65 g** · carbs **120–190 g** are guardrails, not the main scoreboard.
- Food band **1,550–1,800 kcal/day** (prefer ~**1,650** like W2–W3 Notes avg)
- Protein **150–170 g** · Fat **45–65 g** · Carbs **120–190 g**
- BMR Mifflin ~**2,045** at 108.7 kg · Fitbit TDEE trend ~**2,600–3,100** (walks swing it)
- Notes weekly intake: W1 ~1,912 (5d) · W2 **1,648** · W3 **1,647** · W4 **1,714** · W5 **1,716** · W6 **1,543** · W7 **~1,522** (−1 meal)

## Accuracy calibration (locked 1 Nov 2026)
- **Accuracy > feel-good** on Food Logs — see `health-coach/calibration.md`
- Fitbit Air burn: trust **direction**; absolute likely **~10–15% high** on walk weeks · never eat burn back
- Food logs / Notes intake: trend good; absolute likely **~10–15% low** when oil/starch estimated
- Notes deficit ≈ **1.4×** over W1→W4; **W5 ≈ 0.89×**; **W6 ≈ 2.7×**; **W7 ≈ 1.76×** — forecast fat with deficit × **~0.65–0.75** on multi-week windows
- On every Sunday weekly paste: reconcile predicted vs actual kg and **nudge** logging defaults in `calibration.md`
- Active nudge now: sabzi/gosht **spray** · unweighed roti **~120 kcal** · mayo/fusion/pasta/burger sauce **mid–high** · unweighed salan/gravy **mid–high** (tightened 22 Nov)

## Diet defaults (locked Oct 2026)
- ~90% Pakistani household food · Ashirwad chakki atta · Qilla white rice
- **One starch per meal:** ≤**2 roti** **or** ≤**200 g** cooked rice — not both
- **Daal / lobia** = good staples (keep)
- **Tostas** rare OK · **Haleem** 1–2×/month
- Oil (current cut, **locked 2 Nov**): household cook = **1 spray** by default (in use ~3 weeks / since ~mid-Oct)  
  Pot oil **1–1.5 tbsp** only if he says pot/tarka/baghaar/oily. Older **2 dish spoons ≈ 5–7 tbsp** — never unless he reverts.
- Pot often feeds him + wife + toddler; leftovers common
- Chai 1×/day — **keep** sugar or Canderel as logged; milk = meio-gordo 1.6%
- Creep order now: **kcal / portions** > oil > chai sugar · protein protected second
- **Bread (locked 5 Nov):** **Continente Shape / shelf Shape = haram** — do not buy. Default sliced bread = **Bimbo Proteína** (~81 kcal / 7 P / slice). Prefer house roti when possible.
- **GY mix (locked 20 Nov):** Mythos **150 g** + Philly cottage **50 g** + whey **1 scoop** + Origens granola **20 g** + Cacau Magro **5 g** + sucralose **5 g** + choco ball cereal **10 g** + blueberries **20 g**. Base ~**400 / 43 / 33 / 9**.

## Shelf & recipes
- Labels: `health-coach/labels.md`
- Recipes: `health-coach/recipes.md`
- **Shelf rule (locked 5 Nov):** do **not** add new products to `labels.md` / site shelf until Hassan says **shelf / lock / save this label**. Chat recommendations OK without shelving.
- Meal mirror: `health-coach/food-log.md`
- Weekly tape: `health-coach/weekly-metrics.md`
- Calibration: `health-coach/calibration.md`

## Food Log (locked)
Format:
```
Food Log | {dish name} | {kcal} | {protein} | {carbs} | {fat}
{low}–{high}% sure
```
Then tappable `shortcuts://run-shortcut?name=Food%20Log&input=text&text=...`  
SMS backup: +351926194305  
Learned: Paltay salan = besan (chickpea flour) · chicken skinless by default
