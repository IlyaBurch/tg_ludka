require("dotenv").config();
const { Bot } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN);

require("./commands/start")(bot);
require("./commands/balance")(bot);
require("./commands/top")(bot);
require("./commands/dodep")(bot);
require("./commands/rules")(bot);
require("./handlers/dice")(bot);

bot.catch((err) => console.error("Bot error:", err));

bot.start({
  onStart: () => console.log("Casino bot started 🎰"),
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
