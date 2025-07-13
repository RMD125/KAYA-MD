const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'url',
  description: '🔗 Génère un lien Catbox à partir d’une image',
  run: async (kaya, m) => {
    try {
      const quoted = m.quoted || m;
      const mime = quoted?.mimetype || '';

      if (!/image\/(jpe?g|png)/.test(mime)) {
        return kaya.sendMessage(m.chat, {
          text: '📸 *Veuillez répondre à une image pour générer un lien.*'
        }, { quoted: m });
      }

      const buffer = await quoted.download();
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', buffer, 'image.jpg');

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

      await kaya.sendMessage(m.chat, { text: message }, { quoted: m });

    } catch (err) {
      console.error('Erreur URL Catbox :', err);
      await kaya.sendMessage(m.chat, {
        text: '❌ Une erreur est survenue lors de la génération du lien.'
      }, { quoted: m });
    }
  }
};