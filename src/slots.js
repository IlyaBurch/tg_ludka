const SYMBOLS = ["BAR", "🍇", "🍋", "7️⃣"];

function decodeSlots(value) {
  const v = value - 1;
  return [
    SYMBOLS[v % 4],
    SYMBOLS[Math.floor(v / 4) % 4],
    SYMBOLS[Math.floor(v / 16) % 4],
  ];
}

// ponytail: map lookup, no class hierarchy for 4 payouts
const TRIPLE_PAY = { "7️⃣": 50, "BAR": 25, "🍇": 15, "🍋": 10 };

function calcWin(symbols) {
  const [a, b, c] = symbols;
  if (a === b && b === c) return { payout: TRIPLE_PAY[a] || 0, jackpot: true };
  return { payout: 0, jackpot: false };
}

module.exports = { decodeSlots, calcWin };
