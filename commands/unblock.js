const config = require('../system/config');

module.exports = {
  name: 'unblock',
  description: 'Débloque un utilisateur (owner uniquement)',
  category: 'owner',

  run: async (kaya, m, msg, store, args) => {
    try {
      const sender = m.sender.split('@')[0];

      // Vérifie si l'utilisateur est owner
      if (!config.owner.includes(sender)) {
        return kaya.sendMessage(m.chat, {
          text: '🚫 *Commande réservée au propriétaire du bot.*'
        }, { quoted: m });
      }

      // Cible à débloquer (soit cité, soit celui qui parle)
      const target = m.quoted ? m.quoted.sender : m.sender;

      // Débloquer la cible
      await kaya.updateBlockStatus(target, 'unblock');

      // Confirmation
      await kaya.sendMessage(m.chat, {
        text: `✅ Utilisateur *@${target.split('@')[0]}* a été débloqué.`,
        mentions: [target]
      }, { quoted: m });

    } catch (e) {
      console.error('❌ Erreur unblock.js :', e);
      await kaya.sendMessage(m.chat, {
        text: '❌ Une erreur est survenue lors du déblocage.'
      }, { quoted: m });
    }
  }
};