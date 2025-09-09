// ==================== commands/autoread.js ====================
const config = require("../config");

module.exports = {
  name: "autoread",
  description: "Activer ou désactiver la lecture automatique des messages",
  category: "Owner",

  run: async (kaya, m, msg, store, args) => {
    const senderNumber = m.sender.split("@")[0];

    if (senderNumber !== config.OWNER_NUMBER) {
      return kaya.sendMessage(m.chat, { text: "🚫 Cette commande est réservée au propriétaire du bot." }, { quoted: m });
    }

    if (!args[0]) {
      return kaya.sendMessage(m.chat, { text: `❌ Indique "on" ou "off" pour activer ou désactiver autoread.` }, { quoted: m });
    }

    const value = args[0].toLowerCase();
    if (!["on", "off"].includes(value)) {
      return kaya.sendMessage(m.chat, { text: `❌ Valeur invalide. Utilise "on" ou "off".` }, { quoted: m });
    }

    config.saveConfig({ autoRead: value === "on" });
    return kaya.sendMessage(m.chat, { text: `✅ AutoRead ${value === "on" ? "activé" : "désactivé"} !` }, { quoted: m });
  }
};