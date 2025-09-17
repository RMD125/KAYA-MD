// ================= commands/autoreact.js =================
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { saveBotModes } from "../utils/botModes.js";
import { contextInfo } from "../utils/contextInfo.js"; // ← import global

export default {
  name: "autoreact",
  description: "Active/Désactive le mode réaction automatique ❤️ (owner uniquement)",
  category: "Owner",

  run: async (kaya, m, msg, store, args) => {
    try {
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Commande réservée au propriétaire.", contextInfo },
          { quoted: m }
        );
      }

      const action = args[0]?.toLowerCase();
      if (!["on", "off"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚙️ Usage : `.autoreact on` ou `.autoreact off`", contextInfo },
          { quoted: m }
        );
      }

      global.botModes.autoreact = action === "on";
      saveBotModes(global.botModes);

      return kaya.sendMessage(
        m.chat,
        {
          text: global.botModes.autoreact
            ? "❤️ Mode *AutoReact* activé ! Le bot réagira automatiquement."
            : "❌ Mode *AutoReact* désactivé.",
          contextInfo,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("Erreur autoreact.js :", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors du changement du mode.", contextInfo },
        { quoted: m }
      );
    }
  },
};