// ==================== commands/block.js ====================
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js"; // ✅ Import global

export default {
  name: "block",
  description: "🚫 Bloque l’utilisateur en conversation privée (Owner uniquement)",
  category: "Owner",

  run: async (kaya, m, msg) => {
    try {
      // ✅ Vérifie si l'expéditeur est owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Seul le propriétaire peut utiliser cette commande.", contextInfo },
          { quoted: m }
        );
      }

      // ✅ Commande utilisable uniquement en conversation privée
      const target = m.chat;
      if (!target.endsWith("@s.whatsapp.net")) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Cette commande ne peut être utilisée qu’en message privé.", contextInfo },
          { quoted: m }
        );
      }

      // ✅ Bloquer l’utilisateur
      await kaya.updateBlockStatus(target, "block");

      await kaya.sendMessage(
        m.chat,
        {
          text: `✅ L'utilisateur @${target.split("@")[0]} a été *bloqué*.`,
          mentions: [target],
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Erreur commande block :", err);
      return kaya.sendMessage(
        m.chat,
        { text: `❌ Impossible de bloquer l'utilisateur.\n\nErreur: ${err.message}`, contextInfo },
        { quoted: m }
      );
    }
  }
};