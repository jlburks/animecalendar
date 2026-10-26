import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchReleases } from '../src/release-api.js';
import { selectReleases, calendarEvent } from '../src/releases.js';
const response = data => ({ ok: true, json: async () => data });
test('successful Jikan response does not call backup, including empty results', async () => {
  let calls = 0;
  const result = await fetchReleases('Chainsaw Man', 'movie', async () => { calls++; return response({ data: [] }); });
  assert.equal(calls, 1); assert.equal(result.fallback, false); assert.deepEqual(result.data, []);
});
test('Jikan timeout falls back to AniList with matching format and source attribution', async () => {
  let calls = 0;
  const result = await fetchReleases('Jujutsu Kaisen', 'tv', async (url, options) => {
    assert.ok(options.signal);
    if (++calls === 1) throw new DOMException('Timed out', 'TimeoutError');
    assert.equal(url, 'https://graphql.anilist.co');
    assert.deepEqual(JSON.parse(options.body).variables, { search: 'Jujutsu Kaisen', format: 'TV' });
    return response({ data: { Page: { media: [
      { id: 123, title: { romaji: 'Future season' }, format: 'TV', status: 'NOT_YET_RELEASED', startDate: { year: 2027, month: 4, day: 2 } },
      { id: 124, title: { romaji: 'Unannounced sequel' }, status: 'NOT_YET_RELEASED', startDate: {} },
    ] } } });
  });
  assert.equal(result.provider, 'AniList'); assert.equal(result.fallback, true);
  assert.equal(selectReleases(result.data, true).length, 2);
  const event = calendarEvent(result.data[0]);
  assert.match(event, /UID:anilist-123-2027-04-02@animecalendar/);
  assert.match(event, /URL:https:\/\/anilist.co\/anime\/123/);
  assert.match(event, /Release date listed by AniList/);
  assert.equal(calendarEvent(result.data[1]), null);
});
test('both provider failures produce an actionable error', async () => {
  await assert.rejects(fetchReleases('Test', '', async () => ({ ok: false, status: 503 })), /Neither Jikan nor AniList/);
});
test('GraphQL errors cannot be mistaken for an empty successful search', async () => {
  await assert.rejects(fetchReleases('Test', '', async () => response({ errors: [{ message: 'Rate limited' }] })), /Neither Jikan nor AniList/);
});
