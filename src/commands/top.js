const { stmts } = require("../db");

const MEDALS = ["🥇", "🥈", "🥉"];

module.exports = function (bot) {
  bot.command("top", async (ctx) => {
    const rows = stmts.top10.all(ctx.chat.id);
    if (!rows.length) {
      return ctx.reply("Ещё никто не играл. Будь первым лудиком — /dep", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const lines = rows.map((r, i) => {
      const medal = MEDALS[i] || `${i + 1}.`;
      const name = r.username ? `@${r.username}` : r.first_name;
      return `${medal} ${name} — ${r.points} очков`;
    });

    return ctx.reply(`🏆 <b>Топ игроков</b>\n\n${lines.join("\n")}`, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML",
    });
  });
};
