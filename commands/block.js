const config = require('../system/config');

module.exports = {
  name: 'block',
  description: 'Bloque un utilisateur (owner uniquement)',
  category: 'owner',

  run: async (kaya, m, msg, store, args) => {
    try {
      const sender = m.sender.split('@')[0];

      // Vérifie si l'utilisateur est bien owner
      if (!config.owner.includes(sender)) {
        return kaya.sendMessage(m.chat, {
          text: '🚫 *Commande réservée au propriétaire du bot.*'
        }, { quoted: m });
      }

      // Cible à bloquer (soit cité, soit celui qui parle)
      const target = m.quoted ? m.quoted.sender : m.sender;

      // Bloquer la cible
      await kaya.updateBlockStatus(target, 'block');

      // Confirmation
      await kaya.sendMessage(m.chat, {
        text: `✅ Utilisateur *@${target.split('@')[0]}* a été bloqué.`,
        mentions: [target]
      }, { quoted: m });

    } catch (e) {
      console.error('❌ Erreur block.js :', e);
      await kaya.sendMessage(m.chat, {
        text: '❌ Une erreur est survenue lors du blocage.'
      }, { quoted: m });
    }
  }
};