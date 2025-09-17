// ==================== commands/autoread.js ====================
import config from "../config.js";
import { contextInfo } from "../utils/contextInfo.js"; // ← cohérence avec tes autres commandes

export default {
  name: "autoread",
  description: "📖 Active/Désactive la lecture automatique des messages",
  category: "Owner",

  run: async (kaya, m, msg, store, args) => {
    try {
      const senderNumber = m.sender.split("@")[0];

      if (senderNumber !== config.OWNER_NUMBER) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Cette commande est réservée au *propriétaire du bot*.", contextInfo },
          { quoted: m }
        );
      }

      const action = args[0]?.toLowerCase();
      if (!["on", "off"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚙️ Usage : `.autoread on` ou `.autoread off`", contextInfo },
          { quoted: m }
        );
      }

      config.saveConfig({ autoRead: action === "on" });

      return kaya.sendMessage(
        m.chat,
        {
          text:
            action === "on"
              ? "📖 *AutoRead activé* : les messages seront marqués comme lus automatiquement."
              : "❌ *AutoRead désactivé* : les messages ne seront plus marqués automatiquement.",
          contextInfo,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("Erreur autoread.js :", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors du changement du mode AutoRead.", contextInfo },
        { quoted: m }
      );
    }
  },
};