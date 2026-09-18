# Canvas Grading Snapshot

A read-only, publicly-hostable snapshot of the most recently due assignment's
submissions across HEB 101, HEB 201, HEB 207, and the Internship course. Built as a
GitHub Pages site so you have a shareable URL to glance at, without exposing real
student names or live Canvas write access.

**This is a point-in-time snapshot, not a live dashboard.** For live viewing and
grading (entering grades that save back to Canvas), use the companion
`canvas-grading-userscript` project instead — it runs inside Canvas itself using your
logged-in session. This site is for quick browsing / sharing a read-only view.

## Privacy — read this before publishing

Free/personal GitHub accounts can only publish **public** Pages sites — anyone with the
URL can view it. To protect student privacy (FERPA), this snapshot:

- Replaces every student's real name with an anonymous ID (`Student A`, `Student B`, …),
  scoped per course.
- Strips file names and download links from attachments (shows only file type + size).
- Redacts any student name that appeared inside instructor comments.

The real name-to-ID mapping is saved locally as `key.LOCAL_ONLY.json` — **this file is
in `.gitignore` and must never be committed or pushed.** Keep it on your own computer
only, to look up which "Student A" is which when you need to.

If your GitHub account is on a paid Team/Enterprise plan that supports private Pages
sites, you could skip the anonymization and publish real names instead — just ask and
I can rebuild it that way.

## Publishing to GitHub Pages

```bash
cd canvas-grading-snapshot
git init
git add .                      # key.LOCAL_ONLY.json is excluded automatically
git commit -m "Canvas grading snapshot"
git branch -M main
git remote add origin https://github.com/<your-username>/canvas-grading-snapshot.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source → Deploy from branch → main / (root)**.
GitHub gives you a URL like `https://<your-username>.github.io/canvas-grading-snapshot/`
within a minute or two.

## Refreshing the snapshot

Data goes stale the moment a new submission comes in. To refresh:

1. Ask me (Claude) to "regenerate the Canvas grading snapshot" — I'll pull fresh data
   from Canvas the same way I did the first time and overwrite `data.json` (and
   `key.LOCAL_ONLY.json`) here.
2. Commit and push the updated `data.json` and `meta.json`:
   ```bash
   git add data.json meta.json
   git commit -m "Refresh snapshot"
   git push
   ```
3. GitHub Pages updates automatically within a minute or two of the push.

## Files

- `index.html` / `styles.css` / `app.js` — the site itself (reads `data.json`).
- `data.json` — the anonymized snapshot data. Safe to publish.
- `meta.json` — just a timestamp of when the snapshot was generated.
- `key.LOCAL_ONLY.json` — real names behind each anonymous ID. **Never commit this.**
