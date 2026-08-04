const { stmts } = require("../db");

module.exports = function (bot) {
  bot.command("reset", async (ctx) => {
    const OWNER_ID = 160907010;
    const member = await ctx.getChatMember(ctx.from.id);
    if (ctx.from.id !== OWNER_ID && !["creator", "administrator"].includes(member.status)) {
      return ctx.reply("Только админы могут обнулять игроков, лудик 🫠", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const reply = ctx.message.reply_to_message;
    if (!reply) {
      return ctx.reply("Ответь на сообщение игрока, которого хочешь обнулить. Пример: реплай → /reset", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const targetId = reply.from.id;
    const targetName = reply.from.username ? `@${reply.from.username}` : reply.from.first_name;
    const result = stmts.resetPlayer.run(targetId, ctx.chat.id);

    if (result.changes === 0) {
      return ctx.reply("Этот игрок не зарегистрирован 🤷", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    return ctx.reply(`${targetName} обнулён. Добро пожаловать на дно, лудик 💀`, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML",
    });
  });
};
