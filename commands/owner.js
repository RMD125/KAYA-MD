const { contextInfo } = require('../utils/contextInfo');

module.exports = {
  name: 'owner',
  description: '📞 Affiche le numéro du créateur du bot',
  category: 'Info',

  run: async (kaya, m, msg, store, args) => {
    try {
      const creatorNumber = '243XXXXXXXXX'; // ton numéro
      await kaya.sendMessage(m.chat, {
        text: `📞 *Numéro du créateur* : wa.me/${creatorNumber}`,
        contextInfo
      }, { quoted: m });
    } catch (err) {
      console.error('❌ Erreur commande owner :', err);
      await kaya.sendMessage(m.chat, { text: '⚠️ Impossible d’envoyer le numéro.', contextInfo }, { quoted: m });
    }
  }
};