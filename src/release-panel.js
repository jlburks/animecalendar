import { fetchReleases } from './release-api.js';
import { releaseDate, selectReleases, calendarEvent, releaseKey, releaseSourceUrl } from './releases.js';
const state = { query: 'Chainsaw Man', type: 'movie', upcoming: false, data: [], loading: false, error: '', searched: false, provider: '', fallback: false };
const cache = new Map();
let requestId = 0;
const escape = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function mountReleases() {
  const root = document.querySelector('#release-finder');
  if (!root) return;
  const results = selectReleases(state.data, state.upcoming);
  root.innerHTML = `<div class="section-title"><h2>Release radar <span>LIVE LOOKUP</span></h2><span class="timezone">Jikan + AniList backup</span></div><p class="radar-description">Find the next movie or season. Keep a real release date on your calendar.</p>
  <form class="release-search"><label>Anime title<input name="title" aria-label="Release title" minlength="2" maxlength="120" required value="${escape(state.query)}" placeholder="e.g. Jujutsu Kaisen"></label><label>Format<select name="format" aria-label="Release format"><option value="">All formats</option><option value="movie" ${state.type === 'movie' ? 'selected' : ''}>Movies</option><option value="tv" ${state.type === 'tv' ? 'selected' : ''}>TV seasons</option><option value="ona" ${state.type === 'ona' ? 'selected' : ''}>Online series</option></select></label><button class="hero-button" ${state.loading ? 'disabled' : ''}>${state.loading ? 'Searching…' : 'Find releases ↗'}</button></form>
  <div class="radar-options"><div class="quick-search"><button data-quick="Chainsaw Man" data-type="movie">Chainsaw Man movies</button><button data-quick="Jujutsu Kaisen" data-type="tv">Jujutsu Kaisen seasons</button></div><label><input type="checkbox" ${state.upcoming ? 'checked' : ''}> Upcoming only</label></div>
  <p class="release-disclaimer">Dates generally refer to the Japanese release, not local cinema showtimes or streaming availability. A date is not an exact time slot. Unknown dates stay unannounced.</p>
  ${state.fallback && !state.loading && !state.error ? '<p class="release-disclaimer" role="status">Jikan did not respond successfully. Showing results from AniList.</p>' : ''}<div class="release-results" aria-live="polite" aria-busy="${state.loading}">${state.loading ? '<p class="radar-message">Checking Jikan, then AniList if needed… Each service has an 8-second connection timeout.</p>' : state.error ? `<div class="radar-message" role="alert">${escape(state.error)} <button data-retry>Try again</button></div>` : results.length ? results.map(anime => {
    const date = releaseDate(anime);
    const broadcast = anime.broadcast?.time && anime.broadcast?.timezone && anime.broadcast?.day ? `${anime.broadcast.day}, ${anime.broadcast.time} (${anime.broadcast.timezone})` : 'Exact time not announced';
    return `<article class="release-card"><div class="release-badge">${escape(anime.type || 'Anime')} · ${escape(anime.status || 'Status unknown')}</div><h3>${escape(anime.title_english || anime.title)}</h3><p class="alternate-title">${escape(anime.title)}</p><strong>${escape(date.label)}</strong><p class="broadcast">${escape(broadcast)}</p><div class="release-actions"><a href="${escape(releaseSourceUrl(anime))}" target="_blank" rel="noopener noreferrer">Check source ↗</a>${date.day ? `<button data-calendar="${escape(releaseKey(anime))}">+ Calendar</button>` : '<span>Awaiting announcement</span>'}</div></article>`;
  }).join('') : state.searched ? '<p class="radar-message">No matching releases found. Try all formats or turn off “Upcoming only” to see earlier entries. An unannounced sequel may not have a listing yet.</p>' : '<p class="radar-message">Choose a title to look up its published release information.</p>'}</div>${state.searched && !state.loading && !state.error ? `<p class="radar-credit">Source: ${escape(state.provider)}. Results may be incomplete or change; verify the source before making plans. Up to 25 matches per search.</p>` : ''}`;
  root.querySelector('form').onsubmit = event => { event.preventDefault(); const form = new FormData(event.currentTarget); state.query = String(form.get('title')).trim(); state.type = String(form.get('format')); if (state.query.length >= 2) search(); };
  root.querySelectorAll('[data-quick]').forEach(button => button.onclick = () => { state.query = button.dataset.quick; state.type = button.dataset.type; search(); });
  root.querySelector('[type="checkbox"]').onchange = event => { state.upcoming = event.target.checked; mountReleases(); };
  root.querySelector('[data-retry]')?.addEventListener('click', () => search());
  root.querySelectorAll('[data-calendar]').forEach(button => button.onclick = () => {
    const anime = state.data.find(item => releaseKey(item) === button.dataset.calendar);
    const content = calendarEvent(anime); if (!content) return;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `anime-release-${releaseKey(anime)}.ics`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
async function search() {
  const id = ++requestId;
  state.loading = true; state.error = ''; state.searched = true; mountReleases();
  const params = new URLSearchParams({ q: state.query, limit: '25', sfw: 'true' });
  if (state.type) params.set('type', state.type);
  const key = params.toString();
  try {
    const cached = cache.get(key);
    let result;
    if (cached && Date.now() - cached.time < 300000) result = cached.result;
    else {
      result = await fetchReleases(state.query, state.type);
      cache.set(key, { result, time: Date.now() });
    }
    if (id === requestId) { state.data = result.data; state.provider = result.provider; state.fallback = result.fallback; }
  } catch (error) {
    if (id === requestId) { state.data = []; state.error = error.name === 'TimeoutError' ? 'The release lookup timed out. Please try again.' : error instanceof TypeError ? 'Could not connect to the release service. Check your connection or try again later.' : error.message; }
  } finally { if (id === requestId) { state.loading = false; mountReleases(); } }
}
