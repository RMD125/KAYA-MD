// ==================== commands/sudolist.js ====================
import config from '../config.js';
import checkAdminOrOwner from '../utils/checkAdmin.js';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'sudolist',
  description: '📋 Affiche la liste des owners actuels',
  category: 'Owner',

  run: async (kaya, m) => {
    try {
      // ✅ Vérifie si le sender est owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(
          m.chat,
          {
            text: '🚫 *Commande réservée aux owners.*',
            contextInfo
          },
          { quoted: m }
        );
      }

      // Liste des owners
      const owners = config.OWNER_NUMBER.split(',').map(o => o.trim());
      const ownerList = owners.map((id, i) => `*${i + 1}. wa.me/${id}*`).join('\n');

      // Envoi du message
      return kaya.sendMessage(
        m.chat,
        {
          text: `╭━━〔 👑 LISTE DES OWNERS 〕━━⬣\n${ownerList}\n╰────────────────────⬣`,
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('Erreur commande sudolist :', err);
      return kaya.sendMessage(
        m.chat,
        {
          text: '❌ Une erreur est survenue lors de l’affichage de la liste des owners.',
          contextInfo
        },
        { quoted: m }
      );
    }
  }
};