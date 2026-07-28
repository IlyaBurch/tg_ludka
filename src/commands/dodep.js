const { stmts, getOrRefreshPlayer } = require("../db");
const tracker = require("../dodepTracker");

const DODEP_AMOUNT = 5;

module.exports = function (bot) {
  bot.command("dodep", async (ctx) => {
    const text = ctx.match?.trim();
    if (!text) {
      return ctx.reply("Напиши что ставишь. Пример: /dodep рот Андрея", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const player = getOrRefreshPlayer(ctx.from.id, ctx.chat.id);
    if (!player) {
      return ctx.reply("Сначала зарегистрируйся через /dep, халявщик", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    stmts.addDeposit.run(ctx.from.id, ctx.chat.id, text, DODEP_AMOUNT);
    stmts.addPoints.run(DODEP_AMOUNT, ctx.from.id, ctx.chat.id);
    tracker.start(ctx.from.id, ctx.chat.id, text);

    return ctx.reply(
      `Принято! Ты поставил <b>${text}</b>. Тебе начислено ${DODEP_AMOUNT} очков. Крути, лудик 🎰`,
      { reply_parameters: { message_id: ctx.message.message_id }, parse_mode: "HTML" }
    );
  });
};
