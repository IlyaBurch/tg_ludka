// ponytail: in-memory, resets on restart — fine for joke tracking
const active = new Map();

function key(userId, chatId) { return `${userId}:${chatId}`; }

function start(userId, chatId, description) {
  active.set(key(userId, chatId), { description, losses: 0 });
}

function trackSpin(userId, chatId, won) {
  const k = key(userId, chatId);
  const entry = active.get(k);
  if (!entry) return null;

  if (won) {
    active.delete(k);
    return null;
  }

  entry.losses += 1;
  if (entry.losses >= 5) {
    active.delete(k);
    return entry.description;
  }
  return null;
}

module.exports = { start, trackSpin };
