const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const recordingFile = path.join(__dirname, '../data/recording.json');

const newsletterInfo = {
  newsletterJid: '120363402565816662@newsletter',
  newsletterName: 'KAYA MD',
  serverMessageId: 122
};

module.exports = {
  name: 'recording',
  description: 'Active ou désactive le statut "recording" (owner uniquement)',

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

    // Lire les données existantes
    let data = { enabled: false };
    if (fs.existsSync(recordingFile)) {
      try {
        data = JSON.parse(fs.readFileSync(recordingFile));
      } catch {
        data = { enabled: false };
      }
    }

    if (!arg) {
      return kaya.sendMessage(
        m.chat,
        {
          text: `
🎙️ Commande recording

Active ou désactive le statut "recording".

Utilisation :
.recording on   → Active le statut recording
.recording off  → Désactive le statut recording
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
      data.enabled = true;
      fs.writeFileSync(recordingFile, JSON.stringify(data, null, 2));
      return kaya.sendMessage(
        m.chat,
        {
          text: '🎙️ Le mode *recording* est maintenant activé.',
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
      data.enabled = false;
      fs.writeFileSync(recordingFile, JSON.stringify(data, null, 2));
      return kaya.sendMessage(
        m.chat,
        {
          text: '🛑 Le mode *recording* a été désactivé.',
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
        text: '❌ Argument invalide. Utilisation : *.recording on* ou *.recording off*',
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