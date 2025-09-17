// ==================== commands/unsudo.js ====================
import config from '../config.js';
import checkAdminOrOwner from '../utils/checkAdmin.js'; 
import { contextInfo } from '../utils/contextInfo.js'; // import centralisé

export default {
  name: 'unsudo',
  description: '➖ Retire un owner existant (réservé au propriétaire principal)',
  category: 'Owner',

  run: async (kaya, m, msg, store, args) => {
    try {
      const senderId = m.sender.split('@')[0].replace(/\D/g, '');
      const owners = config.OWNER_NUMBER
        .split(',')
        .map(o => o.split('@')[0].replace(/\D/g, '').trim());

      // ✅ Vérifie que seul le propriétaire principal peut retirer un owner
      if (senderId !== owners[0]) {
        return kaya.sendMessage(
          m.chat,
          { text: '🚫 Seul le propriétaire principal peut retirer un owner.', contextInfo },
          { quoted: m }
        );
      }

      // ✅ Récupération du numéro cible
      const targetId = m.quoted?.sender?.split('@')[0].replace(/\D/g, '') || (args[0] && args[0].replace(/\D/g, ''));
      if (!targetId) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Réponds à un message ou indique un numéro à retirer.', contextInfo },
          { quoted: m }
        );
      }

      // ✅ Vérifie si la cible est un owner
      if (!owners.includes(targetId)) {
        return kaya.sendMessage(
          m.chat,
          { text: `❌ *@${targetId}* n’est pas un owner.`, mentions: [targetId + '@s.whatsapp.net'], contextInfo },
          { quoted: m }
        );
      }

      // ✅ Empêche de se retirer soi-même
      if (targetId === senderId) {
        return kaya.sendMessage(
          m.chat,
          { text: '🛑 Tu ne peux pas te retirer toi-même.', contextInfo },
          { quoted: m }
        );
      }

      // ✅ Retire l’owner et sauvegarde
      const updatedOwners = owners.filter(o => o !== targetId);
      config.saveConfig({ OWNER_NUMBER: updatedOwners.join(',') });

      return kaya.sendMessage(
        m.chat,
        {
          text: `╭━━〔 🔓 RETRAIT OWNER 〕━━⬣
├ 📲 Numéro : @${targetId}
├ ❌ Statut : Supprimé de la liste des owners
├ 🧹 Nettoyage terminé
╰────────────────────⬣`,
          mentions: [targetId + '@s.whatsapp.net'],
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('Erreur unsudo.js :', err);
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Une erreur est survenue lors du retrait de l’owner.', contextInfo },
        { quoted: m }
      );
    }
  }
};