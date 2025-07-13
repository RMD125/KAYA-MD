const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const autoreadFile = path.join(__dirname, '../data/autoread.json');
if (!fs.existsSync(autoreadFile)) fs.writeFileSync(autoreadFile, '{}');
const autoreadData = JSON.parse(fs.readFileSync(autoreadFile, 'utf-8'));

module.exports = {
  name: 'autoread',
  description: '📖 Active ou désactive la lecture automatique des messages',
  category: 'owner',

  run: async (kaya, m, msg, store, args) => {
    const senderId = m.sender.split('@')[0];
    const prefix = config.prefix || '.';

    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter', // Remplace ici par l’ID de ta chaîne WhatsApp
        newsletterName: 'KAYA MD',
        serverMessageId: 122
      }
    };

    if (!config.owner.includes(senderId)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ *Accès refusé* : Seul le propriétaire peut utiliser cette commande.',
        contextInfo
      }, { quoted: m });
    }

    const subCmd = args[0]?.toLowerCase();
    if (subCmd === 'on') {
      autoreadData['enabled'] = true;
      fs.writeFileSync(autoreadFile, JSON.stringify(autoreadData, null, 2));

      return kaya.sendMessage(m.chat, {
        text:
`╭━━〔 ✅ KAYA-MD 〕━━⬣
├ 📖 Lecture automatique activée
├ Le bot lira tous les messages automatiquement.
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    if (subCmd === 'off') {
      autoreadData['enabled'] = false;
      fs.writeFileSync(autoreadFile, JSON.stringify(autoreadData, null, 2));

      return kaya.sendMessage(m.chat, {
        text:
`╭━━〔 ❌ KAYA-MD 〕━━⬣
├ 📖 Lecture automatique désactivée
├ Le bot ne lira plus automatiquement les messages.
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    return kaya.sendMessage(m.chat, {
      text:
`❓ Utilisation :
*${prefix}autoread on* — activer
*${prefix}autoread off* — désactiver`,
      contextInfo
    }, { quoted: m });
  },

  onMessage: async (kaya, m) => {
    try {
      if (!autoreadData['enabled']) return;
      if (!m.isNewMsg) return;

      await kaya.readMessages([m.key]);
    } catch (err) {
      console.error('❌ Erreur autoread:', err);
    }
  }
};