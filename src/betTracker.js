// ponytail: in-memory bets, reset on restart
const bets = new Map();

function key(userId, chatId) { return `${userId}:${chatId}`; }

function placeBet(userId, chatId, amount) {
  bets.set(key(userId, chatId), amount);
}

function takeBet(userId, chatId) {
  const k = key(userId, chatId);
  const amount = bets.get(k);
  if (!amount) return null;
  bets.delete(k);
  return amount;
}

module.exports = { placeBet, takeBet };
