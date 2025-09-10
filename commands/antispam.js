const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");
const { contextInfo } = require("../utils/contextInfo"); // import contextInfo global

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

// Stockage en mémoire des messages récents par utilisateur
const userMessages = new Map();

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
                { text: "✅ *Anti-spam activé* dans ce groupe.\nUn utilisateur sera kick après *7 messages* (texte ou médias) envoyés en 10s.", contextInfo },
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

        if (!userMessages.has(sender)) userMessages.set(sender, []);

        const now = Date.now();
        const records = userMessages
            .get(sender)
            .filter(r => now - r.timestamp < 10000); // 10 secondes

        // Vérifie si le message est texte ou média
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

        // Si spam détecté (>=7 messages en 10s)
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
};    run: async (kaya, m, msg, store, args) => {
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
                { text: "✅ *Anti-spam activé* dans ce groupe.\nUn utilisateur sera kick après *7 messages* (texte ou médias) envoyés en 10s.", contextInfo },
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

    detect: async (kaya, m) => {
        const chatId = m.chat;
        const sender = m.sender;

        if (!global.antiSpamGroups?.has(chatId)) return;

        // Initialiser map par groupe
        if (!userMessages.has(chatId)) userMessages.set(chatId, new Map());
        const groupMessages = userMessages.get(chatId);

        if (!groupMessages.has(sender)) groupMessages.set(sender, []);

        const now = Date.now();
        let records = groupMessages.get(sender);

        // Garde seulement les messages des 10 dernières secondes
        records = records.filter(r => now - r.timestamp < 10000);

        // Vérifie si message texte ou média
        const isText = !!m.message?.conversation || !!m.message?.extendedTextMessage;
        const isMedia =
            !!m.message?.imageMessage ||
            !!m.message?.videoMessage ||
            !!m.message?.documentMessage ||
            !!m.message?.stickerMessage ||
            !!m.message?.audioMessage;

        if (isText || isMedia) {
            records.push({ timestamp: now, key: m.key });
            groupMessages.set(sender, records);
        }

        // Si spam détecté (>=7 messages en 10s)
        if (records.length >= 7) {
            try {
                // Supprimer tous les messages récents
                for (const r of records) {
                    if (r.key) await kaya.sendMessage(chatId, { delete: r.key }).catch(() => {});
                }

                // Vérifie si bot est admin avant kick
                const metadata = await kaya.groupMetadata(chatId);
                const botId = decodeJid(kaya.user.id);
                const botIsAdmin = metadata.participants.some(p => p.id === botId && p.admin);

                if (botIsAdmin) {
                    await kaya.groupParticipantsUpdate(chatId, [sender], "remove");

                    await kaya.sendMessage(chatId, {
                        text: `@${sender.split("@")[0]} a été expulsé pour *SPAM* 🚫`,
                        mentions: [sender],
                        contextInfo
                    });
                }

                // Reset messages utilisateur
                groupMessages.set(sender, []);
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

    detect: async (kaya, m) => {
        const chatId = m.chat;
        const sender = m.sender;

        if (!global.antiSpamGroups?.has(chatId)) return;

        if (!userMessages.has(chatId)) userMessages.set(chatId, new Map());
        const groupMessages = userMessages.get(chatId);

        if (!groupMessages.has(sender)) groupMessages.set(sender, []);

        const now = Date.now();
        let records = groupMessages.get(sender);

        // Garde seulement les messages des 10 dernières secondes
        records = records.filter(r => now - r.timestamp < 10000);

        const isText = !!m.message?.conversation || !!m.message?.extendedTextMessage;
        const isMedia =
            !!m.message?.imageMessage ||
            !!m.message?.videoMessage ||
            !!m.message?.documentMessage ||
            !!m.message?.stickerMessage ||
            !!m.message?.audioMessage;

        if (isText || isMedia) {
            records.push({ timestamp: now, key: m.key });
            groupMessages.set(sender, records);
        }

        // 🚨 Si spam détecté (>=7 messages en 10s)
        if (records.length >= 7) {
            try {
                // Supprime tous les messages récents
                for (const r of records) {
                    if (r.key) await kaya.sendMessage(chatId, { delete: r.key }).catch(() => {});
                }

                // Vérifie si le bot est admin avant de kick
                const botId = kaya.user.id.split(":")[0] + "@s.whatsapp.net";
                const metadata = await kaya.groupMetadata(chatId);
                const botIsAdmin = metadata.participants.some(p => p.id === botId && p.admin);

                if (botIsAdmin) {
                    await kaya.groupParticipantsUpdate(chatId, [sender], "remove");

                    await kaya.sendMessage(chatId, {
                        text: `@${sender.split("@")[0]} a été expulsé pour *SPAM* 🚫`,
                        mentions: [sender],
                        contextInfo
                    });
                }

                // Reset messages de l'utilisateur
                groupMessages.set(sender, []);
            } catch (err) {
                console.error("❌ Erreur anti-spam:", err);
            }
        }
    }
};    run: async (kaya, m, msg, store, args) => {
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
                { text: "✅ *Anti-spam activé* dans ce groupe.\nUn utilisateur sera kick après *7 messages* (texte ou médias) envoyés en 10s.", contextInfo },
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

        if (!userMessages.has(sender)) userMessages.set(sender, []);

        const now = Date.now();
        const records = userMessages
            .get(sender)
            .filter(r => now - r.timestamp < 10000); // 10 secondes

        // Vérifie si le message est texte ou média
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

        // Si spam détecté (>=7 messages en 10s)
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
