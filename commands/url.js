const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Readable } = require('stream');
const { contextInfo } = require('../utils/contextInfo'); // import centralisé

module.exports = {
  name: 'url',
  description: '🔗 Génère un lien Catbox à partir d’une image',
  run: async (kaya, m) => {
    try {
      const quoted = m.quoted || m;
      const mime = quoted?.mimetype || '';

      if (!/image\/(jpe?g|png)/.test(mime)) {
        return kaya.sendMessage(m.chat, {
          text: '📸 *Veuillez répondre à une image pour générer un lien.*',
          contextInfo
        }, { quoted: m });
      }

      // Téléchargement du média
      const stream = await downloadContentFromMessage(quoted, mime.split('/')[0]);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', Readable.from(buffer), 'image.jpg');

      const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders()
      });

      const url = response.data;

      const message = `
╭────「 𝗞𝗔𝗬𝗔-𝗠𝗗 」────⬣
│ 🖼️ *Image détectée !*
│ ✅ *Lien généré :*
│ ${url}
╰──────────────────⬣`.trim();

      await kaya.sendMessage(m.chat, {
        text: message,
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error('Erreur URL Catbox :', err.response?.data || err.message || err);
      await kaya.sendMessage(m.chat, {
        text: '❌ Une erreur est survenue lors de la génération du lien.',
        contextInfo
      }, { quoted: m });
    }
  }
};