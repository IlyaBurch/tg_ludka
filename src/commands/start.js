const { stmts, getOrRefreshPlayer } = require("../db");

module.exports = function (bot) {
  bot.command("dep", async (ctx) => {
    const { id } = ctx.from;
    const chatId = ctx.chat.id;
    const existing = getOrRefreshPlayer(id, chatId);

    if (existing) {
      return ctx.reply("Ты уже в деле, лудик. Крути давай 🎰", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    stmts.upsertPlayer.run(id, chatId, ctx.from.username || null, ctx.from.first_name || null);
    return ctx.reply(
      "Добро пожаловать в казино, лудик! Тебе выдано 10 бесплатных прокрутов. Удачи, она тебе понадобится 🫡",
      { reply_parameters: { message_id: ctx.message.message_id }, parse_mode: "HTML" }
    );
  });
};
