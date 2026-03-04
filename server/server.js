const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Database ---
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'pushups.db');
const db = new Database(dbPath);

// WAL mode для лучшей производительности
db.pragma('journal_mode = WAL');

// Создаём таблицы
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    count INTEGER NOT NULL,
    duration REAL NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (player_id) REFERENCES players(id)
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_player ON sessions(player_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
`);

// --- Prepared Statements (для скорости) ---
const stmts = {
  getPlayers: db.prepare(`
    SELECT 
      p.id,
      p.name,
      COALESCE(SUM(s.count), 0) as total_pushups,
      COALESCE(MAX(s.count), 0) as best_session,
      COUNT(s.id) as sessions_count,
      MAX(s.date) as last_active_date
    FROM players p
    LEFT JOIN sessions s ON p.id = s.player_id
    GROUP BY p.id
    ORDER BY total_pushups DESC
  `),

  getPlayer: db.prepare('SELECT * FROM players WHERE id = ?'),
  getPlayerByName: db.prepare('SELECT * FROM players WHERE name = ? COLLATE NOCASE'),
  insertPlayer: db.prepare('INSERT INTO players (id, name) VALUES (?, ?)'),
  deletePlayer: db.prepare('DELETE FROM players WHERE id = ?'),

  insertSession: db.prepare('INSERT INTO sessions (id, player_id, count, duration, date) VALUES (?, ?, ?, ?, ?)'),
  getSessionsByPlayer: db.prepare('SELECT * FROM sessions WHERE player_id = ? ORDER BY date DESC LIMIT ?'),
  
  getDailyStats: db.prepare(`
    SELECT 
      date,
      SUM(count) as total_pushups,
      COUNT(*) as sessions_count,
      SUM(duration) as total_duration,
      MAX(count) as best_session
    FROM sessions
    WHERE date >= ?
    GROUP BY date
    ORDER BY date DESC
  `),

  getDailyStatsForPlayer: db.prepare(`
    SELECT 
      date,
      SUM(count) as total_pushups,
      COUNT(*) as sessions_count,
      SUM(duration) as total_duration,
      MAX(count) as best_session
    FROM sessions
    WHERE player_id = ? AND date >= ?
    GROUP BY date
    ORDER BY date DESC
  `),

  getLeaderboard: db.prepare(`
    SELECT 
      p.id,
      p.name,
      COALESCE(SUM(s.count), 0) as total_pushups,
      COALESCE(MAX(s.count), 0) as best_session,
      COUNT(s.id) as sessions_count,
      COALESCE(ROUND(AVG(s.count), 1), 0) as average_per_session,
      MAX(s.date) as last_active_date
    FROM players p
    LEFT JOIN sessions s ON p.id = s.player_id
    GROUP BY p.id
    ORDER BY total_pushups DESC
  `),

  getStreaks: db.prepare(`
    SELECT DISTINCT date FROM sessions 
    WHERE player_id = ? 
    ORDER BY date DESC
  `),

  getTodayTotal: db.prepare(`
    SELECT COALESCE(SUM(count), 0) as total
    FROM sessions
    WHERE date = date('now')
  `),

  getTeamStats: db.prepare(`
    SELECT 
      COALESCE(SUM(count), 0) as total_pushups,
      COUNT(DISTINCT player_id) as active_players,
      COUNT(*) as total_sessions
    FROM sessions
    WHERE date >= ?
  `),
};

// --- Вычисление стриков ---
function calculateStreak(playerId) {
  const dates = stmts.getStreaks.all(playerId).map(r => r.date);
  if (dates.length === 0) return 0;

  let streak = 1;
  const today = new Date().toISOString().split('T')[0];
  
  // Если последний день не сегодня и не вчера — стрик сброшен
  const lastDate = dates[0];
  const diffFromToday = daysDiff(lastDate, today);
  if (diffFromToday > 1) return 0;

  for (let i = 1; i < dates.length; i++) {
    if (daysDiff(dates[i], dates[i - 1]) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function daysDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// --- API Routes ---

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    name: 'PushUp Tracker API',
    version: '1.0.0',
    today_total: stmts.getTodayTotal.get().total
  });
});

// === PLAYERS ===

// Получить всех игроков
app.get('/api/players', (req, res) => {
  try {
    const players = stmts.getLeaderboard.all().map(p => ({
      ...p,
      streak: calculateStreak(p.id)
    }));
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать или получить игрока по имени
app.post('/api/players', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Имя обязательно' });
    }

    const trimmed = name.trim();
    
    // Проверяем, есть ли уже такой игрок
    let player = stmts.getPlayerByName.get(trimmed);
    if (player) {
      return res.json({ ...player, created: false });
    }

    // Создаём нового
    const id = generateId();
    stmts.insertPlayer.run(id, trimmed);
    player = stmts.getPlayer.get(id);
    res.status(201).json({ ...player, created: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить игрока
app.delete('/api/players/:id', (req, res) => {
  try {
    const result = stmts.deletePlayer.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Игрок не найден' });
    }
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === SESSIONS ===

// Записать сессию
app.post('/api/sessions', (req, res) => {
  try {
    const { player_id, count, duration, date } = req.body;

    if (!player_id || !count || count <= 0) {
      return res.status(400).json({ error: 'player_id и count обязательны' });
    }

    // Проверяем что игрок существует
    const player = stmts.getPlayer.get(player_id);
    if (!player) {
      return res.status(404).json({ error: 'Игрок не найден' });
    }

    const id = generateId();
    const sessionDate = date || new Date().toISOString().split('T')[0];
    
    stmts.insertSession.run(id, player_id, count, duration || 0, sessionDate);

    res.status(201).json({ 
      id, 
      player_id, 
      count, 
      duration: duration || 0, 
      date: sessionDate 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить сессии игрока
app.get('/api/sessions/:playerId', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const sessions = stmts.getSessionsByPlayer.all(req.params.playerId, limit);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === LEADERBOARD ===

app.get('/api/leaderboard', (req, res) => {
  try {
    const players = stmts.getLeaderboard.all().map(p => ({
      ...p,
      streak: calculateStreak(p.id)
    }));
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === STATS ===

// Общая статистика команды
app.get('/api/stats/team', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = daysAgo(days);
    
    const team = stmts.getTeamStats.get(since);
    const daily = stmts.getDailyStats.all(since);
    const todayTotal = stmts.getTodayTotal.get().total;

    res.json({
      today: todayTotal,
      period: { days, ...team },
      daily
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Статистика конкретного игрока
app.get('/api/stats/:playerId', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = daysAgo(days);
    
    const daily = stmts.getDailyStatsForPlayer.all(req.params.playerId, since);
    const player = stmts.getPlayer.get(req.params.playerId);

    if (!player) {
      return res.status(404).json({ error: 'Игрок не найден' });
    }

    res.json({
      player: player.name,
      streak: calculateStreak(req.params.playerId),
      daily
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Helpers ---

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// --- Start ---
app.listen(PORT, () => {
  console.log(`💪 PushUp Tracker API running on port ${PORT}`);
  console.log(`   Database: ${dbPath}`);
  
  const playerCount = db.prepare('SELECT COUNT(*) as c FROM players').get().c;
  const sessionCount = db.prepare('SELECT COUNT(*) as c FROM sessions').get().c;
  console.log(`   Players: ${playerCount}, Sessions: ${sessionCount}`);
});
