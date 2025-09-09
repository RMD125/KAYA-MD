const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");

const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363402565816662@newsletter",
        newsletterName: "KAYA MD",
        serverMessageId: 161
    }
};

const antibotFile = path.join(__dirname, "../data/antibotGroups.json");

// Charger les groupes avec antibot activé
function loadAntibotGroups() {
    if (!fs.existsSync(antibotFile)) return new Set();
    try {
        const groups = JSON.parse(fs.readFileSync(antibotFile, "utf-8"));
        return new Set(groups);
    } catch {
        return new Set();
    }
}

// Sauvegarder
function saveAntibotGroups(groups) {
    fs.writeFileSync(antibotFile, JSON.stringify([...groups], null, 4));
}

// Initialisation globale
if (!global.antibotGroups) {
    global.antibotGroups = loadAntibotGroups();
}

module.exports = {
    name: "antibot",
    description: "Active ou désactive la protection contre les bots dans le groupe",
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
                { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’antibot.", contextInfo },
                { quoted: m }
            );
        }

        if (!action || !["on", "off"].includes(action)) {
            return kaya.sendMessage(
                chatId,
                { text: "⚙️ Usage: `.antibot on` ou `.antibot off`", contextInfo },
                { quoted: m }
            );
        }

        const antibotGroups = new Set(global.antibotGroups);

        if (action === "on") {
            antibotGroups.add(chatId);
            global.antibotGroups = antibotGroups;
            saveAntibotGroups(antibotGroups);

            return kaya.sendMessage(
                chatId,
                { text: "✅ *Antibot activé* : les réponses automatiques des bots seront supprimées.", contextInfo },
                { quoted: m }
            );
        } else {
            antibotGroups.delete(chatId);
            global.antibotGroups = antibotGroups;
            saveAntibotGroups(antibotGroups);

            return kaya.sendMessage(
                chatId,
                { text: "❌ *Antibot désactivé* dans ce groupe.", contextInfo },
                { quoted: m }
            );
        }
    },

    // 📌 Détection automatique
    detect: async (kaya, m) => {
        const chatId = m.chat;
        if (!global.antibotGroups || !global.antibotGroups.has(chatId)) return;

        const sender = m.sender;
        const body = m.text || m.message?.conversation || "";

        // 🔥 Antibot logique :
        // Si ce n'est PAS un humain normal (réponse automatique) → on supprime
        // On considère qu'un "bot" envoie un message avec un texte long ou formaté
        if (body && body.length > 10) { 
            try {
                await kaya.sendMessage(chatId, { delete: m.key });
                console.log(`🚫 Message bot supprimé: ${body.substring(0, 20)}...`);
            } catch (err) {
                console.error("❌ Erreur antibot:", err);
            }
        }
    }
};