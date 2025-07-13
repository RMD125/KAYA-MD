const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const FILE = path.join(__dirname, '../data/antirevoque.json');

function ensureFile() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');
}

function loadData() {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE));
}

function saveData(data) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

const helpText = `
╭───🤖 *KAYA-MD* - ANTIREVOQUE ──⬣
│ Usage : 
│ .antirevoque on  ➡️ Active l'anti-révoque
│ .antirevoque off ➡️ Désactive l'anti-révoque
│
│  Empêche la révocation des administrateurs dans le groupe.
╰───────────────────────────⬣
`;

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 122
  }
};

module.exports = {
  name: 'antirevoque',
  description: "🚫 Empêche la révocation des admins (owner ou admin seulement)",

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) {
      return kaya.sendMessage(m.chat, {
        text: '❌ *Cette commande ne peut être utilisée que dans un groupe.*',
        contextInfo
      }, { quoted: m });
    }

    if (!args[0]) {
      return kaya.sendMessage(m.chat, { text: helpText, contextInfo }, { quoted: m });
    }

    const groupMetadata = await kaya.groupMetadata(m.chat);
    const sender = m.sender;
    const botId = kaya.user.id.split(':')[0] + '@s.whatsapp.net';

    const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
    const isSenderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
    const isOwner = config.owner.includes(sender.split('@')[0]);

    if (!isBotAdmin) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Je dois être admin pour activer cette protection.',
        contextInfo
      }, { quoted: m });
    }

    if (!isSenderAdmin && !isOwner) {
      return kaya.sendMessage(m.chat, {
        text: '🚫 Seuls les admins ou le propriétaire peuvent activer ça.',
        contextInfo
      }, { quoted: m });
    }

    const arg = args[0].toLowerCase();
    if (!['on', 'off'].includes(arg)) {
      return kaya.sendMessage(m.chat, { text: helpText, contextInfo }, { quoted: m });
    }

    const data = loadData();

    if (arg === 'on') {
      data[m.chat] = true;
      saveData(data);
      return kaya.sendMessage(m.chat, {
        text: '╭─「 🤖 *KAYA-MD* 」─⬣\n│ ✅ *Anti-révoque activé*\n╰───────────────⬣',
        contextInfo
      }, { quoted: m });
    } else {
      if (data[m.chat]) {
        delete data[m.chat];
        saveData(data);
      }
      return kaya.sendMessage(m.chat, {
        text: '╭─「 🤖 *KAYA-MD* 」─⬣\n│ ❌ *Anti-révoque désactivé*\n╰───────────────⬣',
        contextInfo
      }, { quoted: m });
    }
  }
};