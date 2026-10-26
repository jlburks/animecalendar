// Illustrative schedule, not live broadcast information.
export const shows = [
  { id: 'frieren', title: 'Frieren: Beyond Journey’s End', subtitle: 'Sousou no Frieren', day: 0, time: '09:00', episode: 8, total: 28, genres: ['Fantasy', 'Adventure'], rating: '9.3', color: '#789b91', icon: '✧', landscape: 'forest', description: 'An elven mage retraces an old adventure and discovers what it means to connect with others.' },
  { id: 'solo', title: 'Solo Leveling', subtitle: 'Ore dake Level Up na Ken', day: 0, time: '12:30', episode: 6, total: 12, genres: ['Action', 'Fantasy'], rating: '8.4', color: '#8c78c6', icon: '⚔', landscape: 'city', description: 'A low-ranked hunter finds a mysterious power that lets him grow beyond every limit.' },
  { id: 'apothecary', title: 'The Apothecary Diaries', subtitle: 'Kusuriya no Hitorigoto', day: 1, time: '10:00', episode: 14, total: 24, genres: ['Mystery', 'Drama'], rating: '8.9', color: '#7fae9c', icon: '❀', landscape: 'forest', description: 'A sharp-eyed apothecary solves the secrets of an imperial court with curiosity and a little poison expertise.' },
  { id: 'dandadan', title: 'DAN DA DAN', subtitle: 'Dandadan', day: 2, time: '09:00', episode: 5, total: 12, genres: ['Action', 'Comedy'], rating: '8.7', color: '#d47765', icon: '◉', landscape: 'city', description: 'Two classmates tumble into a chaotic world of aliens, spirits, and unexpected friendship.' },
  { id: 'blue', title: 'Blue Box', subtitle: 'Ao no Hako', day: 3, time: '08:30', episode: 10, total: 25, genres: ['Romance', 'Sports'], rating: '8.2', color: '#77a7ce', icon: '◇', landscape: 'sea', description: 'Early mornings in the school gym bring a badminton player closer to his basketball-playing crush.' },
  { id: 'dungeon', title: 'Delicious in Dungeon', subtitle: 'Dungeon Meshi', day: 3, time: '11:00', episode: 9, total: 24, genres: ['Fantasy', 'Comedy'], rating: '8.6', color: '#c6a56b', icon: '♜', landscape: 'forest', description: 'An adventuring party cooks its way through a dungeon on a rescue mission unlike any other.' },
  { id: 'spy', title: 'SPY × FAMILY', subtitle: 'Spy x Family', day: 4, time: '10:30', episode: 7, total: 12, genres: ['Comedy', 'Action'], rating: '8.5', color: '#9ab994', icon: '✦', landscape: 'city', description: 'A spy, an assassin, and a telepath build a family while keeping their extraordinary lives secret.' },
  { id: 'demon', title: 'Demon Slayer', subtitle: 'Kimetsu no Yaiba', day: 5, time: '09:15', episode: 4, total: 11, genres: ['Action', 'Fantasy'], rating: '8.6', color: '#ba838c', icon: '☾', landscape: 'forest', description: 'A kindhearted swordsman faces powerful demons in his quest to save his sister.' },
  { id: 'haikyu', title: 'HAIKYU!!', subtitle: 'Haikyuu!!', day: 6, time: '08:00', episode: 12, total: 25, genres: ['Sports', 'Drama'], rating: '8.8', color: '#d69c65', icon: '◈', landscape: 'sea', description: 'A determined volleyball player and his teammates learn to fly together on the court.' }
];
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export function filterShows(items, { query = '', genre = 'All genres', watchlistOnly = false, saved = [] } = {}) {
  const normalized = query.trim().toLowerCase();
  return items.filter(show => (!normalized || `${show.title} ${show.subtitle}`.toLowerCase().includes(normalized)) && (genre === 'All genres' || show.genres.includes(genre)) && (!watchlistOnly || saved.includes(show.id)));
}
export function weekDates(date = new Date(), offset = 0) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7 + offset * 7);
  return days.map((_, index) => { const day = new Date(monday); day.setDate(day.getDate() + index); return day; });
}
