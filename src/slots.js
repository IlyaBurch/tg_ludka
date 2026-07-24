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
const DOUBLE_PAY = { "7️⃣": 5, "BAR": 3, "🍇": 2, "🍋": 2 };

function calcWin(symbols) {
  const [a, b, c] = symbols;
  if (a === b && b === c) return { payout: TRIPLE_PAY[a] || 0, jackpot: true };

  // any two match
  const match = (a === b) ? a : (a === c) ? a : (b === c) ? b : null;
  if (match) return { payout: DOUBLE_PAY[match] || 0, jackpot: false };

  return { payout: 0, jackpot: false };
}

module.exports = { decodeSlots, calcWin };
