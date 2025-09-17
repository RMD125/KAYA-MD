// ================= commands/delete.js =================
import checkAdminOrOwner from '../utils/checkAdmin.js';
import { contextInfo } from '../utils/contextInfo.js'; // ✅ Import centralisé

export const name = 'delete';
export const description = '🗑️ Supprime un message (répondre au message)';
export const category = 'Groupe';
export const group = false;

export async function run(kaya, m, msg, store, args) {
  try {
    // ✅ Vérifie qu’il y a une réponse
    if (!m.quoted) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Réponds au message que tu veux supprimer.', contextInfo },
        { quoted: m }
      );
    }

    const chatId = m.chat;
    const messageKey = {
      remoteJid: chatId,
      fromMe: m.quoted.key.fromMe,
      id: m.quoted.key.id,
      participant: m.isGroup ? m.quoted.key.participant : undefined
    };

    if (m.isGroup) {
      // ✅ Vérifie admin ou owner pour supprimer dans un groupe
      const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!permissions.isAdmin && !permissions.isOwner) {
        return kaya.sendMessage(
          chatId,
          { text: '🚫 Seuls les *Admins* ou le *Propriétaire* peuvent supprimer un message.', contextInfo },
          { quoted: m }
        );
      }
    }

    // ✅ Suppression
    await kaya.sendMessage(chatId, { delete: messageKey });

  } catch (err) {
    console.error('Erreur commande delete:', err);
    return kaya.sendMessage(
      m.chat,
      { text: '❌ Impossible de supprimer ce message.', contextInfo },
      { quoted: m }
    );
  }
}