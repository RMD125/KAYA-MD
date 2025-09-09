const config = require('../config');
const checkAdminOrOwner = require('../utils/checkAdmin');

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 125
  }
};

module.exports = {
  name: 'sudolist',
  description: '📋 Affiche la liste des owners actuels',
  category: 'Owner',

  run: async (kaya, m) => {
    try {
      // ✅ Vérifie si le sender est owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(m.chat, {
          text: '🚫 *Commande réservée aux owners.*',
          contextInfo
        }, { quoted: m });
      }

      // Liste des owners
      const owners = config.OWNER_NUMBER.split(',').map(o => o.trim());
      const ownerList = owners.map((id, i) => `*${i + 1}. wa.me/${id}*`).join('\n');

      // Envoi du message
      return kaya.sendMessage(m.chat, {
        text: `╭━━〔 👑 LISTE DES OWNERS 〕━━⬣\n${ownerList}\n╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error('Erreur commande sudolist :', err);
      return kaya.sendMessage(m.chat, {
        text: '❌ Une erreur est survenue lors de l’affichage de la liste des owners.',
        contextInfo
      }, { quoted: m });
    }
  }
};