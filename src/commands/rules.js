module.exports = function (bot) {
  bot.command(["rules", "help"], async (ctx) => {
    const text = `🎰 <b>ПРАВИЛА КАЗИНО</b> 🎰
1 прокрут = 1 очко ставки

━━━ Три в ряд (джекпот) ━━━
7️⃣ 7️⃣ 7️⃣  →  +50
BAR BAR BAR  →  +25
🍇 🍇 🍇  →  +15
🍋 🍋 🍋  →  +10

━━━ Два совпадения ━━━
7️⃣ 7️⃣ ✖️  →  +5
BAR BAR ✖️  →  +3
🍇🍇 / 🍋🍋  →  +2

━━━ Всё остальное ━━━
нет совпадений  →  0

📊 Каждый день — 3 бесплатных прокрута
💰 Закончились очки? Додепай /dodep
📉 Шанс 777: ~0.8%

Удачи, лудики 🫡`;

    return ctx.reply(text, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML",
    });
  });
};
