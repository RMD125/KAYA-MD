const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/chabot.json');
const config = require('../system/config');

module.exports = {
  name: 'chatbot',
  description: 'Active ou désactive le mode ChatBot pour tout le monde (inbox + groupe)',
  category: 'IA',

  run: async (kaya, m, msg, store, args) => {
    const sender = m.sender.split('@')[0];

    if (!config.owner.includes(sender)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Seul le propriétaire peut activer ou désactiver le mode ChatBot global.',
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter', // remplace ici par l'ID de ta chaîne
            newsletterName: 'KAYA MD',
            serverMessageId: 200
          }
        }
      }, { quoted: m });
    }

    const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
    const action = (args[0] || '').toLowerCase();
    let response = '';

    if (action === 'on') {
      db['global'] = true;
      fs.writeFileSync(file, JSON.stringify(db, null, 2));
      response = '✅ Le mode *ChatBot* est maintenant activé pour tout le monde.';
    } else if (action === 'off') {
      delete db['global'];
      fs.writeFileSync(file, JSON.stringify(db, null, 2));
      response = '🚫 Le mode *ChatBot* est maintenant désactivé pour tout le monde.';
    } else {
      response = '❌ Utilise : `.chatbot on` ou `.chatbot off`';
    }

    await kaya.sendMessage(m.chat, {
      text: response,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363402565816662@newsletter', // ton ID chaîne
          newsletterName: 'KAYA MD',
          serverMessageId: 201 // un autre ID fictif ou réel d’un message de la chaîne
        }
      }
    }, { quoted: m });
  }
};