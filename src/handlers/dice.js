const { stmts, getOrRefreshPlayer } = require("../db");
const { decodeSlots, calcWin } = require("../slots");
const tracker = require("../dodepTracker");
const { takeBet } = require("../betTracker");

const DODEP_LOSS_PHRASES = [
  "поставил <b>%s</b> — и всё просрал. Классика лудомана 💀",
  "додепнул <b>%s</b> и слил в ноль. Казино благодарит 🫡",
  "<b>%s</b> — проиграно. Можешь забирать, уже не нужно.",
  "5 из 5 мимо. <b>%s</b> улетает в трубу. Красиво жил 🫠",
  "<b>%s</b> — официально потеряно. Соболезнуем. Или нет.",
  "поставил <b>%s</b>, получил 5 проигрышей. Стабильность!",
  "<b>%s</b> — всё, прощай. Даже рандом отвернулся.",
];

const LOSS_PHRASES = [
  "Лол, слил.",
  "В трубу.",
  "Мимо кассы, лудик.",
  "Даже бабушка крутит лучше.",
  "Ты точно не мог просто деньги на ветер выкинуть?",
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
  "Если бы неудача была суперсилой, ты был бы Супермен.",
  "Три разных символа. Как три развода.",
  "Додепни достоинство и попробуй ещё.",
  "Это дно? Нет, ты можешь глубже.",
  "Продай рот, купи удачу.",
  "🫠",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = function (bot) {
  bot.on("message:dice", async (ctx) => {
    if (ctx.message.dice.emoji !== "🎰") return;
    if (ctx.chat.type === "private") return;
    if (ctx.message.forward_origin || ctx.message.forward_date) return;

    const forumChatId = process.env.FORUM_CHAT_ID ? Number(process.env.FORUM_CHAT_ID) : null;
    const forumThreadId = process.env.FORUM_THREAD_ID ? Number(process.env.FORUM_THREAD_ID) : null;

    if (forumChatId && ctx.chat.id === forumChatId) {
      if (ctx.message.message_thread_id !== forumThreadId) {
        try { await ctx.deleteMessage(); } catch { }
        return;
      }
    }

    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const msgId = ctx.message.message_id;

    const player = getOrRefreshPlayer(userId, chatId);

    if (!player) {
      try { await ctx.deleteMessage(); } catch { }
      return ctx.reply("Сначала зарегистрируйся через /reg, халявщик", {
        parse_mode: "HTML",
      });
    }

    if (player.free_spins === 0 && player.points === 0) {
      try { await ctx.deleteMessage(); } catch { }
      return ctx.reply("У тебя 0 на счету, лудик. Сначала додепни через /dodep 🫠", {
        parse_mode: "HTML",
      });
    }

    // check for a bet from /dep
    const bet = takeBet(userId, chatId);
    const cost = bet || 1;

    // deduct cost
    if (bet) {
      if (player.points < bet) {
        return ctx.reply(`У тебя ${player.points} очков — не хватает на ставку ${bet} 🫠`, {
          reply_parameters: { message_id: msgId },
          parse_mode: "HTML",
        });
      }
      player.points -= bet;
    } else if (player.free_spins > 0) {
      player.free_spins -= 1;
    } else {
      player.points -= 1;
    }
    stmts.updateSpins.run(player.free_spins, player.points, userId, chatId);

    await sleep(1600);

    const symbols = decodeSlots(ctx.message.dice.value);
    const { payout: basePayout, jackpot } = calcWin(symbols);
    const payout = basePayout * cost;
    const symbolStr = symbols.join(" ");

    function balanceStr() {
      const parts = [`💰 ${player.points}`];
      if (player.free_spins > 0) parts.push(`🎰 ${player.free_spins} фриспинов`);
      return parts.join(" | ");
    }

    const won = payout > 0;
    const lostStake = tracker.trackSpin(userId, chatId, won);

    if (won) {
      stmts.addWin.run(payout, payout, jackpot ? 1 : 0, userId, chatId);
      player.points += payout;
      const betNote = bet ? ` (ставка ×${cost})` : "";
      const msg = jackpot
        ? `🎉 ОКУП! ${symbolStr} — +${payout} очков${betNote}!\n${balanceStr()}`
        : `Неплохо, ${symbolStr} — +${payout}${betNote}.\n${balanceStr()}`;

      return ctx.reply(msg, {
        reply_parameters: { message_id: msgId },
        parse_mode: "HTML",
      });
    }

    // loss
    stmts.addLoss.run(userId, chatId);
    const phrase = LOSS_PHRASES[Math.floor(Math.random() * LOSS_PHRASES.length)];
    const betNote = bet ? ` (ставка ${cost})` : "";
    let text = `${phrase}${betNote}\n${balanceStr()}`;

    if (lostStake) {
      const dp = DODEP_LOSS_PHRASES[Math.floor(Math.random() * DODEP_LOSS_PHRASES.length)];
      text += `\n\n🚨 ${dp.replace("%s", lostStake)}`;
    }

    return ctx.reply(text, {
      reply_parameters: { message_id: msgId },
      parse_mode: "HTML",
    });
  });
};
