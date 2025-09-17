// ================= commands/purge.js =================
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: "purge",
  description: "Expulse tous les membres du groupe sauf les admins et le bot",
  category: "Groupe",
  group: true,
  admin: true,

  run: async (kaya, m, msg, store, args) => {
    const chatId = m.chat;

    const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
    if (!permissions.isAdminOrOwner) {
      return kaya.sendMessage(
        chatId,
        { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent utiliser `.purge`.", contextInfo },
        { quoted: m }
      );
    }

    try {
      const groupMetadata = await kaya.groupMetadata(chatId);
      const botNumber = await kaya.decodeJid(kaya.user.id);

      const toKick = groupMetadata.participants
        .filter(p => !p.admin && p.id !== botNumber)
        .map(p => p.id);

      if (!toKick.length) {
        return kaya.sendMessage(
          chatId,
          { text: "✅ Aucun membre à expulser (seulement admins et bot dans ce groupe).", contextInfo },
          { quoted: m }
        );
      }

      for (const user of toKick) {
        await kaya.groupParticipantsUpdate(chatId, [user], "remove");
        await new Promise(r => setTimeout(r, 1000));
      }

      return kaya.sendMessage(
        chatId,
        { text: `🚷 *${toKick.length} membres* ont été expulsés du groupe.`, contextInfo },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ Erreur purge :", err);
      return kaya.sendMessage(chatId, { text: "⚠️ Impossible d’expulser tous les membres.", contextInfo }, { quoted: m });
    }
  }
};