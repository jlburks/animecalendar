import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseDate, selectReleases, calendarEvent } from '../src/releases.js';
const anime = (id, year, month, day, status = 'Not yet aired') => ({ mal_id: id, title: 'Movie, Part; Two\nNew story', status, aired: { prop: { from: { year, month, day } } } });
test('missing and partial dates never become an invented day or time', () => {
  assert.deepEqual(releaseDate({}), { label: 'Date not announced', day: null });
  assert.deepEqual(releaseDate(anime(1, 2027, null, null)), { label: '2027', day: null });
  assert.deepEqual(releaseDate(anime(1, 2027, 4, null)), { label: 'April 2027', day: null });
  assert.equal(calendarEvent(anime(1, 2027, 4, null)), null);
  assert.deepEqual(releaseDate(anime(1, 2027, 4, 3)), { label: 'April 3, 2027', day: '2027-04-03' });
});
test('upcoming filter excludes released titles and keeps unannounced listings', () => {
  const entries = [anime(1, 2025, 9, 19, 'Finished Airing'), anime(2, 2027, 1, 3), anime(3, null, null, null), anime(2, 2027, 1, 3)];
  assert.deepEqual(selectReleases(entries, true, new Date(2026, 9, 26)).map(item => item.mal_id), [2, 3]);
  assert.deepEqual(selectReleases(entries, false).map(item => item.mal_id), [1, 2, 3]);
});
test('calendar export is an escaped all-day event with a correct exclusive end', () => {
  const event = calendarEvent(anime(7, 2027, 12, 31));
  assert.match(event, /DTSTART;VALUE=DATE:20271231\r\n/);
  assert.match(event, /DTEND;VALUE=DATE:20280101\r\n/);
  assert.match(event, /SUMMARY:Movie\\, Part\\; Two\\nNew story/);
  assert.ok(!event.includes('T000000'));
  assert.match(event, /UID:mal-7-2027-12-31@animecalendar/);
  for (const line of event.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75);
});
