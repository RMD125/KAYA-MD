// ================= commands/revoke.js =================
import checkAdminOrOwner from '../utils/checkAdmin.js';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'revoke',
  description: '❌ Rétrograder un admin du groupe',
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

    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

    if (!permissions.isAdminOrOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Seuls les admins ou le propriétaire peuvent utiliser cette commande.', contextInfo },
        { quoted: m }
      );
    }

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
      await kaya.groupParticipantsUpdate(m.chat, [target], 'demote');

      await kaya.sendMessage(
        m.chat,
        { text: `✅ @${target.split('@')[0]} n'est plus admin !`, mentions: [target], contextInfo },
        { quoted: m }
      );
    } catch (err) {
      console.error('❌ Erreur revoke :', err);
      return kaya.sendMessage(
        m.chat,
        { text: `❌ Impossible de rétrograder ce membre.\nDétails : ${err.message}`, contextInfo },
        { quoted: m }
      );
    }
  }
};