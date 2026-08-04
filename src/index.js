require("dotenv").config();
const { Bot } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN);

require("./commands/start")(bot);
require("./commands/dep")(bot);
require("./commands/balance")(bot);
require("./commands/top")(bot);
require("./commands/dodep")(bot);
require("./commands/rules")(bot);
require("./commands/reset")(bot);
require("./commands/setpoints")(bot);
require("./handlers/dice")(bot);

bot.command("topicid", async (ctx) => {
  const threadId = ctx.message.message_thread_id;
  const chatId = ctx.chat.id;
  await ctx.reply(`chat_id: <code>${chatId}</code>\nmessage_thread_id: <code>${threadId || "нет (не топик)"}</code>`, {
    reply_parameters: { message_id: ctx.message.message_id },
    parse_mode: "HTML",
  });
});

bot.catch((err) => console.error("Bot error:", err));

bot.api.setMyCommands([
  { command: "reg", description: "Регистрация в казино" },
  { command: "dep", description: "Поставить очки на прокрут" },
  { command: "balance", description: "Твой баланс" },
  { command: "top", description: "Топ-10 игроков" },
  { command: "dodep", description: "Додепнуть (поставить что-то)" },
  { command: "rules", description: "Правила казино" },
  { command: "reset", description: "Обнулить игрока (админ)" },
  { command: "help", description: "Помощь и правила" },
]).catch((err) => console.error("Failed to set commands:", err));

bot.start({
  onStart: () => console.log("Casino bot started 🎰"),
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
