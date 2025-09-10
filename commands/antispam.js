const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");
const { contextInfo } = require("../utils/contextInfo");

const antispamFile = path.join(__dirname, "../data/antiSpamGroups.json");

// Charger les groupes anti-spam
function loadAntiSpamGroups() {
    if (!fs.existsSync(antispamFile)) return new Set();
    try {
        const groups = JSON.parse(fs.readFileSync(antispamFile, "utf-8"));
        return new Set(groups);
    } catch {
        return new Set();
    }
}

// Sauvegarder les groupes anti-spam
function saveAntiSpamGroups(groups) {
    fs.writeFileSync(antispamFile, JSON.stringify([...groups], null, 4));
}

// Initialisation globale
if (!global.antiSpamGroups) global.antiSpamGroups = loadAntiSpamGroups();
if (!global.userMessages) global.userMessages = new Map(); // Historique messages par utilisateur

const SPAM_THRESHOLD = 7; // messages max
const SPAM_WINDOW = 10000; // 10 secondes

module.exports = {
    name: "antispam",
    description: "Active ou désactive l'anti-spam dans un groupe",
    category: "Groupe",
    group: true,
    admin: true,

    run: async (kaya, m, msg, store, args) => {
        const chatId = m.chat;
        const action = args[0]?.toLowerCase();

        const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
        if (!permissions.isAdminOrOwner) {
            return kaya.sendMessage(
                chatId,
                { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’anti-spam.", contextInfo },
                { quoted: m }
            );
        }

        if (!action || !["on", "off"].includes(action)) {
            return kaya.sendMessage(
                chatId,
                { text: "⚙️ Usage: `.antispam on` ou `.antispam off`", contextInfo },
                { quoted: m }
            );
        }

        const antispamGroups = new Set(global.antiSpamGroups);

        if (action === "on") {
            antispamGroups.add(chatId);
            global.antiSpamGroups = antispamGroups;
            saveAntiSpamGroups(antispamGroups);

            return kaya.sendMessage(
                chatId,
                { text: "✅ *Anti-spam activé* dans ce groupe.\nUn utilisateur sera kick après *7 messages* envoyés en 10s.", contextInfo },
                { quoted: m }
            );
        } else {
            antispamGroups.delete(chatId);
            global.antiSpamGroups = antispamGroups;
            saveAntiSpamGroups(antispamGroups);

            return kaya.sendMessage(
                chatId,
                { text: "❌ *Anti-spam désactivé* dans ce groupe.", contextInfo },
                { quoted: m }
            );
        }
    },

    // 📌 Détection automatique
    detect: async (kaya, m) => {
        const chatId = m.chat;
        const sender = m.sender;

        if (!global.antiSpamGroups || !global.antiSpamGroups.has(chatId)) return;

        const now = Date.now();
        const userMessages = global.userMessages;

        // Historique filtré sur la fenêtre de temps
        const records = (userMessages.get(sender) || []).filter(r => now - r.timestamp < SPAM_WINDOW);

        // Vérifie si le message est texte ou média
        const isText = !!m.message?.conversation || !!m.message?.extendedTextMessage;
        const isMedia = !!m.message?.imageMessage || !!m.message?.videoMessage || !!m.message?.documentMessage || !!m.message?.stickerMessage || !!m.message?.audioMessage;

        if (isText || isMedia) {
            records.push({ timestamp: now, key: m.key });
            userMessages.set(sender, records);
        }

        // Si spam détecté
        if (records.length >= SPAM_THRESHOLD) {
            try {
                // Supprimer les messages récents
                for (const r of records) {
                    try {
                        if (r.key?.id) await kaya.sendMessage(chatId, { delete: r.key });
                    } catch {}
                }

                // Expulser le spammeur
                try {
                    await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
                } catch (e) {
                    console.warn('Impossible d’expulser le spammeur:', e);
                }

                // Annonce dans le groupe
                await kaya.sendMessage(chatId, {
                    text: `@${sender.split("@")[0]} a été expulsé pour *SPAM* 🚫`,
                    mentions: [sender],
                    contextInfo
                });

                userMessages.delete(sender); // Reset
            } catch (err) {
                console.error("❌ Erreur anti-spam:", err);
            }
        }
    }
};    admin: true,

    run: async (kaya, m, msg, store, args) => {
        const chatId = m.chat;
        const action = args[0]?.toLowerCase();

        const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
        if (!permissions.isAdminOrOwner) {
            return kaya.sendMessage(
                chatId,
                { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’anti-spam.", contextInfo },
                { quoted: m }
            );
        }

        if (!action || !["on", "off"].includes(action)) {
            return kaya.sendMessage(
                chatId,
                { text: "⚙️ Usage: `.antispam on` ou `.antispam off`", contextInfo },
                { quoted: m }
            );
        }

        const antispamGroups = new Set(global.antiSpamGroups);

        if (action === "on") {
            if (!antispamGroups.has(chatId)) antispamGroups.add(chatId);
            global.antiSpamGroups = antispamGroups;
            saveAntiSpamGroups(antispamGroups);

            return kaya.sendMessage(
                chatId,
                { text: "✅ *Anti-spam activé* dans ce groupe.\nUn utilisateur sera kick après *7 messages* (texte ou médias) envoyés en 10s.", contextInfo },
                { quoted: m }
            );
        } else {
            if (antispamGroups.has(chatId)) antispamGroups.delete(chatId);
            global.antiSpamGroups = antispamGroups;
            saveAntiSpamGroups(antispamGroups);

            return kaya.sendMessage(
                chatId,
                { text: "❌ *Anti-spam désactivé* dans ce groupe.", contextInfo },
                { quoted: m }
            );
        }
    },

    // 📌 Détection automatique
    detect: async (kaya, m) => {
        const chatId = m.chat;
        const sender = m.sender;

        if (!global.antiSpamGroups || !global.antiSpamGroups.has(chatId)) return;

        if (!userMessages.has(sender)) userMessages.set(sender, []);

        const now = Date.now();
        const records = userMessages
            .get(sender)
            .filter(r => now - r.timestamp < 10000); // 10 secondes

        // 🔎 Vérifie si le message est texte ou média
        const isText = !!m.message?.conversation || !!m.message?.extendedTextMessage;
        const isMedia =
            !!m.message?.imageMessage ||
            !!m.message?.videoMessage ||
            !!m.message?.documentMessage ||
            !!m.message?.stickerMessage ||
            !!m.message?.audioMessage;

        if (isText || isMedia) {
            records.push({ timestamp: now, key: m.key });
            userMessages.set(sender, records);
        }

        // 🚨 Si spam détecté (>=7 messages en 10s)
        if (records.length >= 7) {
            try {
                // Supprimer tous ses messages récents
                for (const r of records) {
                    if (r.key) await kaya.sendMessage(chatId, { delete: r.key });
                }

                // Expulser le spammeur
                await kaya.groupParticipantsUpdate(chatId, [sender], "remove");

                await kaya.sendMessage(chatId, {
                    text: `@${sender.split("@")[0]} a été expulsé pour *SPAM* 🚫`,
                    mentions: [sender],
                    contextInfo
                });

                userMessages.delete(sender); // reset
            } catch (err) {
                console.error("❌ Erreur anti-spam:", err);
            }
        }
    }
};
