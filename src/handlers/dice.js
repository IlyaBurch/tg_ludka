const { stmts, getOrRefreshPlayer } = require("../db");
const { decodeSlots, calcWin } = require("../slots");

const LOSS_PHRASES = [
  "Лол, слил.",
  "В трубу.",
  "Мимо кассы, лудик.",
  "Даже бабушка крутит лучше.",
  "Ты точно не мог просто деньги на ветер выкинуть?",
  "Казино благодарит за донат.",
  "💀",
  "Лудоман в минусе, классика.",
  "Ты крутишь как мой дед — без результата.",
  "Может тебе в лото попробовать? Там тоже не повезёт.",
  "Статистика говорит что ты дно. Я тоже.",
  "Где-то заплакал один лудоман. Это ты.",
  "Крутил-крутил, да не выкрутил.",
  "Зато опыт. Опыт проигрыша.",
  "Ставь жопу и пробуй снова.",
  "Твоя удача ушла покурить. В 2019.",
  "Даже рандом тебя не любит.",
  "Ты — причина, почему казино в плюсе.",
  "Мимо. Как и всё в твоей жизни. Шутка. Или нет.",
  "Если бы неудача была суперсилой, ты бы был Марвел.",
  "Три разных символа. Как три развода.",
  "Додепни достоинство и попробуй ещё.",
  "Это дно? Нет, ты можешь глубже.",
  "Продай рот, купи удачу.",
  "🫠",
  "Слив засчитан. Следующий!",
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
      try { await ctx.deleteMessage(); } catch { }
      return ctx.reply("Сначала зарегистрируйся через /dep, халявщик", {
        reply_parameters: { message_id: msgId },
        parse_mode: "HTML",
      });
    }

    if (player.free_spins === 0 && player.points === 0) {
      try { await ctx.deleteMessage(); } catch { }
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

    function balanceStr() {
      const parts = [`💰 ${player.points}`];
      if (player.free_spins > 0) parts.push(`🎰 ${player.free_spins} фриспинов`);
      return parts.join(" | ");
    }

    if (payout > 0) {
      stmts.addWin.run(payout, payout, jackpot ? 1 : 0, userId, chatId);
      player.points += payout;
      const msg = jackpot
        ? `🎉 ОКУП! ${symbolStr} — +${payout} очков!\n${balanceStr()}`
        : `Неплохо, ${symbolStr} — +${payout}.\n${balanceStr()}`;

      return ctx.reply(msg, {
        reply_parameters: { message_id: msgId },
        parse_mode: "HTML",
      });
    }

    // loss
    stmts.addLoss.run(userId, chatId);
    const phrase = LOSS_PHRASES[Math.floor(Math.random() * LOSS_PHRASES.length)];
    return ctx.reply(`${phrase}\n${balanceStr()}`, {
      reply_parameters: { message_id: msgId },
      parse_mode: "HTML",
    });
  });
};
