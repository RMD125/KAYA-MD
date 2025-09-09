// ================= commands/delete.js =================
const checkAdminOrOwner = require('../utils/checkAdmin');

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 160
  }
};

module.exports = {
  name: 'delete',
  description: '🗑️ Supprime un message (répondre au message)',
  category: 'Groupe',
  group: false,

  run: async (kaya, m, msg, store, args) => {
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
};