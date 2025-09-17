// ==================== commands/boton.js ====================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";

const disabledFile = path.join(process.cwd(), "data/disabledGroups.json");

// Charger la liste des groupes désactivés
function loadDisabledGroups() {
  if (!fs.existsSync(disabledFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(disabledFile, "utf-8"));
  } catch {
    return [];
  }
}

// Sauvegarder la liste
function saveDisabledGroups(groups) {
  fs.writeFileSync(disabledFile, JSON.stringify(groups, null, 4));
}

export default {
  name: "boton",
  description: "Réactive le bot dans ce groupe",
  category: "Groupe",
  group: true,
  admin: true,

  run: async (kaya, m, msg, store, args) => {
    const chatId = m.chat;

    const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
    if (!permissions.isAdminOrOwner) {
      return kaya.sendMessage(
        chatId,
        { text: "🚫 Seuls les admins ou owners peuvent utiliser cette commande." },
        { quoted: m }
      );
    }

    let disabledGroups = loadDisabledGroups();

    if (disabledGroups.includes(chatId)) {
      disabledGroups = disabledGroups.filter(g => g !== chatId);
      saveDisabledGroups(disabledGroups);
    }

    global.disabledGroups = new Set(disabledGroups);

    await kaya.sendMessage(
      chatId,
      {
        text: "✅ Bot réactivé dans ce groupe.\n\nToutes les fonctionnalités sont de nouveau disponibles."
      },
      { quoted: m }
    );
  }
};