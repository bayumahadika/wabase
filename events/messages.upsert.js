import {
  isJidGroup,
  isJidUser,
  isJidStatusBroadcast,
  jidDecode,
  jidNormalizedUser,
  getContentType,
  isJidNewsLetter,
  jidEncode,
} from "@bayumahadika/baileys";
import notifyEvent from "../utils/notifyEvent.js";

export default async function messagesUpsert(bot, m) {
  try {
    if (!m.message) return;
    m.id = m.key.id;
    m.chatId = m.key.remoteJid;
    m.isGroup = isJidGroup(m.chatId);
    m.isPrivate = isJidUser(m.chatId);
    m.isStory = isJidStatusBroadcast(m.chatId);
    m.isNewsletter = isJidNewsLetter(m.chatId);
    m.senderId = m.isNewsletter
      ? ""
      : m.isGroup || m.isStory
        ? m.key.participant || jidNormalizedUser(m.participant)
        : m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isOwner = jidDecode(m.senderId).user === global.owner.number;
    m.isPremium = !!global.db.premium.find(
      (user) => jidEncode(user, "s.whatsapp.net") === m.senderId,
    );
    m.type = getContentType(m.message);
    m.body =
      m.type === "conversation"
        ? m.message.conversation
        : m.message[m.type].caption ||
          m.message[m.type].text ||
          m.message[m.type].singleSelectReply?.selectedRowId ||
          m.message[m.type].selectedButtonId ||
          (m.message[m.type].nativeFlowResponseMessage?.paramsJson
            ? JSON.parse(m.message[m.type].nativeFlowResponseMessage.paramsJson)
                .id
            : "") ||
          "";
    m.text =
      m.type === "conversation"
        ? m.message.conversation
        : m.message[m.type].caption ||
          m.message[m.type].text ||
          m.message[m.type].description ||
          m.message[m.type].title ||
          m.message[m.type].contentText ||
          m.message[m.type].selectedDisplayText ||
          "";
    m.isCommand = m.body.trim().startsWith(global.bot.prefix);
    m.cmd = m.body
      .trim()
      .normalize("NFKC")
      .replace(global.bot.prefix, "")
      .split(" ")[0]
      .toLowerCase();
    m.args = m.body
      .trim()
      .replace(/^\S*\b/g, "")
      .split(global.bot.splitArgs)
      .map((arg) => arg.trim().normalize("NFKC"))
      .filter((arg) => arg);
    m.reply = (text) =>
      bot.sendMessage(
        m.chatId,
        {
          text,
        },
        {
          quoted: {
            key: {
              id: m.id,
              fromMe: false,
              remoteJid: "status@broadcast",
              participant: "0@s.whatsapp.net",
            },
            message: {
              conversation: `💬 ${m.text}`,
            },
          },
        },
      );
    try {
      notifyEvent(
        "Message Upsert",
        `
Dari: ${m.senderId}
Nama: ${m.pushName || "NoName"}
Pesan: ${m.text}
`.trim(),
      );
      for await (let command of global.bot.commands) {
        if (command.command === m.cmd) {
          if (command.handler["private"] && m.isGroup) return;

          if (command.handler["onlyOwner"] && !m.isOwner && !m.fromMe)
            return m.reply("Perintah ini hanya bisa dijalankan oleh owner");

          if (
            command.handler["onlyPremium"] &&
            !m.isOwner &&
            !m.fromMe &&
            !m.isPremium
          )
            return m.reply(
              "Perintah ini hanya bisa dijalankan oleh owner atau user premium",
            );
          await command.handler(bot, m);
          return;
        }
      }
      switch (m.cmd) {
        case "menu-case":
          {
            m.reply("Menu Case");
          }
          break;
        default:
          break;
      }
    } catch (err) {
      notifyEvent(
        "Message Upsert",
        `
Dari: ${m.senderId}
Nama: ${m.pushName || "NoName"}
Pesan: ${m.text}
Error: ${err.message}
`.trim(),
        "error",
      );
      console.log(err);
      m.reply(`Error: ${err.message}`);
    }
  } catch (err) {
    console.log(err);
  }
}
