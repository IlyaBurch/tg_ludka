const { stmts, getOrRefreshPlayer } = require("../db");
const { decodeSlots, calcWin } = require("../slots");

const LOSS_PHRASES = [
  "Лол, слил.",
  "В трубу.",
  "Мимо кассы, лудик.",
  "Даже бабушка крутит лучше.",
  "Ты точно не мог просто деньги на ветер?",
  "Казино благодарит за донат.",
  "💀",
  "Лудоман в минусе, классика.",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = function (bot) {
  bot.on("message:dice", async (ctx) => {
    if (ctx.message.dice.emoji !== "🎰") return;
    if (ctx.chat.type === "private") return;

    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const msgId = ctx.message.message_id;

    const player = getOrRefreshPlayer(userId, chatId);

    if (!player) {
      try { await ctx.deleteMessage(); } catch {}
      return ctx.reply("Сначала зарегистрируйся через /dep, халявщик", {
        reply_parameters: { message_id: msgId },
        parse_mode: "HTML",
      });
    }

    if (player.free_spins === 0 && player.points === 0) {
      try { await ctx.deleteMessage(); } catch {}
      return ctx.reply("У тебя 0 на счету, лудик. Сначала додепни через /dodep 🫠", {
        reply_parameters: { message_id: msgId },
        parse_mode: "HTML",
      });
    }

    // deduct 1 spin
    if (player.free_spins > 0) {
      player.free_spins -= 1;
    } else {
      player.points -= 1;
    }
    stmts.updateSpins.run(player.free_spins, player.points, userId, chatId);

    await sleep(3000);

    const symbols = decodeSlots(ctx.message.dice.value);
    const { payout, jackpot } = calcWin(symbols);
    const symbolStr = symbols.join(" ");

    if (payout > 0) {
      stmts.addWin.run(payout, payout, jackpot ? 1 : 0, userId, chatId);
      const newBalance = player.points + payout;
      const msg = jackpot
        ? `🎉 ОКУП! ${symbolStr} — +${payout} очков! Баланс: ${newBalance}`
        : `Неплохо, ${symbolStr} — +${payout}. Баланс: ${newBalance}`;

      return ctx.reply(msg, {
        reply_parameters: { message_id: msgId },
        parse_mode: "HTML",
      });
    }

    // loss
    stmts.addLoss.run(userId, chatId);
    const phrase = LOSS_PHRASES[Math.floor(Math.random() * LOSS_PHRASES.length)];
    return ctx.reply(`${phrase} Баланс: ${player.points}`, {
      reply_parameters: { message_id: msgId },
      parse_mode: "HTML",
    });
  });
};
