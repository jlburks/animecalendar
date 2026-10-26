# Anime Calendar

A responsive anime schedule and personal watchlist. This first version uses an explicitly labeled illustrative schedule; it does not fetch live broadcasts or real-time ratings.

## Develop

Requires Node.js 20.19+ or 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

## Validate and build

```sh
npm test
npm run build
npm run preview
```

The production build is written to `dist/` and can be hosted on a static web host. No backend, account, or API key is required. Google Fonts is optional; the app uses system sans-serif fallbacks when it is unavailable.

## First-version features

- Weekly schedule with day filters and previous/next week navigation
- Search by English or alternate series title and filter by genre
- Series detail dialogs with keyboard dismissal
- Personal watchlist persisted in the current browser's local storage
- Responsive dark interface and original CSS landscape artwork

Sample times are expressed in UTC and repeat each week. Watchlists do not sync between devices; clearing browser storage removes them. A future live-data integration should replace the fixtures in `src/data.js` and provide actual dates, airing status, source attribution, and timezone conversion.
