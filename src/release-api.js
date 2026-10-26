const QUERY = `query ($search: String!, $format: MediaFormat) {
  Page(page: 1, perPage: 25) {
    media(search: $search, type: ANIME, format: $format, isAdult: false, sort: SEARCH_MATCH) {
      id title { romaji english } format status startDate { year month day }
    }
  }
}`;
export function normalizeAniList(item) {
  return {
    key: `anilist-${item.id}`, mal_id: null,
    title: item.title.romaji || item.title.english,
    title_english: item.title.english,
    type: ({ MOVIE: 'Movie', TV: 'TV', ONA: 'ONA', TV_SHORT: 'TV Short' })[item.format] || item.format || 'Anime',
    status: ({ NOT_YET_RELEASED: 'Not yet aired', RELEASING: 'Currently Airing', FINISHED: 'Finished Airing', CANCELLED: 'Cancelled', HIATUS: 'On hiatus' })[item.status] || 'Status unknown',
    aired: { prop: { from: item.startDate || {} } },
    sourceName: 'AniList', sourceUrl: `https://anilist.co/anime/${item.id}`,
  };
}
async function getJson(fetcher, url, options = {}) {
  const response = await fetcher(url, { ...options, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
export async function fetchReleases(query, type, fetcher = fetch) {
  const params = new URLSearchParams({ q: query, limit: '25', sfw: 'true' });
  if (type) params.set('type', type);
  try {
    const payload = await getJson(fetcher, `https://api.jikan.moe/v4/anime?${params}`);
    if (!Array.isArray(payload.data)) throw new Error('Invalid response');
    return { provider: 'Jikan / MyAnimeList', fallback: false, data: payload.data.filter(item => Number.isInteger(item.mal_id) && item.mal_id > 0 && typeof item.title === 'string') };
  } catch {
    try {
      const payload = await getJson(fetcher, 'https://graphql.anilist.co', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: QUERY, variables: { search: query, format: ({ movie: 'MOVIE', tv: 'TV', ona: 'ONA' })[type] || null } }),
      });
      if (payload.errors?.length || !Array.isArray(payload.data?.Page?.media)) throw new Error('Invalid response');
      return { provider: 'AniList', fallback: true, data: payload.data.Page.media.filter(item => Number.isInteger(item.id) && item.id > 0 && (item.title?.romaji || item.title?.english)).map(normalizeAniList) };
    } catch {
      throw new Error('Neither Jikan nor AniList could complete the lookup. A service may be unavailable, rate-limited, or blocked by your network. Please try again later.');
    }
  }
}
