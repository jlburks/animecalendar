import '@fontsource/vt323/latin-400.css';
import { mountReleases } from './release-panel.js';
import './style.css';
import { shows, days, filterShows, weekDates } from './data.js';

const app = document.querySelector('#app');
let saved;
try { const value = JSON.parse(localStorage.getItem('animecalendar-watchlist') || '[]'); saved = Array.isArray(value) ? value.filter(id => shows.some(show => show.id === id)) : []; } catch { saved = []; }
const state = { query: '', genre: 'All genres', saved, view: 'schedule', offset: 0, day: 'all' };
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const today = new Date();
const shortDate = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
function render() {
  const dates = weekDates(today, state.offset);
  const filtered = filterShows(shows, { ...state, watchlistOnly: state.view === 'watchlist' });
  const visible = filtered.filter(show => state.day === 'all' || show.day === Number(state.day));
  app.innerHTML = `
    <aside class="sidebar"><a class="brand" href="/" aria-label="Anime Calendar home"><span class="brand-mark">a<span>✦</span></span><span>anime<span class="brand-light">calendar</span><small>MAKE TIME FOR YOUR FAVORITES</small></span></a>
    <div class="nav-label">YOUR SPACE</div><nav aria-label="Main navigation"><button data-view="schedule" class="nav-item ${state.view === 'schedule' ? 'active' : ''}"><span>▦</span> Airing schedule</button><button data-view="watchlist" class="nav-item ${state.view === 'watchlist' ? 'active' : ''}"><span>♡</span> My watchlist <b>${state.saved.length}</b></button></nav>
    <div class="sidebar-note"><span>✧</span><h3>A little escape,<br>every day.</h3><p>Your next favorite story<br>is just an episode away.</p></div><div class="sidebar-footer"><span class="status-dot"></span> Your personal anime companion<small>Version 0.2 · Made for the fans</small></div></aside>
    <main><header><span class="breadcrumb">Your space <span>/</span> ${state.view === 'watchlist' ? 'My watchlist' : 'Airing schedule'}</span><span class="profile" title="Local browser profile">AC</span></header>
    <section class="intro"><div class="eyebrow"><span></span> A NEW WEEK, NEW STORIES</div><div class="title-row"><div><h1>${state.view === 'watchlist' ? 'Your favorites, all together.' : 'Your week in anime.'}</h1><p>${state.view === 'watchlist' ? 'A little collection of the stories you want to follow.' : 'Keep up with the stories you love. Discover the ones you’ll love next.'}</p></div><div class="week-stat"><strong>${state.view === 'watchlist' ? state.saved.length : shows.length}</strong><span>${state.view === 'watchlist' ? 'saved series' : 'series to discover'}</span></div></div></section>
    <section class="hero"><div class="hero-copy"><span class="pill">THE SPOTLIGHT</span><h2>Some journeys stay<br>with you forever.</h2><p>Frieren: Beyond Journey’s End</p><button data-detail="frieren" class="hero-button">Explore the story <span>↗</span></button></div><div class="hero-art" aria-hidden="true"><div class="moon"></div><div class="mountain back"></div><div class="mountain front"></div><div class="hero-symbol">✧</div><span class="art-caption">THE ADVENTURE CONTINUES</span></div><span class="hero-credit">Original landscape illustration</span></section>
    <section id="release-finder" class="release-finder" aria-label="Anime release lookup"></section>
    <section class="schedule"><div class="section-title"><h2>${state.view === 'watchlist' ? 'My watchlist' : 'The weekly lineup'} <span>${visible.length}</span></h2><span class="timezone">◷ Times shown in UTC</span></div>
    <div class="toolbar"><div class="week-control"><button data-week="-1" aria-label="Previous week">‹</button><span>${shortDate(dates[0])} – ${shortDate(dates[6])}, ${dates[6].getFullYear()}</span><button data-week="1" aria-label="Next week">›</button><button data-today class="today-button">This week</button></div><div class="filters"><label class="search"><span>⌕</span><input aria-label="Search anime" placeholder="Find an anime…" value="${escape(state.query)}"></label><select aria-label="Filter by genre">${['All genres', ...new Set(shows.flatMap(show => show.genres))].map(genre => `<option ${state.genre === genre ? 'selected' : ''}>${genre}</option>`).join('')}</select></div></div>
    <div class="day-tabs" role="group" aria-label="Filter by day"><button data-day="all" class="${state.day === 'all' ? 'selected' : ''}">Full week</button>${days.map((day, index) => `<button data-day="${index}" class="${state.day === String(index) ? 'selected' : ''}">${day.slice(0, 3)} <span>${dates[index].getDate()}</span>${state.offset === 0 && (today.getDay() + 6) % 7 === index ? '<i></i>' : ''}</button>`).join('')}</div>
    <div class="demo-notice"><span>✧</span> Preview schedule · Sample titles and times repeat each week. Use Release radar above for published movie and season dates.</div>
    <div class="lineup">${visible.length ? days.map((day, index) => { const entries = visible.filter(show => show.day === index); return entries.length ? `<section class="day-section"><div class="day-heading"><h3>${day} <span>${shortDate(dates[index])}</span></h3><span>${entries.length} ${entries.length === 1 ? 'episode' : 'episodes'}</span></div><div class="card-grid">${entries.map(card).join('')}</div></section>` : ''; }).join('') : `<div class="empty"><span>☾</span><h3>${state.view === 'watchlist' && !state.saved.length ? 'Your next story is waiting.' : 'No anime found.'}</h3><p>${state.view === 'watchlist' && !state.saved.length ? 'Tap the heart on any series to add it to your watchlist.' : 'Try another search, genre, or day.'}</p><button data-reset>Explore all anime</button></div>`}</div></section>
    <footer><span><span class="tiny-star">✦</span> Good stories deserve a place in your week.</span><span>Sample schedule · Watchlist stored on this device</span></footer></main><dialog id="detail"></dialog><div class="toast" role="status" aria-live="polite"></div>`;
  bind();
  mountReleases();
}
function card(show) {
  const isSaved = state.saved.includes(show.id);
  return `<article class="anime-card"><button class="cover ${show.landscape}" style="--accent:${show.color}" data-detail="${show.id}" aria-label="View ${escape(show.title)} details"><span class="cover-grain"></span><span class="cover-orbit"></span><span class="cover-icon">${show.icon}</span><span class="cover-label">${escape(show.subtitle)}</span><span class="rating">★ ${show.rating}</span></button><div class="card-body"><div class="air-time"><span class="status-dot"></span>${show.time} UTC <span>EP ${show.episode} / ${show.total}</span></div><div class="card-title"><button data-detail="${show.id}">${escape(show.title)}</button><button class="save ${isSaved ? 'saved' : ''}" data-save="${show.id}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove' : 'Save'} ${escape(show.title)} ${isSaved ? 'from' : 'to'} watchlist">${isSaved ? '♥' : '♡'}</button></div><p>${escape(show.subtitle)}</p><div class="tags">${show.genres.map(genre => `<span>${genre}</span>`).join('')}</div></div></article>`;
}
function bind() {
  app.querySelectorAll('[data-view]').forEach(button => button.onclick = () => { state.view = button.dataset.view; state.day = 'all'; render(); });
  app.querySelectorAll('[data-day]').forEach(button => button.onclick = () => { state.day = button.dataset.day; render(); });
  app.querySelectorAll('[data-week]').forEach(button => button.onclick = () => { state.offset += Number(button.dataset.week); render(); });
  app.querySelector('[data-today]').onclick = () => { state.offset = 0; render(); };
  app.querySelector('.filters select').onchange = event => { state.genre = event.target.value; render(); };
  app.querySelector('.search input').oninput = event => { const start = event.target.selectionStart; state.query = event.target.value; render(); const input = app.querySelector('.search input'); input.focus(); input.setSelectionRange(start, start); };
  app.querySelectorAll('[data-save]').forEach(button => button.onclick = () => {
    const id = button.dataset.save;
    state.saved = state.saved.includes(id) ? state.saved.filter(item => item !== id) : [...state.saved, id];
    let message = state.saved.includes(id) ? 'Added to your watchlist' : 'Removed from your watchlist';
    try { localStorage.setItem('animecalendar-watchlist', JSON.stringify(state.saved)); } catch { message = 'Updated for this session. Browser storage is unavailable.'; }
    render(); const toast = app.querySelector('.toast'); toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 2400);
  });
  app.querySelectorAll('[data-detail]').forEach(button => button.onclick = () => openDetail(button.dataset.detail));
  const reset = app.querySelector('[data-reset]');
  if (reset) reset.onclick = () => { state.view = 'schedule'; state.query = ''; state.genre = 'All genres'; state.day = 'all'; render(); };
}
function openDetail(id) {
  const show = shows.find(item => item.id === id);
  const dialog = app.querySelector('dialog');
  dialog.innerHTML = `<button class="close" aria-label="Close details">×</button><span class="modal-symbol" style="color:${show.color}">${show.icon}</span><div class="eyebrow">SERIES SPOTLIGHT</div><h2>${escape(show.title)}</h2><p class="subtitle">${escape(show.subtitle)}</p><p>${show.description}</p><div class="tags">${show.genres.map(genre => `<span>${genre}</span>`).join('')}<span>★ ${show.rating} sample rating</span></div><div class="modal-schedule">${days[show.day]} · ${show.time} UTC · Episode ${show.episode} of ${show.total}<small>Illustrative schedule. Broadcast times and ratings are sample data.</small></div><button class="hero-button modal-save">${state.saved.includes(id) ? 'Remove from watchlist' : 'Add to watchlist'} ♡</button>`;
  dialog.querySelector('.close').onclick = () => dialog.close();
  // Spotlight can open a series hidden by the active filters.
  dialog.querySelector('.modal-save').onclick = () => {
    state.saved = state.saved.includes(id) ? state.saved.filter(item => item !== id) : [...state.saved, id];
    let message = 'Watchlist updated';
    try { localStorage.setItem('animecalendar-watchlist', JSON.stringify(state.saved)); } catch { message = 'Updated for this session. Browser storage is unavailable.'; }
    dialog.close(); render(); const toast = app.querySelector('.toast'); toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 2400);
  };
  dialog.onclick = event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } };
  dialog.showModal();
}
render();
