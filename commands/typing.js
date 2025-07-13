const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const typingFile = path.join(__dirname, '../data/typing.json');

const newsletterInfo = {
  newsletterJid: '120363402565816662@newsletter',
  newsletterName: 'KAYA MD',
  serverMessageId: 124
};

module.exports = {
  name: 'typing',
  description: 'Active ou désactive le statut "typing" (owner uniquement)',

  run: async (kaya, m, msg, store, args) => {
    const senderId = m.sender.split('@')[0];

    if (!config.owner.includes(senderId)) {
      return kaya.sendMessage(
        m.chat,
        {
          text: '❌ Cette commande est réservée au propriétaire du bot.',
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: newsletterInfo
          }
        },
        { quoted: m }
      );
    }

    const arg = args[0]?.toLowerCase();
    let typingData = { enabled: false };

    if (fs.existsSync(typingFile)) {
      try {
        typingData = JSON.parse(fs.readFileSync(typingFile));
      } catch {
        typingData = { enabled: false };
      }
    }

    if (!arg) {
      return kaya.sendMessage(
        m.chat,
        {
          text: `
✍️ Commande typing

Active ou désactive le statut "typing".

Utilisation :
.typing on   → Active le statut typing
.typing off  → Désactive le statut typing
          `.trim(),
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: newsletterInfo
          }
        },
        { quoted: m }
      );
    }

    if (arg === 'on') {
      typingData.enabled = true;
      fs.writeFileSync(typingFile, JSON.stringify(typingData, null, 2));
      return kaya.sendMessage(
        m.chat,
        {
          text: '✍️ Le mode *typing* est activé.',
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: newsletterInfo
          }
        },
        { quoted: m }
      );
    }

    if (arg === 'off') {
      typingData.enabled = false;
      fs.writeFileSync(typingFile, JSON.stringify(typingData, null, 2));
      return kaya.sendMessage(
        m.chat,
        {
          text: '🛑 Le mode *typing* est désactivé.',
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: newsletterInfo
          }
        },
        { quoted: m }
      );
    }

    return kaya.sendMessage(
      m.chat,
      {
        text: '❌ Argument invalide. Utilisation : *.typing on* ou *.typing off*',
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: newsletterInfo
        }
      },
      { quoted: m }
    );
  }
};