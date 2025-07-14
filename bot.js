import "./config/bot.js";
import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    isJidNewsletter
} from "baileys";
import pino from "pino";
import fs from "fs";

// UTILS
import question from "./utils/question.js";

import messagesUpsert from "./events/messages.upsert.js";

(async function start(usePairingCode = true) {
    const session = await useMultiFileAuthState("session");
    const bot = makeWASocket({
        version: (await fetchLatestBaileysVersion()).version,
        printQRInTerminal: !usePairingCode,
        auth: session.state,
        logger: pino({ level: "silent" }).child({ level: "silent" }),
        shouldIgnoreJid: jid => isJidNewsletter(jid)
    });
    if (usePairingCode && !bot.user && !bot.authState.creds.registered) {
        if (
            await (async () => {
                return (
                    (
                        await question(
                            "Ingin terhubung menggunakan pairing code? [Y/n]: "
                        )
                    ).toLowerCase() === "n"
                );
            })()
        )
            return start(false);
        const waNumber = (
            await question("Masukkan nomor WhatsApp anda: +")
        ).replace(/\D/g, "");
        /// VALIDASI WA Number
        if (global.bot.number && global.bot.number !== waNumber) {
            console.log(
                `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan script whatsapp bot ini\x1b[0m\n-> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
            );
            return process.exit();
        }
        /// Valiadi wa number dari github
        if (
            typeof global.bot.numbers === "object" &&
            !!global.bot.numbers?.find(number => number !== waNumber)
        ) {
            console.log(
                `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan script whatsapp bot ini\x1b[0m\n-> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
            );
            return process.exit();
        }
        const code = await bot.requestPairingCode(waNumber);
        console.log(`\x1b[44;1m\x20PAIRING CODE\x20\x1b[0m\x20${code}`);
    }
    bot.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            console.log(lastDisconnect.error);
            const { statusCode, error } = lastDisconnect.error.output.payload;
            if (statusCode === 401 && error === "Unauthorized") {
                await fs.promises.rm("session", {
                    recursive: true,
                    force: true
                });
            }
            return start();
        }
        if (connection === "open") {
            /// VALIDASI WA Number
            if (
                global.bot.number &&
                global.bot.number !== bot.user.id.split(":")[0]
            ) {
                console.log(
                    `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan script whatsapp bot ini\x1b[0m\n-> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
                );
                return process.exit();
            }
            if (
                typeof global.bot.numbers === "object" &&
                !!global.bot.numbers?.find(number => number !== bot.user.id.split(":")[0])
            ) {
                console.log(
                    `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan script whatsapp bot ini\x1b[0m\n-> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
                );
                return process.exit();
            }
            console.log(
                "Berhasil terhubung dengan: " + bot.user.id.split(":")[0]
            );
        }
    });
    bot.ev.on("creds.update", session.saveCreds);
    bot.ev.on("messages.upsert", ({ messages }) =>
        messagesUpsert(bot, messages[0])
    );
})();
