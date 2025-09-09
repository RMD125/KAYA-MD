const checkAdminOrOwner = require('../utils/checkAdmin');
const decodeJid = require('../utils/decodeJid');
const { contextInfo } = require('../utils/contextInfo'); 

module.exports = {
  name: 'add',
  description: '➕ Ajouter un membre au groupe (Admins/Owner uniquement, silencieux)',
  category: 'Groupe',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Cette commande fonctionne uniquement dans un groupe.', contextInfo },
          { quoted: m }
        );
      }

      // ✅ Vérifie si l'utilisateur est admin ou owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

      if (!permissions.isAdminOrOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: '🚫 Seuls les *Admins* ou le *Propriétaire* peuvent ajouter un membre.', contextInfo },
          { quoted: m }
        );
      }

      // ✅ Vérifie si un numéro est fourni
      if (!args[0]) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Utilisation : *.add 225070000000*', contextInfo },
          { quoted: m }
        );
      }

      const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

      // ✅ Vérifie si la personne est déjà dans le groupe
      const metadata = await kaya.groupMetadata(m.chat);
      const targetExists = metadata.participants.find(p => decodeJid(p.id) === decodeJid(target));
      if (targetExists) {
        return kaya.sendMessage(
          m.chat,
          { text: `ℹ️ @${target.split('@')[0]} est déjà dans le groupe.`, mentions: [target], contextInfo },
          { quoted: m }
        );
      }

      // ✅ Ajoute silencieusement
      await kaya.groupParticipantsUpdate(m.chat, [target], 'add');

      return kaya.sendMessage(
        m.chat,
        { text: `✅ @${target.split('@')[0]} a été ajouté au groupe.`, mentions: [target], contextInfo },
        { quoted: m }
      );

    } catch (err) {
      console.error('Erreur commande add:', err);
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Impossible d’ajouter ce membre. Vérifie le numéro.', contextInfo },
        { quoted: m }
      );
    }
  }
};