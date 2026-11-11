# Budget Monitor – Mongkol Borei 2 · FY27 (PWA)

Monthly budget plan vs actual spending, Oct 2026 – Sep 2027, USD.

## Files
index.html · styles.css · app.js · data.js (plan data from the iMPAQ template) · sw.js · manifest.webmanifest · icons/

## Publish with GitHub Pages
1. GitHub > New repository (e.g. `budget-fy27`), Public.
2. Upload every file and the `icons` folder (Add file > Upload files) > Commit.
3. Settings > Pages > Source: Deploy from a branch > `main` / `/ (root)` > Save.
4. Open `https://<your-username>.github.io/budget-fy27/` after 1–2 minutes.

## Install
Android Chrome: menu > Install app · iPhone Safari: Share > Add to Home Screen · Desktop Chrome/Edge: install icon in the address bar.

## Using it
- **Add expense** (top right): date, amount, activity (type a code), account auto-fills, save.
- **Transactions**: search, filter by month, edit, delete (with Undo), Export CSV.
- **Variance**: month + year-to-date status, burn rate, available per remaining month.
- **Settings**: alert thresholds, dark mode, Backup / Restore, clear sample data.
- Data is stored in each device's browser. Use Settings > Download backup regularly.

## Updating
After changing any file, change `budget-fy27-v2` in `sw.js` to `v3` so installed copies refresh. To update plan numbers, regenerate `data.js`.
