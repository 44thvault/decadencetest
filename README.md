# DECADENCE — Pandemonium Matrix

Atlantean Time-Sorcery Card Game / Neolemurian Zygonovist Oracle

A technopunk web interface to the CCRU Pandemonium Matrix. 45 demons. 10 zones. 5 syzygies. 15 pitches. The Numogram awaits.

## Deploy

```bash
npm install
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages).

**Important:** Place `numogram.png` and icon files (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) in the `public/` folder before building.

## Source

All demon data is canonical to [ccru.net/digithype/pandemonium.htm](http://www.ccru.net/digithype/pandemonium.htm).

## Modes

- **Decadence** — Atlantean/AOE tradition. 36 cards, pairs sum to 10. Angelic Index for positive results.
- **Subdecadence** — Neolemurian zygonovist tradition. 40 cards (+ 4 Queens = 0), pairs sum to 9. The ultimate blasphemy.

## Stack

Vite + React 18. Single-file PWA. No backend.
