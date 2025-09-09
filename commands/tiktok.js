const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Tiktok } = require('../lib/tiktok');

module.exports = {
  name: 'tiktok',
  description: 'Télécharge une vidéo TikTok sans filigrane.',
  category: 'Téléchargement',

  async run(kaya, m, msg, store, args) {
    const query = args.join(" ");
    if (!query) {
      return kaya.sendMessage(m.chat, {
        text: `╭━━━〔 📥 TIKTOK DOWNLOADER 〕━━⬣
┃ ❌ Aucun lien détecté !
┃ 📌 Utilisation : *.tiktok https://vm.tiktok.com/xxx*
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter',
            newsletterName: 'KAYA MD',
            serverMessageId: 143
          }
        }
      }, { quoted: m });
    }

    try {
      const data = await Tiktok(query);
      const url = data.nowm;

      if (!url) {
        return kaya.sendMessage(m.chat, {
          text: `❌ Impossible de récupérer la vidéo TikTok.\n🔁 Essaie avec un autre lien ou plus tard.`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true
          }
        }, { quoted: m });
      }

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const filePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);

      const res = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, res.data);

      await kaya.sendMessage(m.chat, {
        video: fs.readFileSync(filePath),
        caption:
`╭━━━〔 🎬 TIKTOK VIDÉO 〕━━⬣
📌 *Titre* : ${data.title || "Non disponible"}
👤 *Auteur* : ${data.author || "Inconnu"}
   *By* : KAYA-MD
╰━━━━━━━━━━━━━━━━━━━━━━⬣`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter',
            newsletterName: 'KAYA MD',
            serverMessageId: 143
          }
        }
      }, { quoted: m });

      fs.unlinkSync(filePath); // Nettoyage

    } catch (e) {
      console.error('Erreur TikTok :', e);
      await kaya.sendMessage(m.chat, {
        text: `❌ Une erreur est survenue : ${e.message || "Inconnue"}`
      }, { quoted: m });
    }
  }
};