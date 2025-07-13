const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, '../system/config'));

const DATA_FILE = path.join(__dirname, '../data/antipromote.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}', 'utf-8');
}

function loadData() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getNumberFromJid(jid) {
  return jid.split('@')[0];
}

const helpText = `
╭─「 🤖 *KAYA-MD* - ANTIPROMOTE 」─⬣
│ Usage :
│ .antipromote on  ➡️ Active l'anti-promotion
│ .antipromote off ➡️ Désactive l'anti-promotion
│
│ Empêche la promotion des membres en admin sans autorisation.
╰───────────────⬣
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
  name: 'antipromote',
  description: "🤖 Active ou désactive l'anti-promotion dans le groupe (owner ou admin seulement)",

  run: async (kaya, m, msg, store, args) => {
    const senderNumber = getNumberFromJid(m.sender);
    const chatId = m.chat;

    if (!m.isGroup) {
      return kaya.sendMessage(chatId, {
        text: '❌ *Cette commande ne peut être utilisée que dans un groupe.*',
        contextInfo
      }, { quoted: m });
    }

    if (!args[0]) {
      return kaya.sendMessage(chatId, { text: helpText, contextInfo }, { quoted: m });
    }

    const metadata = await kaya.groupMetadata(chatId);
    const botId = kaya.user.id.split(':')[0] + '@s.whatsapp.net';
    const botIsAdmin = metadata.participants.some(p => p.id === botId && p.admin !== null);

    if (!botIsAdmin) {
      return kaya.sendMessage(chatId, {
        text: "❌ Je dois être administrateur dans ce groupe pour gérer l'anti-promotion.",
        contextInfo
      }, { quoted: m });
    }

    const senderIsOwner = config.owner.includes(senderNumber);
    const senderIsAdmin = metadata.participants.some(p => p.id === m.sender && p.admin !== null);

    if (!senderIsOwner && !senderIsAdmin) {
      return kaya.sendMessage(chatId, {
        text: '❌ Seul un administrateur ou le propriétaire du bot peut utiliser cette commande.',
        contextInfo
      }, { quoted: m });
    }

    const arg = args[0].toLowerCase();

    if (!['on', 'off'].includes(arg)) {
      return kaya.sendMessage(chatId, { text: helpText, contextInfo }, { quoted: m });
    }

    const data = loadData();

    if (arg === 'on') {
      data[chatId] = true;
      saveData(data);
      return kaya.sendMessage(chatId, {
        text: '╭─「 🤖 *KAYA-MD* 」─⬣\n│ ✅ *Anti-promotion activé*\n╰───────────────⬣',
        contextInfo
      }, { quoted: m });
    } else {
      if (data[chatId]) {
        delete data[chatId];
        saveData(data);
      }
      return kaya.sendMessage(chatId, {
        text: '╭─「 🤖 *KAYA-MD* 」─⬣\n│ ❌ *Anti-promotion désactivé*\n╰───────────────⬣',
        contextInfo
      }, { quoted: m });
    }
  },

  isActive(chatId) {
    const data = loadData();
    return !!data[chatId];
  }
};