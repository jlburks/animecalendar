import test from 'node:test';
import assert from 'node:assert/strict';
import { shows, filterShows, weekDates } from '../src/data.js';

test('search matches titles and alternate titles without case sensitivity', () => {
  assert.deepEqual(filterShows(shows, { query: '  SOUSOU  ' }).map(show => show.id), ['frieren']);
  assert.equal(filterShows(shows, { query: 'no matching series' }).length, 0);
});
test('genre and watchlist filters work together', () => {
  assert.deepEqual(filterShows(shows, { genre: 'Fantasy', watchlistOnly: true, saved: ['solo', 'blue'] }).map(show => show.id), ['solo']);
  assert.equal(filterShows(shows, { watchlistOnly: true }).length, 0);
});
test('week navigation handles Sunday and year boundaries', () => {
  const week = weekDates(new Date(2027, 0, 3, 15));
  assert.equal(week[0].getFullYear(), 2026);
  assert.equal(week[0].getMonth(), 11);
  assert.equal(week[0].getDate(), 28);
  assert.equal(week[6].getDate(), 3);
  const next = weekDates(new Date(2027, 0, 3), 1);
  assert.equal(next[0].getDate(), 4);
  assert.equal(next[0].getDay(), 1);
});
test('sample schedule has unique IDs and valid episode and day data', () => {
  assert.equal(new Set(shows.map(show => show.id)).size, shows.length);
  for (const show of shows) {
    assert.ok(show.day >= 0 && show.day <= 6);
    assert.ok(show.episode > 0 && show.episode <= show.total);
    assert.match(show.time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
  }
});
