const { getOrRefreshPlayer } = require("../db");

module.exports = function (bot) {
  bot.command("balance", async (ctx) => {
    const player = getOrRefreshPlayer(ctx.from.id, ctx.chat.id);
    if (!player) {
      return ctx.reply("Ты ещё не зарегистрирован. Жми /dep, лудик", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const text = [
      `💰 <b>Баланс:</b> ${player.points} очков`,
      `🎰 <b>Фри-спины:</b> ${player.free_spins}`,
      `📈 <b>Всего выиграно:</b> ${player.total_won}`,
      `📉 <b>Всего проиграно:</b> ${player.total_lost}`,
      `🏆 <b>Джекпотов:</b> ${player.jackpots}`,
    ].join("\n");

    return ctx.reply(text, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML",
    });
  });
};
