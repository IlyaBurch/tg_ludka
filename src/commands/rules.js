module.exports = function (bot) {
  bot.command(["rules", "help"], async (ctx) => {
    const text = `🎰 <b>ПРАВИЛА КАЗИНО</b> 🎰
1 прокрут = 1 очко ставки

━━━ Три в ряд (джекпот) ━━━
7️⃣ 7️⃣ 7️⃣  →  +50
BAR BAR BAR  →  +25
🍇 🍇 🍇  →  +15
🍋 🍋 🍋  →  +10

━━━ Всё остальное ━━━
нет совпадений  →  0

📊 Каждый день — 5 бесплатных прокрутов
💰 Закончились очки? Додепай /dodep
🎲 Повысить ставку? /dep &lt;число&gt;
📉 Шанс 777: ~0.8%

Удачи, лудики 🫡`;

    return ctx.reply(text, {
      reply_parameters: { message_id: ctx.message.message_id },
      parse_mode: "HTML",
    });
  });
};
