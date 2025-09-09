const fs = require('fs');
const path = require('path');
const config = require('../config');

const file = path.join(__dirname, '../data/chabot.json');

module.exports = {
  name: 'chatbot',
  description: 'Active ou désactive le mode ChatBot pour tout le monde (inbox + groupes)',
  category: 'IA',

  run: async (kaya, m, msg, store, args) => {
    const sender = m.sender.split('@')[0];

    // Vérifie si l'utilisateur est propriétaire
    if (!config.owner.includes(sender)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Seul le propriétaire peut activer ou désactiver le mode ChatBot global.',
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter',
            newsletterName: 'KAYA MD',
            serverMessageId: 200
          }
        }
      }, { quoted: m });
    }

    const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : { global: false };
    const action = (args[0] || '').toLowerCase();
    let response;

    switch (action) {
      case 'on':
        db.global = true;
        response = '✅ Le mode *ChatBot* est maintenant activé pour tout le monde.';
        break;
      case 'off':
        db.global = false;
        response = '🚫 Le mode *ChatBot* est maintenant désactivé pour tout le monde.';
        break;
      default:
        response = '❌ Utilisation incorrecte.\n\nExemples :\n.chatbot on\n.chatbot off';
        break;
    }

    fs.writeFileSync(file, JSON.stringify(db, null, 2));

    return kaya.sendMessage(m.chat, {
      text: response,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363402565816662@newsletter',
          newsletterName: 'KAYA MD',
          serverMessageId: 201
        }
      }
    }, { quoted: m });
  }
};