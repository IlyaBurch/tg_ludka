const { getOrRefreshPlayer } = require("../db");
const { placeBet } = require("../betTracker");

module.exports = function (bot) {
  bot.command("dep", async (ctx) => {
    const arg = ctx.match?.trim();
    const amount = parseInt(arg, 10);

    if (!arg || isNaN(amount) || amount < 1) {
      return ctx.reply("Напиши сколько ставишь. Пример: /dep 5", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const player = getOrRefreshPlayer(ctx.from.id, ctx.chat.id);
    if (!player) {
      return ctx.reply("Сначала зарегистрируйся через /reg, халявщик", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    if (player.points < amount) {
      return ctx.reply(`У тебя ${player.points} очков, лудик. Не хватает на ставку ${amount} 🫠`, {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    placeBet(ctx.from.id, ctx.chat.id, amount);
    return ctx.reply(
      `Ставка <b>${amount}</b> очков принята! Крути 🎰 — следующий прокрут на кону`,
      { reply_parameters: { message_id: ctx.message.message_id }, parse_mode: "HTML" }
    );
  });
};
