const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../antilink.json');
let antiLinkGroups = new Set();

if (fs.existsSync(filePath)) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    antiLinkGroups = new Set(data);
  } catch (err) {
    console.error('❌ Erreur de lecture du fichier antilink.json :', err);
  }
}

function saveAntiLinkGroups() {
  fs.writeFileSync(filePath, JSON.stringify([...antiLinkGroups], null, 2));
}

const linkRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/\w+|t\.me\/\w+|instagram\.com\/\S+|facebook\.com\/\S+|youtube\.com\/\S+|youtu\.be\/\S+|tiktok\.com\/\S+)/i;

// contextInfo promotionnel
const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  mentionedJid: [],
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 143
  }
};

module.exports = {
  name: 'antilink',
  description: '🚫 Active ou désactive le blocage des liens dans un groupe',

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) {
      return kaya.sendMessage(m.chat, {
        text: '❗ Cette commande ne fonctionne que dans les groupes.',
        contextInfo
      }, { quoted: m });
    }

    const metadata = await kaya.groupMetadata(m.chat);
    const participant = metadata.participants.find(p => p.id === m.sender);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

    if (!isAdmin) {
      return kaya.sendMessage(m.chat, {
        text: '⛔ Seuls les *admins* peuvent activer ou désactiver l\'antilink.',
        contextInfo
      }, { quoted: m });
    }

    const option = args[0]?.toLowerCase();

    if (option === 'on') {
      antiLinkGroups.add(m.chat);
      saveAntiLinkGroups();
      return kaya.sendMessage(m.chat, {
        text: '✅ *Antilink activé* : tous les liens seront supprimés immédiatement.',
        contextInfo
      }, { quoted: m });
    }

    if (option === 'off') {
      antiLinkGroups.delete(m.chat);
      saveAntiLinkGroups();
      return kaya.sendMessage(m.chat, {
        text: '❎ *Antilink désactivé* : les membres peuvent envoyer des liens.',
        contextInfo
      }, { quoted: m });
    }

    return kaya.sendMessage(m.chat, {
      text: '📌 *Utilisation :*\n.antilink on\n.antilink off',
      contextInfo
    }, { quoted: m });
  },

  onMessage: async (kaya, m) => {
    try {
      if (
        m.isGroup &&
        antiLinkGroups.has(m.chat) &&
        linkRegex.test(m.body || '')
      ) {
        await kaya.sendMessage(m.chat, {
          text: `🚫 *Lien interdit détecté !*\n@${m.sender.split('@')[0]}, ton message a été supprimé.`,
          mentions: [m.sender],
          contextInfo: {
            ...contextInfo,
            mentionedJid: [m.sender]
          }
        }, { quoted: m });

        if (m.key?.id) {
          await kaya.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: m.key.id,
              participant: m.key.participant || m.sender
            }
          });
        }
      }
    } catch (err) {
      console.error('❌ Erreur dans onMessage antilink :', err);
    }
  }
};