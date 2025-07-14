export function handler(bot, m) {
  console.log(m);
  m.reply("Ini sebuah perintah menu");
  return bot;
}

handler.private = false; // Hanya bisa dijalankan di private chat (jika true)
handler.onlyOwner = false; // Hanya bisa dijalankan oleh owner atau bot (jika true)
handler.onlyPremium = false; // Hanya bisa dijalankan oleh owner, bot, atau user premium (jika true)
