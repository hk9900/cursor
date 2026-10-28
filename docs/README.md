# Hassan · Health Coach (static site)

Static dashboard for GitHub Pages.

**Live:** https://hk9900.github.io/cursor/

**Local:**

```bash
python3 -m http.server 8080 --directory docs
```

Deploy: `.github/workflows/pages.yml` on push to `main` / `cursor/health-coach`.

**Keep fresh:** whenever Hassan logs meals, labels, weigh-ins, or exports, update `health-coach/*` **and** regenerate `docs/data.js` (rule: `.cursor/rules/health-coach-site.mdc`).
