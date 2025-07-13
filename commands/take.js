const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'take',
  description: 'Ajoute un nom personnalisé dans le pack du sticker',
  category: 'Utilitaires',

  run: async (kaya, m, msg, store, args) => {
    try {
      const quoted = m.quoted;
      if (!quoted || !quoted.mimetype || !quoted.mimetype.includes('webp')) {
        return kaya.sendMessage(m.chat, {
          text: 
`╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Sticker non détecté !*
│ 💡 Réponds à un sticker puis tape *.take kaya*
╰──────────────⬣`
        }, { quoted: m });
      }

      const name = args.join(' ') || m.pushName || 'KAYA-MD';
      const buffer = await quoted.download();

      if (!buffer) {
        return kaya.sendMessage(m.chat, {
          text: '❌ Impossible de lire le sticker.'
        }, { quoted: m });
      }

      await kaya.sendMessage(m.chat, {
        sticker: buffer,
        packname: name,
        author: 'KAYA-MD'
      }, { quoted: m });

    } catch (err) {
      console.error('❌ Erreur :', err);
      return kaya.sendMessage(m.chat, {
        text: `❌ Une erreur est survenue : ${err.message}`
      }, { quoted: m });
    }
  }
};