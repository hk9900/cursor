(() => {
  const { HC } = window;
  const charts = [];
  const css = getComputedStyle(document.documentElement);
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

  const avg = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stat(value, label, tone = "") {
    return `<div class="stat ${tone}"><span class="value">${esc(value)}</span><span class="label">${esc(label)}</span></div>`;
  }

  function chartCard(title, caption, canvasId, sm = false) {
    return `
      <div class="chart-card">
        <h2>${esc(title)}</h2>
        <p class="caption">${esc(caption)}</p>
        <div class="chart-wrap ${sm ? "sm" : ""}"><canvas id="${canvasId}"></canvas></div>
      </div>`;
  }

  function tableCard(title, caption, headers, rows, tones = [], compact = false) {
    const head = headers
      .map((h) => `<th${h.num ? ' class="num"' : ""}>${esc(h.label)}</th>`)
      .join("");
    const body = rows
      .map((r, i) => {
        const tone = tones[i] ? ` class="tone-${tones[i]}"` : "";
        const cells = r
          .map((c, j) => `<td${headers[j]?.num ? ' class="num"' : ""}>${esc(c)}</td>`)
          .join("");
        return `<tr${tone}>${cells}</tr>`;
      })
      .join("");
    return `
      <div class="table-card">
        <h2>${esc(title)}</h2>
        ${caption ? `<p class="caption">${esc(caption)}</p>` : ""}
        <div style="overflow-x:auto">
          <table class="data ${compact ? "compact" : ""}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
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
            pointRadius: labels.length > 18 ? 0 : 3,
            pointHoverRadius: 5,
            fill: !!s.fill,
            borderWidth: 2,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: series.length > 1 } },
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
            y: { stacked: !!opts.stacked, beginAtZero: true, grid: { color: line + "88" } },
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
    while (charts.length) charts.pop().destroy();
  }

  function renderHero() {
    const lost = (HC.meta.startWeight - HC.meta.weight).toFixed(1);
    document.getElementById("hero-stats").innerHTML = [
      stat(`${HC.meta.weight} kg`, "Current (25 Oct)", "good"),
      stat(`−${lost} kg`, "Since Fitbit start", "good"),
      stat(String(HC.totals.meals), "Food Logs archived"),
      stat(String(HC.labels.length), "Shelf labels"),
    ].join("");
    document.getElementById("foot-meta").textContent =
      `${HC.totals.meals} meals · ${HC.totals.days} days · ${HC.labels.length} labels · ${HC.recipes.length} recipes · through ${HC.meta.through}`;
  }

  function renderOverview() {
    const root = document.getElementById("panel-overview");
    root.innerHTML = `
      <div class="stack">
        <div class="callout">
          <strong>Week 3: 111.5 kg · waist 45.5″</strong>
          Full archive loaded — ${HC.totals.meals} meals, ${HC.labels.length} pack labels,
          ${HC.recipes.length} household recipes, Fitbit days, Apple windows, Sunday metrics.
          Notes intake locked ~1,648 kcal in W2–W3. Don’t cut lower.
        </div>
        <div class="grid-4">
          ${stat(`${HC.meta.waist}″`, "Waist (was 48″)", "good")}
          ${stat("1,647", "W3 Notes intake", "info")}
          ${stat(HC.totals.kcal.toLocaleString(), "Sum logged kcal")}
          ${stat(`${HC.totals.protein.toLocaleString()} g`, "Sum logged protein")}
        </div>
        ${chartCard("Weight — current cut", "Sunday weigh-ins · Sep 23 – Oct 25 2026", "c-weight")}
        ${chartCard("Daily logged kcal (all Food Logs)", "food-log.md day sums · early dates estimated", "c-ov-kcal")}
        ${chartCard("Daily logged protein", "Target 150–170 g", "c-ov-p", true)}
        <div class="grid-2">
          ${tableCard("Sunday weekly metrics", "Notes table truth", [
            { label: "Week" }, { label: "Date" }, { label: "kg", num: true },
            { label: "Waist" }, { label: "Intake" }, { label: "Burn" }, { label: "Motiv" },
          ], HC.weeks.map((w) => [String(w.week), w.date, String(w.weight), w.waist, w.intake, w.burn, w.motiv]),
          [undefined, undefined, "good", "good"])}
          ${tableCard("Phased targets", "", [
            { label: "Phase" }, { label: "Target" },
          ], [
            ["Now →", "105–108 kg"],
            ["Hold", "92–95 kg"],
            ["Later", "70–80 kg"],
            ["Height", `${HC.meta.heightCm} cm`],
            ["DOB", HC.meta.dob],
            ["City", HC.meta.city],
          ])}
        </div>
        <div class="callout bad">
          <strong>Cardiovascular priority</strong>
          Smokes · family heart history · Unilabs Apr 28: Total 219 · LDL 149 · HDL 30 · TG 198 · Glucose 94.
        </div>
      </div>`;
    lineChart("c-weight", HC.weightCut.labels, [
      { label: "Weight (kg)", data: HC.weightCut.kg, color: info, fill: info + "18" },
    ], { beginAtZero: false, min: 108, max: 122 });
    lineChart("c-ov-kcal", HC.mealDays, [
      { label: "Logged kcal", data: HC.mealKcal, color: info, fill: info + "14" },
    ]);
    lineChart("c-ov-p", HC.mealDays, [
      { label: "Protein (g)", data: HC.mealProtein, color: good, fill: good + "14" },
    ]);
  }

  function renderBody() {
    const root = document.getElementById("panel-body");
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat("111.5 kg", "Week 3", "good")}
          ${stat("45.5 in", "Waist", "good")}
          ${stat("48.5 in", "Chest")}
          ${stat("14.5 / 23.5", "Bicep / thigh")}
        </div>
        ${chartCard("Current cut", "120 → 111.5 · −8.5 kg", "c-body-weight")}
        ${chartCard("Past cut — Xiaomi 2019–2020", "107.3 → 93.2 kg", "c-past-cut")}
        ${tableCard("Full tape log", "", [
          { label: "Week" }, { label: "Date" }, { label: "Weight", num: true },
          { label: "Waist" }, { label: "Chest" }, { label: "Bicep R" },
          { label: "Thigh R" }, { label: "Steps TILSD" }, { label: "Motiv" },
        ], HC.weeks.map((w) => [String(w.week), w.date, String(w.weight), w.waist, w.chest, w.bicep, w.thigh, w.steps, w.motiv]))}
        <div class="grid-2">
          ${tableCard("Labs — Unilabs 28 Apr 2026", "", [
            { label: "Marker" }, { label: "Value", num: true }, { label: "Flag" },
          ], HC.labs.map(([a, b, c]) => [a, b, c]), HC.labs.map((r) => r[3]))}
          <div class="rule-card">
            <h2>Staples locked</h2>
            <ul class="clean">${HC.staples.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
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

  function renderEnergy() {
    const root = document.getElementById("panel-energy");
    const burnAll = avg(HC.burn);
    const activeAll = avg(HC.active);
    const stepsAll = avg(HC.steps);
    const fitbitRows = HC.fitbitDays.map((d, i) => [
      d, String(HC.burn[i]), String(HC.active[i]), HC.steps[i].toLocaleString(), String(HC.rhr[i]),
    ]);
    const energyRows = HC.energyDays.map((d, i) => [
      d, String(HC.intake[i]), String(HC.proteinApple[i]), String(HC.burnOnIntake[i]), String(HC.deficit[i]),
    ]);
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat(`~${burnAll}`, "Avg total burn")}
          ${stat(`~${activeAll}`, "Avg active")}
          ${stat(`~${stepsAll.toLocaleString()}`, "Avg steps")}
          ${stat("~2,070", "BMR @ 111.5")}
        </div>
        ${chartCard("Total vs active burn", "Fitbit · Sep 23 – Oct 13", "c-burn")}
        ${chartCard("Steps", "Fitbit Physical Activity", "c-steps", true)}
        ${chartCard("Intake vs burn", "Apple Dietary Energy days", "c-intake-burn")}
        ${chartCard("Apple protein (g)", "Target 150–170", "c-protein-apple", true)}
        ${tableCard("Every Fitbit day", "Burn · active · steps · RHR", [
          { label: "Date" }, { label: "Burn", num: true }, { label: "Active", num: true },
          { label: "Steps", num: true }, { label: "RHR", num: true },
        ], fitbitRows, [], true)}
        ${tableCard("Every Apple intake day", "Intake · P · burn · deficit", [
          { label: "Date" }, { label: "Intake", num: true }, { label: "P", num: true },
          { label: "Burn", num: true }, { label: "Deficit", num: true },
        ], energyRows, HC.deficit.map((d) => (d < 0 ? "bad" : d > 1200 ? "good" : undefined)), true)}
        ${tableCard("Oct 6–13 detail", "", [
          { label: "Date" }, { label: "kcal", num: true }, { label: "P", num: true },
          { label: "C", num: true }, { label: "F", num: true }, { label: "Burn", num: true },
          { label: "Steps", num: true }, { label: "Def", num: true },
        ], HC.octLogged.map((d) => [d.d, String(d.kcal), String(d.p), String(d.c), String(d.f), String(d.burn), d.steps.toLocaleString(), String(d.def)]),
        HC.octLogged.map((d) => (d.def < 0 ? "bad" : d.kcal >= 1550 && d.kcal <= 1800 ? "good" : d.kcal > 2200 ? "warn" : undefined)), true)}
      </div>`;
    lineChart("c-burn", HC.fitbitDays, [
      { label: "Total burn", data: HC.burn, color: info, fill: info + "14" },
      { label: "Active burn", data: HC.active, color: good, fill: good + "14" },
    ]);
    barChart("c-steps", HC.fitbitDays, [{ label: "Steps", data: HC.steps, color: info }]);
    barChart("c-intake-burn", HC.energyDays, [
      { label: "Intake", data: HC.intake, color: warn },
      { label: "Burn", data: HC.burnOnIntake, color: info },
    ]);
    barChart("c-protein-apple", HC.energyDays, [
      { label: "Protein (g)", data: HC.proteinApple, color: good },
    ]);
  }

  function renderFood() {
    const root = document.getElementById("panel-food");
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat(String(HC.totals.meals), "Meals")}
          ${stat(String(HC.totals.days), "Days")}
          ${stat(String(HC.weekKcal[1]), "W2 avg kcal", "good")}
          ${stat(`${HC.weekP[1]} g`, "W2 avg P", "info")}
        </div>
        ${chartCard("Daily kcal", "All food-log.md day sums", "c-meal-kcal")}
        ${chartCard("Daily macros stacked view (P/C/F g)", "From day sums", "c-meal-macros")}
        <div class="grid-2">
          ${chartCard("kcal / day by week", "", "c-week-kcal", true)}
          ${chartCard("protein / day by week", "", "c-week-p", true)}
        </div>
        <div class="grid-2">
          ${chartCard("Meal-type kcal share", "", "c-meal-pie", true)}
          ${chartCard("Meals per week", "", "c-week-n", true)}
        </div>
        ${chartCard("Notes weekly intake", "Canonical Sunday averages", "c-notes-intake", true)}
        ${chartCard("Meals logged per day", "Count of Food Log entries", "c-meal-n", true)}
        ${tableCard("Top 20 highest-kcal meals", "* backfill estimated date", [
          { label: "Dish" }, { label: "kcal", num: true }, { label: "P", num: true }, { label: "When" },
        ], HC.topMeals, [], true)}
        ${tableCard("Every day total", "All 31 days", [
          { label: "Date" }, { label: "kcal", num: true }, { label: "P", num: true },
          { label: "C", num: true }, { label: "F", num: true }, { label: "Meals", num: true },
        ], HC.daily.map((d) => [d.date, String(d.kcal), String(d.p), String(d.c), String(d.f), String(d.n)]), [], true)}
      </div>`;
    lineChart("c-meal-kcal", HC.mealDays, [
      { label: "kcal", data: HC.mealKcal, color: info, fill: info + "14" },
    ]);
    barChart("c-meal-macros", HC.mealDays, [
      { label: "Protein", data: HC.mealProtein, color: good },
      { label: "Carbs", data: HC.mealCarbs, color: info },
      { label: "Fat", data: HC.mealFat, color: warn },
    ], { stacked: true });
    barChart("c-week-kcal", HC.weekLabels, [{ label: "kcal/day", data: HC.weekKcal, color: info }]);
    barChart("c-week-p", HC.weekLabels, [{ label: "P g/day", data: HC.weekP, color: good }]);
    pieChart("c-meal-pie", HC.pie);
    barChart("c-week-n", HC.weekLabels, [{ label: "Meals", data: HC.weekMeals, color: muted }]);
    barChart("c-notes-intake", HC.notesLabels, [{ label: "Intake", data: HC.notesIntake, color: warn }]);
    barChart("c-meal-n", HC.mealDays, [{ label: "Meals", data: HC.mealCount, color: accent }]);
  }

  function mealRows(list) {
    return list.map((m) => [
      m.date,
      m.slot,
      m.dish,
      String(m.kcal),
      String(m.p),
      String(m.c),
      String(m.f),
      m.backfill ? "est." : "live",
    ]);
  }

  function renderMeals() {
    const root = document.getElementById("panel-meals");
    const dates = [...new Set(HC.meals.map((m) => m.date))];
    root.innerHTML = `
      <div class="stack">
        <div class="sticky-note">
          <div class="toolbar">
            <input id="meal-q" type="search" placeholder="Search dish, notes, slot…" />
            <select id="meal-date">
              <option value="">All dates (${dates.length})</option>
              ${dates.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join("")}
            </select>
            <select id="meal-src">
              <option value="">All sources</option>
              <option value="live">Live mirror</option>
              <option value="est">Chat backfill</option>
            </select>
          </div>
          <p class="meta-line" id="meal-meta">${HC.meals.length} meals</p>
        </div>
        <div id="meal-table"></div>
      </div>`;

    const draw = () => {
      const q = document.getElementById("meal-q").value.trim().toLowerCase();
      const date = document.getElementById("meal-date").value;
      const src = document.getElementById("meal-src").value;
      let list = HC.meals.slice();
      if (date) list = list.filter((m) => m.date === date);
      if (src === "live") list = list.filter((m) => !m.backfill);
      if (src === "est") list = list.filter((m) => m.backfill);
      if (q) {
        list = list.filter((m) =>
          `${m.dish} ${m.slot} ${m.notes} ${m.portions}`.toLowerCase().includes(q),
        );
      }
      const sumK = list.reduce((a, m) => a + m.kcal, 0);
      const sumP = list.reduce((a, m) => a + m.p, 0);
      document.getElementById("meal-meta").textContent =
        `${list.length} meals · ${sumK.toLocaleString()} kcal · ${sumP} g protein`;
      document.getElementById("meal-table").innerHTML = tableCard(
        "Complete Food Log",
        "Every entry from health-coach/food-log.md",
        [
          { label: "Date" }, { label: "Slot" }, { label: "Dish" },
          { label: "kcal", num: true }, { label: "P", num: true },
          { label: "C", num: true }, { label: "F", num: true }, { label: "Src" },
        ],
        mealRows(list),
        [],
        true,
      );
    };

    ["meal-q", "meal-date", "meal-src"].forEach((id) => {
      document.getElementById(id).addEventListener("input", draw);
      document.getElementById(id).addEventListener("change", draw);
    });
    draw();
  }

  function renderLabels() {
    const root = document.getElementById("panel-labels");
    root.innerHTML = `
      <div class="stack">
        <div class="callout">
          <strong>${HC.labels.length} shelf labels</strong>
          Canonical pack macros for Food Logs. Prefer these over generic databases.
        </div>
        <div class="toolbar sticky-note">
          <input id="label-q" type="search" placeholder="Filter labels…" />
          <p class="meta-line" id="label-meta"></p>
        </div>
        <div class="cards" id="label-cards"></div>
      </div>`;

    const draw = () => {
      const q = document.getElementById("label-q").value.trim().toLowerCase();
      const list = HC.labels.filter(
        (l) => !q || `${l.name} ${l.bullets.join(" ")}`.toLowerCase().includes(q),
      );
      document.getElementById("label-meta").textContent = `${list.length} labels`;
      document.getElementById("label-cards").innerHTML = list
        .map((l) => {
          const chip = l.macros
            ? `<span class="macro-chip">${l.macros.kcal} kcal · P ${l.macros.p} · C ${l.macros.c} · F ${l.macros.f}</span>`
            : "";
          return `<article class="card-item"><h3>${esc(l.name)}</h3><ul>${l.bullets
            .map((b) => `<li>${esc(b)}</li>`)
            .join("")}</ul>${chip}</article>`;
        })
        .join("");
    };
    document.getElementById("label-q").addEventListener("input", draw);
    draw();
  }

  function renderRecipes() {
    const root = document.getElementById("panel-recipes");
    root.innerHTML = `
      <div class="stack">
        <div class="callout">
          <strong>${HC.recipes.length} household recipes</strong>
          Family notes (Roman Urdu trained). Oil baselines evolved — current cut uses 1–1.5 tbsp/pot when he says spray/no oil.
        </div>
        <div class="toolbar sticky-note">
          <input id="recipe-q" type="search" placeholder="Filter recipes…" />
        </div>
        <div class="cards" id="recipe-cards"></div>
      </div>`;
    const draw = () => {
      const q = document.getElementById("recipe-q").value.trim().toLowerCase();
      const list = HC.recipes.filter(
        (r) => !q || `${r.name} ${r.body}`.toLowerCase().includes(q),
      );
      document.getElementById("recipe-cards").innerHTML = list
        .map(
          (r) =>
            `<article class="card-item"><h3>${esc(r.name)}</h3><pre class="recipe-body">${esc(r.body)}</pre></article>`,
        )
        .join("");
    };
    document.getElementById("recipe-q").addEventListener("input", draw);
    draw();
  }

  function renderRecovery() {
    const root = document.getElementById("panel-recovery");
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat("86 → 78", "RHR trend", "good")}
          ${stat("73–86", "Sleep scores")}
          ${stat("A+", "Blood type")}
          ${stat("6–8 h", "Sleep aim")}
        </div>
        ${chartCard("Resting heart rate", "Fitbit Daily RHR", "c-rhr")}
        ${chartCard("Sleep score & deep sleep", "Sparse Fitbit nights", "c-sleep")}
        ${tableCard("Sleep nights", "", [
          { label: "Night" }, { label: "Score", num: true }, { label: "Deep min", num: true },
        ], HC.sleep.labels.map((d, i) => [d, String(HC.sleep.score[i]), String(HC.sleep.deep[i])]))}
        ${tableCard("RHR every day", "", [
          { label: "Date" }, { label: "RHR", num: true },
        ], HC.fitbitDays.map((d, i) => [d, String(HC.rhr[i])]), [], true)}
      </div>`;
    lineChart("c-rhr", HC.fitbitDays, [
      { label: "RHR", data: HC.rhr, color: "#9b2c2c", fill: "#9b2c2c18" },
    ], { beginAtZero: false, min: 74, max: 88 });
    lineChart("c-sleep", HC.sleep.labels, [
      { label: "Score", data: HC.sleep.score, color: info },
      { label: "Deep (min)", data: HC.sleep.deep, color: good },
    ], { beginAtZero: false });
  }

  function renderPlan() {
    const root = document.getElementById("panel-plan");
    root.innerHTML = `
      <div class="stack">
        <div class="grid-4">
          ${stat("1,550–1,800", "kcal / day", "info")}
          ${stat("150–170 g", "Protein", "good")}
          ${stat("45–65 g", "Fat")}
          ${stat("120–190 g", "Carbs")}
        </div>
        ${tableCard("Cut levers", "", [
          { label: "Lever" }, { label: "Target" }, { label: "Rule" },
        ], [
          ["Food band", "1,550–1,800", "Prefer ~1,650; floor ~1,500"],
          ["Protein", "150–170 g", "Whey when short; log scoop"],
          ["Walks", "400–500+ active kcal", "Don’t eat burn back"],
          ["Weigh-in", "Sunday AM", "Toilet, before food"],
          ["Tape", "Waist / chest / bicep / thigh", "With weight"],
        ])}
        ${tableCard("Halal stack", "", [
          { label: "#" }, { label: "Supplement" }, { label: "Dose" }, { label: "Notes" },
        ], HC.stack)}
        ${tableCard("Weekly adjust", "", [
          { label: "If…" }, { label: "Then…" },
        ], [
          ["Lose ≥0.8–1.0 kg/week", "Hold calories & walks"],
          ["Lose <0.5–0.7 for 2 weeks", "Tighten portions — not protein"],
          ["Lose >1.2–1.5 with fatigue", "Bump food slightly"],
          ["Protein ≪ 130", "Add whey or lean meat"],
          ["Intake ≫ 1,800", "Flag day"],
        ])}
        <div class="rule-card">
          <h2>Profile snapshot</h2>
          <pre class="profile-pre">${esc(HC.profileMd)}</pre>
        </div>
        <div class="rule-card">
          <h2>Food Log format</h2>
          <pre class="profile-pre">Food Log | {dish} | {kcal} | {protein} | {carbs} | {fat}
{low}–{high}% sure
shortcuts://run-shortcut?name=Food%20Log&amp;input=text&amp;text=...</pre>
        </div>
      </div>`;
  }

  const renderers = {
    overview: renderOverview,
    body: renderBody,
    energy: renderEnergy,
    food: renderFood,
    meals: renderMeals,
    labels: renderLabels,
    recipes: renderRecipes,
    recovery: renderRecovery,
    plan: renderPlan,
  };

  function showTab(name) {
    destroyCharts();
    document.querySelectorAll(".tabs button").forEach((btn) => {
      btn.setAttribute("aria-selected", btn.dataset.tab === name ? "true" : "false");
    });
    document.querySelectorAll(".panel").forEach((panel) => {
      const on = panel.id === `panel-${name}`;
      panel.classList.toggle("active", on);
      panel.hidden = !on;
    });
    renderers[name]();
  }

  function boot() {
    renderHero();
    document.querySelectorAll(".tabs button").forEach((btn) => {
      btn.addEventListener("click", () => showTab(btn.dataset.tab));
    });
    showTab("overview");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
