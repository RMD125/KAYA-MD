// ==================== commands/botmode.js ====================
import config from "../config.js";
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js"; // ✅ Import centralisé

export default {
  name: "botmode",
  description: "Changer le mode du bot : public ou privé",
  category: "Owner",

  run: async (kaya, m, msg, store, args, command) => {
    // ✅ Vérifie les permissions
    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    if (!permissions.isOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: "🚫 Cette commande est réservée au propriétaire du bot.", contextInfo },
        { quoted: m }
      );
    }

    // ✅ Autoriser .public on|off et .private on|off directement
    const cmd = command.toLowerCase(); // "public" ou "private"
    const value = args[0]?.toLowerCase();

    if (!["public", "private"].includes(cmd)) {
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Commande inconnue. Utilise `.public on|off` ou `.private on|off`.", contextInfo },
        { quoted: m }
      );
    }

    if (!["on", "off"].includes(value)) {
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Valeur invalide. Utilise on ou off.", contextInfo },
        { quoted: m }
      );
    }

    if (cmd === "public") {
      config.saveUserConfig({ publicBot: value === "on" });
      return kaya.sendMessage(
        m.chat,
        { text: `✅ Mode public du bot : ${value === "on" ? "activé" : "désactivé"}`, contextInfo },
        { quoted: m }
      );
    }

    if (cmd === "private") {
      config.saveUserConfig({ publicBot: value !== "on" }); // private = !public
      return kaya.sendMessage(
        m.chat,
        { text: `✅ Mode privé du bot : ${value === "on" ? "activé" : "désactivé"}`, contextInfo },
        { quoted: m }
      );
    }
  }
};