# credits.gg — local static V1

First local materialization of the credits.gg V1 spec (`docs/V1-DECISIONS.md`,
`docs/BUILD-LOG.md`, `docs/LOCAL-BUILD-PROCESS.md`).

Pure static HTML/CSS/JS. No CDNs, no external fonts/images/scripts, no build step.
All data lives in `data/*.json`; logo/art provenance in `assets/provenance.json`.

Serve and open:

```bash
cd ~/workspace/credits-gg/site
python3 -m http.server 8000
# → http://localhost:8000/
```

Routes are hash-based (`#/franchise/god-of-war`, …) — everything runs from `index.html`.
