# Anime Calendar

A responsive anime schedule and personal watchlist. The weekly lineup uses an explicitly labeled illustrative schedule. Release radar separately searches published movie and season information from MyAnimeList via the public Jikan API.

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

The production build is written to `dist/` and can be hosted on a static web host. No backend, account, or API key is required. The VT323 pixel font is bundled locally through @fontsource/vt323 (OFL-1.1); no Google Fonts request is needed.

## Features

- Weekly schedule with day filters and previous/next week navigation
- Search by English or alternate series title and filter by genre
- Series detail dialogs with keyboard dismissal
- Personal watchlist persisted in the current browser's local storage
- Blue retro interface, locally bundled pixel font, and original CSS landscape artwork
- Release radar with Chainsaw Man movie and Jujutsu Kaisen season shortcuts
- Upcoming-only filtering, published broadcast slots with their source timezone, and source links
- Downloadable all-day calendar reminders for releases with a complete date

Sample weekly lineup times are expressed in UTC and repeat each week. They are not live airing data. Watchlists do not sync between devices; clearing browser storage removes them.

## Release radar

Search by title and format, or use a franchise shortcut. Enable **Upcoming only** to hide past releases. Results come directly from `https://api.jikan.moe/v4/anime` (up to 25 matches per query) and are cached in memory for five minutes. The API is public, unofficial, and requires no key. Network errors, rate limits, empty results, and unknown dates have explicit UI states.

Release dates generally refer to the Japanese premiere. They do not establish a US theater screening, streaming-service release, or local showtime. Broadcast slots are displayed in their source timezone only when the API supplies a day, time, and timezone; no next-episode instant is guessed. Partial dates remain partial. Calendar downloads are all-day `.ics` events only for complete release dates, not timed cinema bookings. Check linked MyAnimeList pages and official announcements before making plans.

Restricted cloud environments must allow `api.jikan.moe` for live lookups. Saving the allowlist draft does not apply it to the running machine; review/save the network setting before live validation. The rest of the app works without that service.
