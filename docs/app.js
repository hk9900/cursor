(() => {
  const { HC } = window;
  const charts = [];
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--ink").trim() || "#14201c";
  const muted = css.getPropertyValue("--muted").trim() || "#6b7a72";
  const accent = css.getPropertyValue("--accent").trim() || "#1f6b4a";
  const warn = css.getPropertyValue("--accent-2").trim() || "#c45c26";
  const info = css.getPropertyValue("--info").trim() || "#1e4d6b";
  const line = css.getPropertyValue("--line").trim() || "#c5d0c4";
  const good = css.getPropertyValue("--good").trim() || "#1f6b4a";

  Chart.defaults.font.family = "'Outfit', system-ui, sans-serif";
  Chart.defaults.color = muted;
  Chart.defaults.borderColor = line;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;

  function avg(xs) {
    return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function stat(value, label, tone = "") {
    return `<div class="stat ${tone}"><span class="value">${value}</span><span class="label">${label}</span></div>`;
  }

  function chartCard(title, caption, canvasId, sm = false) {
    return `
      <div class="chart-card">
        <h2>${title}</h2>
        <p class="caption">${caption}</p>
        <div class="chart-wrap ${sm ? "sm" : ""}"><canvas id="${canvasId}"></canvas></div>
      </div>`;
  }

  function tableCard(title, caption, headers, rows, tones = []) {
    const head = headers
      .map((h) => {
        const num = h.num ? ' class="num"' : "";
        return `<th${num}>${h.label}</th>`;
      })
      .join("");
    const body = rows
      .map((r, i) => {
        const tone = tones[i] ? ` class="tone-${tones[i]}"` : "";
        const cells = r
          .map((c, j) => {
            const num = headers[j]?.num ? ' class="num"' : "";
            return `<td${num}>${c}</td>`;
          })
          .join("");
        return `<tr${tone}>${cells}</tr>`;
      })
      .join("");
    return `
      <div class="table-card">
        <h2>${title}</h2>
        ${caption ? `<p class="caption">${caption}</p>` : ""}
        <div style="overflow-x:auto">
          <table class="data"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
        </div>
      </div>`;
  }

  function lineChart(id, labels, series, opts = {}) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    charts.push(
      new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.data,
            borderColor: s.color,
            backgroundColor: s.fill || s.color + "22",
            tension: 0.28,
            pointRadius: labels.length > 20 ? 0 : 3,
            pointHoverRadius: 5,
            fill: !!s.fill,
            borderWidth: 2,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: series.length > 1 },
            annotation: undefined,
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: opts.beginAtZero ?? true,
              min: opts.min,
              max: opts.max,
              grid: { color: line + "88" },
            },
          },
        },
      }),
    );
  }

  function barChart(id, labels, series, opts = {}) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    charts.push(
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.data,
            backgroundColor: s.color,
            borderRadius: 6,
            maxBarThickness: opts.stacked ? 28 : 36,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: series.length > 1 } },
          scales: {
            x: { stacked: !!opts.stacked, grid: { display: false } },
            y: {
              stacked: !!opts.stacked,
              beginAtZero: true,
              grid: { color: line + "88" },
            },
          },
        },
      }),
    );
  }

  function pieChart(id, items) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    const palette = [accent, info, warn, "#5b7c6a", "#8a6d3b", "#2f6f6a", "#6b7a72", "#4a5d52"];
    charts.push(
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: items.map((i) => i.label),
          datasets: [
            {
              data: items.map((i) => i.value),
              backgroundColor: items.map((_, i) => palette[i % palette.length]),
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { boxWidth: 10, font: { size: 11 } } },
          },
        },
      }),
    );
  }

  function destroyCharts() {
    while (charts.length) {
      const c = charts.pop();
      c.destroy();
    }
  }

  function renderHero() {
    const lost = (HC.meta.startWeight - HC.meta.weight).toFixed(1);
    document.getElementById("hero-stats").innerHTML = [
      stat(`${HC.meta.weight} kg`, "Current (25 Oct)", "good"),
      stat(`−${lost} kg`, "Since Fitbit start", "good"),
      stat(`${HC.meta.waist}″`, "Waist (was 48″)", "good"),
      stat("1,647", "W3 avg intake (Notes)", "info"),
    ].join("");
  }

  function renderOverview() {
    const root = document.getElementById("panel-overview");
    root.innerHTML = `
      <div class="stack">
        <div class="callout">
          <strong>Week 3: 111.5 kg · waist 45.5″</strong>
          Path 120 → 115.9 → 113.5 → 112.9 → 111.5 (−8.5 kg). Notes intake locked
          ~1,648–1,647 kcal in W2–W3. Keep the band — don’t cut lower.
        </div>
        <div class="grid-4">
          ${stat("120 meals", "In food-log.md")}
          ${stat("~3,025", "Burn/day W1 Fitbit")}
          ${stat("~7,100", "Steps/day W1")}
          ${stat("45.5″", "Waist W3", "good")}
        </div>
        ${chartCard(
          "Weight — current cut",
          "Source: Fitbit / Notes Sunday weigh-ins · kg · Sep 23 – Oct 25 2026",
          "c-weight",
        )}
        ${chartCard(
          "Energy balance — Apple Food Log days",
          "Intake = Apple Dietary Energy · Burn = Fitbit total · Target 1,550–1,800",
          "c-energy-balance",
        )}
        ${chartCard(
          "Daily deficit (kcal)",
          "Positive = cutting · Fitbit burn − Apple intake",
          "c-deficit",
          true,
        )}
        <div class="grid-2">
          ${tableCard(
            "Source roles",
            "",
            [{ label: "Source" }, { label: "Use for" }],
            [
              ["Fitbit / Google", "Burn, steps, AZM, sleep, RHR"],
              ["Apple Health", "Food Log macros (Shortcut)"],
              ["food-log.md", "Full meal mirror · chat + live"],
              ["Notes Sunday table", "Weekly intake / weight truth"],
            ],
          )}
          ${tableCard(
            "Phased targets",
            "",
            [{ label: "Phase" }, { label: "Target" }],
            [
              ["Now →", "105–108 kg"],
              ["Hold", "92–95 kg"],
              ["Later", "70–80 kg"],
              ["Pace", "≥1 kg/wk early; 0.8–1.1 after"],
              ["WHtR long-term", "< 0.5 (now ≈ 0.64)"],
            ],
          )}
        </div>
        <div class="callout bad">
          <strong>Cardiovascular priority</strong>
          Smokes · family heart history · waist still elevated · Unilabs Apr 28:
          Total 219 · LDL 149 · HDL 30 · TG 198 · Glucose 94. See GP for BP,
          cessation, statin discussion.
        </div>
      </div>`;

    lineChart("c-weight", HC.weightCut.labels, [
      { label: "Weight (kg)", data: HC.weightCut.kg, color: info, fill: info + "18" },
    ], { beginAtZero: false, min: 108, max: 122 });

    lineChart("c-energy-balance", HC.energyDays, [
      { label: "Fitbit burn", data: HC.burnOnIntake, color: info, fill: info + "14" },
      { label: "Apple intake", data: HC.intake, color: warn, fill: warn + "14" },
    ]);

    barChart("c-deficit", HC.energyDays, [
      { label: "Deficit (kcal)", data: HC.deficit, color: accent },
    ]);
  }

  function renderEnergy() {
    const root = document.getElementById("panel-energy");
    const burnAll = avg(HC.burn);
    const activeAll = avg(HC.active);
    const stepsAll = avg(HC.steps);
    const burnW1 = avg(HC.burn.slice(12, 19));
    const stepsW1 = avg(HC.steps.slice(12, 19));
    const activeW1 = avg(HC.active.slice(12, 19));

    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat(`~${burnAll}`, "Avg total burn")}
          ${stat(`~${activeAll}`, "Avg active burn")}
          ${stat(`~${stepsAll.toLocaleString()}`, "Avg steps")}
          ${stat("~2,070", "Mifflin BMR @ 111.5")}
        </div>
        ${chartCard(
          "Total burn vs active burn",
          "Fitbit Global Export · Sep 23 – Oct 13 · kcal/day",
          "c-burn",
        )}
        ${chartCard(
          "Steps per day",
          "Prefer Fitbit over Notes TILSD (W1 Notes undercounted)",
          "c-steps",
          true,
        )}
        ${tableCard(
          "Week comparison",
          "",
          [
            { label: "Window" },
            { label: "Burn/day", num: true },
            { label: "Active/day", num: true },
            { label: "Steps/day", num: true },
            { label: "Notes" },
          ],
          [
            ["Sep 23 – Oct 13", String(burnAll), String(activeAll), stepsAll.toLocaleString(), "Full export"],
            ["Oct 5 – 11 (W1)", String(burnW1), String(activeW1), stepsW1.toLocaleString(), "Peak walk week"],
            ["Notes W2 / W3 intake", "—", "—", "—", "1,648 / 1,647 kcal"],
          ],
        )}
        ${chartCard(
          "Intake vs burn (logged days)",
          "Apple Dietary Energy vs Fitbit total",
          "c-intake-burn",
        )}
        ${chartCard(
          "Protein (g) on Food Log days",
          "Target 150–170 g · Apple Dietary Protein",
          "c-protein-apple",
          true,
        )}
        <div class="callout">
          <strong>Don’t eat the burn back</strong>
          Fitbit active can be ±15–30% off. Use total burn as TDEE trend
          (~2,800–3,100). Keep food 1,550–1,800; walks 400–500+ active kcal.
        </div>
      </div>`;

    lineChart("c-burn", HC.fitbitDays, [
      { label: "Total burn", data: HC.burn, color: info, fill: info + "14" },
      { label: "Active burn", data: HC.active, color: good, fill: good + "14" },
    ]);
    barChart("c-steps", HC.fitbitDays, [
      { label: "Steps", data: HC.steps, color: info },
    ]);
    barChart("c-intake-burn", HC.energyDays, [
      { label: "Intake", data: HC.intake, color: warn },
      { label: "Burn", data: HC.burnOnIntake, color: info },
    ]);
    barChart("c-protein-apple", HC.energyDays, [
      { label: "Protein (g)", data: HC.proteinApple, color: good },
    ]);
  }

  function renderBody() {
    const root = document.getElementById("panel-body");
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat("111.5 kg", "Week 3 weight", "good")}
          ${stat("45.5 in", "Waist W3", "good")}
          ${stat("48.5 in", "Chest W3")}
          ${stat("14.5 / 23.5", "Bicep / thigh R")}
        </div>
        ${chartCard(
          "Current cut weight path",
          "120 → 115.9 → 113.5 → 112.9 → 111.5 · −8.5 kg in ~32 days",
          "c-body-weight",
        )}
        ${chartCard(
          "Past cut — Xiaomi (2019–2020)",
          "Google Takeout · 107.3 → 93.2 kg in ~4 months (~0.8–0.9 kg/week)",
          "c-past-cut",
        )}
        ${tableCard(
          "Weekly tape log",
          "",
          [
            { label: "Week" },
            { label: "Date" },
            { label: "Weight", num: true },
            { label: "Waist", num: true },
            { label: "Chest", num: true },
            { label: "Bicep R", num: true },
            { label: "Thigh R", num: true },
            { label: "Motiv", num: true },
          ],
          HC.tape,
          [undefined, undefined, "good", "good"],
        )}
        <div class="grid-2">
          ${tableCard(
            "Labs — Unilabs 28 Apr 2026",
            "",
            [{ label: "Marker" }, { label: "Value", num: true }, { label: "Flag" }],
            HC.labs.map(([a, b, c]) => [a, b, c]),
            HC.labs.map((r) => r[3]),
          )}
          <div class="rule-card">
            <h2>IR / prediabetes context</h2>
            <p class="caption">Acanthosis nigricans noted</p>
            <ul class="clean">
              <li>Protein-forward plates matter as much as the scale</li>
              <li>Keep chai; cap roti/rice at your rules</li>
              <li>Daal / lobia are good staples — keep them</li>
              <li>WHtR long-term &lt; 0.5 (now ≈ 0.64)</li>
            </ul>
          </div>
        </div>
      </div>`;

    lineChart("c-body-weight", HC.weightCut.labels, [
      { label: "kg", data: HC.weightCut.kg, color: good, fill: good + "18" },
    ], { beginAtZero: false, min: 108, max: 122 });
    lineChart("c-past-cut", HC.pastCut.labels, [
      { label: "Weight (kg)", data: HC.pastCut.kg, color: info, fill: info + "18" },
    ], { beginAtZero: false, min: 90, max: 110 });
  }

  function renderFood() {
    const root = document.getElementById("panel-food");
    const tones = HC.octLogged.map((d) =>
      d.def < 0
        ? "bad"
        : d.kcal >= 1550 && d.kcal <= 1800
          ? "good"
          : d.kcal > 2200
            ? "warn"
            : undefined,
    );

    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat("120", "Meals logged")}
          ${stat("31", "Logged days")}
          ${stat("1,745", "W2 avg kcal (file)", "good")}
          ${stat("137 g", "W2 avg protein", "info")}
        </div>
        <div class="callout">
          <strong>How to read meal-day charts</strong>
          From food-log.md (chat backfill + live from 20 Oct). Pre–20 Oct dates
          estimated vs Sunday check-ins — early bars can spike. Prefer weekly
          averages and Notes intake (W2/W3 ≈ 1,648). 28 Oct is partial.
        </div>
        ${chartCard(
          "Daily calories from logged meals",
          "X: date · Y: Food Log kcal sum · Target band 1,550–1,800",
          "c-meal-kcal",
        )}
        ${chartCard(
          "Daily protein from logged meals",
          "Target 150–170 g/day",
          "c-meal-protein",
          true,
        )}
        <div class="grid-2">
          ${chartCard("Avg kcal / day by week", "File day-sums · W4 partial", "c-week-kcal", true)}
          ${chartCard("Avg protein / day by week", "W1 under target · W2 best", "c-week-p", true)}
        </div>
        <div class="grid-2">
          ${chartCard("Calories by meal type", "Share of total logged kcal", "c-meal-pie", true)}
          ${chartCard("Meals per week window", "Corrections collapsed", "c-week-n", true)}
        </div>
        ${chartCard(
          "Notes weekly intake (canonical)",
          "Sunday table · W1 was 5 days",
          "c-notes-intake",
          true,
        )}
        <div class="rule-card">
          <h2>Staples (locked)</h2>
          <p class="caption">Not bad foods — portion rules only</p>
          <div class="pill-row">
            <span class="pill on">≤2 roti / meal</span>
            <span class="pill on">≤200 g Qilla rice</span>
            <span class="pill on">Roti or rice — not both</span>
            <span class="pill">Ashirwad chakki atta</span>
            <span class="pill">Daal / lobia keep</span>
            <span class="pill">Tostas rare OK</span>
            <span class="pill">Haleem 1–2×/mo</span>
          </div>
          <ul class="clean" style="margin-top:12px">
            <li>Oil default 1–1.5 tbsp/pot</li>
            <li>GY mix + whey breakfast habit — keep</li>
            <li>Rare leaks: salami toast, celebration doubles (early cut)</li>
          </ul>
        </div>
        ${tableCard(
          "Highest-calorie meals",
          "* = estimated date from chat backfill",
          [
            { label: "Meal" },
            { label: "kcal", num: true },
            { label: "P", num: true },
            { label: "When" },
          ],
          HC.topMeals,
        )}
        ${tableCard(
          "Oct 6–13 Apple Health days",
          "Canonical early window vs Fitbit burn",
          [
            { label: "Date" },
            { label: "Intake", num: true },
            { label: "P", num: true },
            { label: "C", num: true },
            { label: "F", num: true },
            { label: "Burn", num: true },
            { label: "Steps", num: true },
            { label: "Deficit", num: true },
          ],
          HC.octLogged.map((d) => [
            d.d,
            String(d.kcal),
            String(d.p),
            String(d.c),
            String(d.f),
            String(d.burn),
            d.steps.toLocaleString(),
            String(d.def),
          ]),
          tones,
        )}
      </div>`;

    lineChart("c-meal-kcal", HC.mealDays, [
      { label: "Logged kcal", data: HC.mealKcal, color: info, fill: info + "14" },
    ]);
    lineChart("c-meal-protein", HC.mealDays, [
      { label: "Protein (g)", data: HC.mealProtein, color: good, fill: good + "14" },
    ]);
    barChart("c-week-kcal", HC.weekLabels, [
      { label: "kcal / day", data: HC.weekKcal, color: info },
    ]);
    barChart("c-week-p", HC.weekLabels, [
      { label: "protein g / day", data: HC.weekP, color: good },
    ]);
    pieChart("c-meal-pie", HC.mealPie);
    barChart("c-week-n", HC.weekLabels, [
      { label: "Meal count", data: HC.weekMeals, color: muted },
    ]);
    barChart("c-notes-intake", HC.notesLabels, [
      { label: "Avg intake (kcal)", data: HC.notesIntake, color: warn },
    ]);
  }

  function renderRecovery() {
    const root = document.getElementById("panel-recovery");
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat("86 → 78", "RHR trend (bpm)", "good")}
          ${stat("73–86", "Sleep score range")}
          ${stat("A+", "Blood type")}
          ${stat("6–8 h", "Sleep aim")}
        </div>
        ${chartCard(
          "Resting heart rate (bpm)",
          "Fitbit Daily RHR · Sep 23 – Oct 13",
          "c-rhr",
        )}
        ${chartCard(
          "Sleep score & deep sleep",
          "Fitbit Sleep Score export · sparse nights",
          "c-sleep",
        )}
        ${tableCard(
          "Sleep nights",
          "",
          [
            { label: "Night" },
            { label: "Score", num: true },
            { label: "Deep (min)", num: true },
          ],
          HC.sleep.labels.map((d, i) => [d, String(HC.sleep.score[i]), String(HC.sleep.deep[i])]),
        )}
        <div class="callout">
          <strong>Sleep & stress</strong>
          Creatine may add 0.5–1.5 kg water in week 1 — expect scale noise.
          Magnesium deferred unless sleep/cramps worsen.
        </div>
      </div>`;

    lineChart("c-rhr", HC.fitbitDays, [
      { label: "RHR (bpm)", data: HC.rhr, color: "#9b2c2c", fill: "#9b2c2c18" },
    ], { beginAtZero: false, min: 74, max: 88 });
    lineChart("c-sleep", HC.sleep.labels, [
      { label: "Overall score", data: HC.sleep.score, color: info },
      { label: "Deep sleep (min)", data: HC.sleep.deep, color: good },
    ], { beginAtZero: false });
  }

  function renderPlan() {
    const root = document.getElementById("panel-plan");
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat("1,550–1,800", "Food kcal / day", "info")}
          ${stat("150–170 g", "Protein / day", "good")}
          ${stat("45–65 g", "Fat / day")}
          ${stat("120–190 g", "Carbs / day")}
        </div>
        ${tableCard(
          "Cut levers",
          "",
          [{ label: "Lever" }, { label: "Target" }, { label: "Rule" }],
          [
            ["Food band", "1,550–1,800", "Prefer ~1,650 like W2–W3; floor ~1,500"],
            ["Protein", "150–170 g", "Whey when food short; log the scoop"],
            ["Walks", "400–500+ active kcal", "Don’t eat Fitbit burn back"],
            ["Pace", "≥1 kg/week early", "Tighten portions if <0.5–0.7 ×2 wks"],
            ["Weigh-in", "Sunday AM", "Toilet, before food"],
            ["Tape", "Waist / chest / bicep / thigh", "With weight"],
          ],
        )}
        ${tableCard(
          "Halal top-3 stack",
          "",
          [{ label: "#" }, { label: "Supplement" }, { label: "Dose" }, { label: "Notes" }],
          [
            ["1", "Whey (Critical Whey)", "~24 g P · 122–130 kcal", "Log every scoop"],
            ["2", "Creatine monohydrate", "5 g daily", "No loading; water noise week 1"],
            ["3", "Algae omega-3", "2 caps/day with meal", "Heart/TG — not fat loss"],
          ],
        )}
        ${tableCard(
          "Weekly adjust",
          "",
          [{ label: "If…" }, { label: "Then…" }],
          [
            ["Lose ≥0.8–1.0 kg/week", "Hold calories & walks"],
            ["Lose <0.5–0.7 for 2 weeks", "Tighten starch portions — not protein"],
            ["Lose >1.2–1.5 with fatigue", "Bump food slightly"],
            ["Protein ≪ 130", "Add whey or lean meat"],
            ["Intake ≫ 1,800", "Flag day (portion / rare stack)"],
          ],
        )}
        <div class="rule-card">
          <h2>Food Log format</h2>
          <p class="caption">Apple Health Shortcut · locked</p>
          <pre style="margin:0;white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:0.88rem;background:var(--paper);padding:12px;border-radius:10px;border:1px solid var(--line)">Food Log | {dish} | {kcal} | {protein} | {carbs} | {fat}
{low}–{high}% sure
shortcuts://run-shortcut?name=Food%20Log&amp;input=text&amp;text=...</pre>
        </div>
        <div class="callout">
          <strong>Coaching pointers</strong>
          Don’t cut below ~1,650. Staples (roti or rice + daal/lobia) are fine at
          your caps. Hit 150 g protein. Watch rare salami/toast stacks. Sunday:
          weight + waist.
        </div>
      </div>`;
  }

  const renderers = {
    overview: renderOverview,
    energy: renderEnergy,
    body: renderBody,
    food: renderFood,
    recovery: renderRecovery,
    plan: renderPlan,
  };

  function showTab(name) {
    destroyCharts();
    document.querySelectorAll(".tabs button").forEach((btn) => {
      const on = btn.dataset.tab === name;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".panel").forEach((panel) => {
      const on = panel.id === `panel-${name}`;
      panel.classList.toggle("active", on);
      panel.hidden = !on;
    });
    renderers[name]();
  }

  function initTabs() {
    document.querySelectorAll(".tabs button").forEach((btn) => {
      btn.addEventListener("click", () => showTab(btn.dataset.tab));
    });
  }

  function boot() {
    renderHero();
    initTabs();
    showTab("overview");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
