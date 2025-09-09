const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");

const disabledFile = path.join(__dirname, "../data/disabledGroups.json");

function loadDisabledGroups() {
    if (!fs.existsSync(disabledFile)) return [];
    try {
        return JSON.parse(fs.readFileSync(disabledFile, "utf-8"));
    } catch {
        return [];
    }
}

function saveDisabledGroups(groups) {
    fs.writeFileSync(disabledFile, JSON.stringify(groups, null, 4));
}

module.exports = {
    name: "boton",
    description: "Réactive le bot dans ce groupe",
    category: "Groupe",
    group: true,
    admin: true,

    run: async (kaya, m, msg, store, args) => {
        const chatId = m.chat;

        const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
        if (!permissions.isAdminOrOwner) {
            return kaya.sendMessage(chatId, {
                text: "🚫 Seuls les admins ou owners peuvent utiliser cette commande."
            }, { quoted: m });
        }

        let disabledGroups = loadDisabledGroups();

        if (disabledGroups.includes(chatId)) {
            disabledGroups = disabledGroups.filter(g => g !== chatId);
            saveDisabledGroups(disabledGroups);
        }

        global.disabledGroups = new Set(disabledGroups);

        await kaya.sendMessage(chatId, {
            text: "✅ Bot réactivé dans ce groupe.\n\nToutes les fonctionnalités sont de nouveau disponibles."
        }, { quoted: m });
    }
};