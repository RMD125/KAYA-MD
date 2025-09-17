// ==================== commands/ban.js ====================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js";

const banFile = path.join("./data/ban.json");

// Charger la liste des bannis
let bannedUsers = [];
if (fs.existsSync(banFile)) {
  bannedUsers = JSON.parse(fs.readFileSync(banFile, "utf-8"));
} else {
  fs.writeFileSync(banFile, JSON.stringify(bannedUsers, null, 2));
}

// Fonction pour sauvegarder
function saveBanned() {
  fs.writeFileSync(banFile, JSON.stringify(bannedUsers, null, 2));
}

export default {
  name: "ban",
  description: "🚫 Bannir un utilisateur du bot (Owner uniquement)",
  category: "Owner",

  run: async (kaya, m, msg, store, args) => {
    try {
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Cette commande est réservée au propriétaire du bot.", contextInfo },
          { quoted: m }
        );
      }

      // Récupération du numéro cible
      let target = m.quoted?.sender?.split("@")[0];
      if (!target) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned?.length) target = mentioned[0].split("@")[0];
        else if (args[0]) target = args[0].replace(/\D/g, "");
      }

      if (!target) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Indique le numéro à bannir (reply ou mention).", contextInfo },
          { quoted: m }
        );
      }

      if (bannedUsers.includes(target)) {
        return kaya.sendMessage(
          m.chat,
          { text: `❌ L'utilisateur ${target} est déjà banni.`, contextInfo },
          { quoted: m }
        );
      }

      bannedUsers.push(target);
      saveBanned();

      return kaya.sendMessage(
        m.chat,
        { text: `✅ Utilisateur ${target} banni avec succès !`, contextInfo },
        { quoted: m }
      );

    } catch (err) {
      console.error("Erreur ban.js :", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Impossible de bannir l'utilisateur.", contextInfo },
        { quoted: m }
      );
    }
  }
};