export function handler(bot, m) {
  console.log(m);
  m.reply("Ini sebuah perintah sticker");
  return bot;
}

handler.private = true; // Hanya bisa dijalankan di private chat
handler.onlyOwner = false; // Hanya bisa dijalankan oleh owner atau bot
handler.onlyPremium = true; // Hanya bisa dijalankan oleh owner, bot, atau user premium
