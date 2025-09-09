const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363402565816662@newsletter",
    newsletterName: "KAYA MD",
    serverMessageId: 143
  }
};

const banFile = path.join(__dirname, "../data/ban.json");

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

module.exports = {
  name: "ban",
  description: "Bannir un utilisateur du bot",
  category: "Owner",

  run: async (kaya, m, msg, store, args) => {
    try {
      // ✅ Vérifie si le sender est owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Cette commande est réservée au propriétaire du bot.", contextInfo },
          { quoted: m }
        );
      }

      // Récupération du numéro cible (reply / mention / argument)
      let target = m.quoted?.sender?.split("@")[0];

      if (!target) {
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
          target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split("@")[0];
        } else if (args[0]) {
          target = args[0].replace(/\D/g, "");
        }
      }

      if (!target) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Indique le numéro à bannir (ou reply au message).", contextInfo },
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

      // Ajouter l'utilisateur à la liste
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