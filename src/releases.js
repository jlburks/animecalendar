export function releaseDate(anime) {
  const from = anime.aired?.prop?.from;
  if (!from?.year) return { label: 'Date not announced', day: null };
  if (!from.month) return { label: String(from.year), day: null };
  const month = new Date(Date.UTC(from.year, from.month - 1, 1)).toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  if (!from.day) return { label: `${month} ${from.year}`, day: null };
  const day = `${from.year}-${String(from.month).padStart(2, '0')}-${String(from.day).padStart(2, '0')}`;
  return { label: `${month} ${from.day}, ${from.year}`, day };
}
export function selectReleases(items, upcomingOnly, now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return [...new Map(items.map(item => [item.mal_id, item])).values()]
    .filter(item => !upcomingOnly || item.status === 'Not yet aired' || (releaseDate(item).day && releaseDate(item).day >= today))
    .sort((a,b) => (releaseDate(a).day || '9999').localeCompare(releaseDate(b).day || '9999'));
}
const calendarEscape = text => String(text).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
export function calendarEvent(anime) {
  const { day } = releaseDate(anime);
  if (!day) return null;
  const next = new Date(`${day}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  // All-day release dates never imply a confirmed premiere time or local cinema screening.
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Anime Calendar//Release reminder//EN', 'BEGIN:VEVENT', `UID:mal-${anime.mal_id}-${day}@animecalendar`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${day.replaceAll('-', '')}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0,10).replaceAll('-', '')}`, `SUMMARY:${calendarEscape(anime.title_english || anime.title)} — release`, 'DESCRIPTION:Release date listed by MyAnimeList via Jikan. Usually the Japanese release. Exact time and local availability are not confirmed. Check the source before making plans.', `URL:https://myanimelist.net/anime/${Number(anime.mal_id)}`, 'END:VEVENT', 'END:VCALENDAR'];
  // RFC 5545 limits content lines to 75 octets, including continuation whitespace.
  const encoder = new TextEncoder();
  return lines.map(line => { let result = '', length = 0; for (const char of line) { const size = encoder.encode(char).length; if (length + size > 75) { result += '\r\n '; length = 1; } result += char; length += size; } return result; }).join('\r\n') + '\r\n';
}
