const fs = require('fs');
const path = require('path');

const SPAM_FILE = path.join(__dirname, '../data/antispam.json');
let spamSettings = { enabled: false };
if (fs.existsSync(SPAM_FILE)) {
  spamSettings = JSON.parse(fs.readFileSync(SPAM_FILE));
} else {
  fs.writeFileSync(SPAM_FILE, JSON.stringify(spamSettings, null, 2));
}

const spamTracker = {};

module.exports = {
  name: 'antispam',
  description: 'Active ou désactive le système anti-spam',
  category: 'sécurité',

  async run(kaya, m, msg, store, args) {
    const command = args[0]?.toLowerCase();

    if (!['on', 'off'].includes(command)) {
      return kaya.sendMessage(m.chat, {
        text: `╭━━━〔 🔧 KAYA-MD ┃ AntiSpam 〕━━⬣
┃ *Utilisation :* .antispam on / off
┃ *Statut actuel :* ${spamSettings.enabled ? '✅ Activé' : '❌ Désactivé'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━⬣`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter',
            newsletterName: 'KAYA MD',
            serverMessageId: 122
          }
        }
      }, { quoted: m });
    }

    spamSettings.enabled = command === 'on';
    fs.writeFileSync(SPAM_FILE, JSON.stringify(spamSettings, null, 2));

    await kaya.sendMessage(m.chat, {
      text: `✅ Anti-Spam est maintenant *${command === 'on' ? 'activé' : 'désactivé'}*.`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363402565816662@newsletter',
          newsletterName: 'KAYA MD',
          serverMessageId: 122
        }
      }
    }, { quoted: m });
  },

  async onMessage(kaya, m) {
    if (!spamSettings.enabled || !m.message || !m.key || m.key.fromMe) return;

    const sender = m.sender;
    const now = Date.now();

    if (!spamTracker[sender]) {
      spamTracker[sender] = { timestamps: [] };
    }

    const tracker = spamTracker[sender];
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 10000);
    tracker.timestamps.push(now);

    if (tracker.timestamps.length >= 7) {
      try {
        await kaya.groupParticipantsUpdate(m.chat, [sender], 'remove');

        if (store && store.messages && store.messages[m.chat]) {
          for (const msg of store.messages[m.chat].values()) {
            if (msg.key?.participant === sender) {
              await kaya.sendMessage(m.chat, {
                delete: msg.key
              });
            }
          }
        }

        await kaya.sendMessage(m.chat, {
          text: `╭━━━〔 🤖 KAYA-MD ┃ Anti-Spam 〕━━━⬣
┃ 🚨 *Spam détecté !* (7 msgs / 10 sec)
┃ 👤 Utilisateur : @${sender.split('@')[0]}
┃ 🧹 Messages supprimés
┃ ❌ *Expulsé du groupe*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`,
          mentions: [sender],
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363402565816662@newsletter',
              newsletterName: 'KAYA MD',
              serverMessageId: 122
            }
          }
        });

        delete spamTracker[sender];
      } catch (err) {
        console.error('Erreur anti-spam :', err);
      }
    }
  }
};