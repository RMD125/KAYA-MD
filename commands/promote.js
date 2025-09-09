const checkAdminOrOwner = require('../utils/checkAdmin');
const { contextInfo } = require('../utils/contextInfo'); // import centralisé

module.exports = {
  name: 'promote',
  description: '👑 Promouvoir un membre du groupe en admin',
  category: 'Groupe',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Cette commande ne fonctionne que dans un groupe.', contextInfo },
        { quoted: m }
      );
    }

    // ✅ Vérifie si l’auteur est admin ou owner
    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

    if (!permissions.isAdminOrOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Seuls les admins ou le propriétaire peuvent utiliser cette commande.', contextInfo },
        { quoted: m }
      );
    }

    // Récupération de la cible
    let target;
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (m.quoted?.sender) {
      target = m.quoted.sender;
    } else if (args.length) {
      target = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;
    } else {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Mentionne la personne, réponds à son message ou donne son numéro.', contextInfo },
        { quoted: m }
      );
    }

    try {
      await kaya.groupParticipantsUpdate(m.chat, [target], 'promote');

      await kaya.sendMessage(
        m.chat,
        {
          text: `✅ @${target.split('@')[0]} est maintenant admin !`,
          mentions: [target],
          contextInfo
        },
        { quoted: m }
      );
    } catch (err) {
      console.error('Erreur promote:', err);
      return kaya.sendMessage(
        m.chat,
        { text: `❌ Impossible de promouvoir ce membre.\nDétails : ${err.message}`, contextInfo },
        { quoted: m }
      );
    }
  }
};