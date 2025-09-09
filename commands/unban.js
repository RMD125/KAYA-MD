const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");
const { contextInfo } = require("../utils/contextInfo"); // centralisation

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
  name: "unban",
  description: "Débannir un utilisateur du bot",
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
          { text: "❌ Indique le numéro à débannir (ou reply au message).", contextInfo },
          { quoted: m }
        );
      }

      // Vérifie si l'utilisateur est dans la liste des bannis
      if (!bannedUsers.includes(target)) {
        return kaya.sendMessage(
          m.chat,
          { 
            text: `❌ L'utilisateur *@${target}* n'est pas banni.`, 
            mentions: [target + '@s.whatsapp.net'], 
            contextInfo 
          },
          { quoted: m }
        );
      }

      // Retirer l'utilisateur de la liste
      bannedUsers = bannedUsers.filter(u => u !== target);
      saveBanned();

      return kaya.sendMessage(
        m.chat,
        { 
          text: `✅ Utilisateur *@${target}* débanni avec succès !`, 
          mentions: [target + '@s.whatsapp.net'], 
          contextInfo 
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("Erreur unban.js :", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Impossible de débannir l'utilisateur.", contextInfo },
        { quoted: m }
      );
    }
  }
};