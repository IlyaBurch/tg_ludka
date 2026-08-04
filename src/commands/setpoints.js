const { stmts } = require("../db");

const OWNER_ID = 160907010;

module.exports = function (bot) {
  bot.command("setpoints", async (ctx) => {
    if (ctx.from.id !== OWNER_ID) {
      return ctx.reply("Эта команда только для владельца бота 🫠", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const amount = parseInt(ctx.match?.trim(), 10);
    if (isNaN(amount)) {
      return ctx.reply("Реплай на сообщение игрока + /setpoints &lt;число&gt;", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const reply = ctx.message.reply_to_message;
    if (!reply) {
      return ctx.reply("Ответь на сообщение игрока", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    const targetId = reply.from.id;
    const targetName = reply.from.username ? `@${reply.from.username}` : reply.from.first_name;
    const result = stmts.setPoints.run(amount, targetId, ctx.chat.id);

    if (result.changes === 0) {
      return ctx.reply("Игрок не зарегистрирован 🤷", {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "HTML",
      });
    }

    return ctx.reply(`${targetName} теперь имеет <b>${amount}</b> очков 🎰`, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML",
    });
  });
};
