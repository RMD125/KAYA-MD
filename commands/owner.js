const checkAdminOrOwner = require('../utils/checkAdmin');
const config = require('../config');

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 122
  }
};

module.exports = {
  name: 'owner',
  description: '📞 Affiche le numéro du créateur du bot (owner uniquement)',
  category: 'Info',

  run: async (kaya, m, msg, store, args) => {
    try {
      // Vérifie si l’utilisateur est owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(m.chat, {
          text: '🚫 Cette commande est réservée au propriétaire du bot.',
          contextInfo
        }, { quoted: m });
      }

      // Prend le premier numéro du OWNER_NUMBER
      const creatorNumber = config.OWNER_NUMBER.split(',')[0].trim();

      await kaya.sendMessage(m.chat, {
        text: `📞 *Numéro du créateur* : wa.me/${creatorNumber}`,
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error('❌ Erreur commande owner :', err);
      await kaya.sendMessage(m.chat, {
        text: '⚠️ Impossible d’envoyer le numéro pour le moment.',
        contextInfo
      }, { quoted: m });
    }
  }
};