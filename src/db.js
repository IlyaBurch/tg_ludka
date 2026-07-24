const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "casino.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    user_id    INTEGER NOT NULL,
    chat_id    INTEGER NOT NULL,
    username   TEXT,
    first_name TEXT,
    points     INTEGER DEFAULT 0,
    free_spins INTEGER DEFAULT 0,
    last_daily TEXT,
    total_won  INTEGER DEFAULT 0,
    total_lost INTEGER DEFAULT 0,
    jackpots   INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, chat_id)
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    chat_id     INTEGER NOT NULL,
    description TEXT,
    amount      INTEGER NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

const stmts = {
  getPlayer: db.prepare("SELECT * FROM players WHERE user_id = ? AND chat_id = ?"),
  upsertPlayer: db.prepare(`
    INSERT INTO players (user_id, chat_id, username, first_name, free_spins)
    VALUES (?, ?, ?, ?, 10)
    ON CONFLICT(user_id, chat_id) DO UPDATE SET username = excluded.username, first_name = excluded.first_name
  `),
  updateSpins: db.prepare("UPDATE players SET free_spins = ?, points = ? WHERE user_id = ? AND chat_id = ?"),
  addWin: db.prepare("UPDATE players SET points = points + ?, total_won = total_won + ?, jackpots = jackpots + ? WHERE user_id = ? AND chat_id = ?"),
  addDeposit: db.prepare("INSERT INTO deposits (user_id, chat_id, description, amount) VALUES (?, ?, ?, ?)"),
  addPoints: db.prepare("UPDATE players SET points = points + ? WHERE user_id = ? AND chat_id = ?"),
  refreshDaily: db.prepare("UPDATE players SET free_spins = free_spins + 5, last_daily = ? WHERE user_id = ? AND chat_id = ?"),
  addLoss: db.prepare("UPDATE players SET total_lost = total_lost + 1 WHERE user_id = ? AND chat_id = ?"),
  top10: db.prepare("SELECT username, first_name, points, jackpots FROM players WHERE chat_id = ? ORDER BY points DESC LIMIT 10"),
};

function getOrRefreshPlayer(userId, chatId) {
  const player = stmts.getPlayer.get(userId, chatId);
  if (!player) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (player.last_daily !== today) {
    stmts.refreshDaily.run(today, userId, chatId);
    player.free_spins += 5;
    player.last_daily = today;
  }
  return player;
}

module.exports = { db, stmts, getOrRefreshPlayer };
