export function handler(bot, m) {
  m.reply("Ini sebuah perintah restart");
  return bot;
}

handler.private = true; // Hanya bisa dijalankan di private chat
handler.onlyOwner = true; // Hanya bisa dijalankan oleh owner atau bot
handler.onlyPremium = false; // Hanya bisa dijalankan oleh owner, bot, atau user premium
