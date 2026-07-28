require("dotenv").config();
const { Bot } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN);

require("./commands/start")(bot);
require("./commands/dep")(bot);
require("./commands/balance")(bot);
require("./commands/top")(bot);
require("./commands/dodep")(bot);
require("./commands/rules")(bot);
require("./handlers/dice")(bot);

bot.catch((err) => console.error("Bot error:", err));

bot.api.setMyCommands([
  { command: "reg", description: "Регистрация в казино" },
  { command: "dep", description: "Поставить очки на прокрут" },
  { command: "balance", description: "Твой баланс" },
  { command: "top", description: "Топ-10 игроков" },
  { command: "dodep", description: "Додепнуть (поставить что-то)" },
  { command: "rules", description: "Правила казино" },
  { command: "help", description: "Помощь и правила" },
]).catch((err) => console.error("Failed to set commands:", err));

bot.start({
  onStart: () => console.log("Casino bot started 🎰"),
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
