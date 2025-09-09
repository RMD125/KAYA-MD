const { contextInfo } = require('../utils/contextInfo'); // import centralisé

module.exports = {
  name: 'repo',
  description: '🔧 Envoie les liens GitHub, YouTube et groupe WhatsApp de support',
  category: 'apprentissage',

  run: async (kaya, m) => {
    const texte = `
╭━━────〔  SUPPORT  〕─────━━⬣
├ 
🔗 GitHub Bot : https://github.com/Kaya2005/KAYA-MD
├ 
📺 Tutoriel Déploiement : https://youtube.com/@KAYATECH243
├
💬 Groupe WhatsApp : https://chat.whatsapp.com/DoMh6jWjly2ErwVppmCGZo
╰──────────────────────────⬣

N’hésite pas à poser tes questions et à suivre les tutoriels !
    `;

    await kaya.sendMessage(m.chat, {
      text: texte,
      contextInfo
    }, { quoted: m });
  }
};