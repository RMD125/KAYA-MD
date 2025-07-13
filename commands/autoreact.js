const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const dataPath = path.join(__dirname, '../data/autoreact.json');
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '{}');
const allEmojis = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','😗','😙','😚','🙂','🤗','🤩',
  '🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤',
  '😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯',
  '😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥺',
  '🤠','🤡','🤥','🤫','🤭','🫢','🫣','🫡','🧐','🤓','😈','👿','👹','👺','💀','👻','👽','🤖','💩','🙈'
];

module.exports = {
  name: 'autoreact',
  description: 'Active les réactions automatiques (owner uniquement)',
  category: 'réactions',

  run: async (kaya, m, msg, store, args) => {
    const sender = m.sender.replace(/\D/g, '');
    if (!config.owner.includes(sender)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Seul le propriétaire peut utiliser cette commande.',
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

    const option = args[0]?.toLowerCase();

    if (!option) {
      return kaya.sendMessage(m.chat, {
        text: `
⚙️ Commande AutoReact

Active ou désactive les réactions automatiques.

Utilisation :
.autoreact all    → Réagit à tous les messages

.autoreact group  → Réagit seulement dans les groupes

.autoreact inbox  → Réagit seulement dans les conversations privées

.autoreact off    → Désactive les réactions automatiques
        `.trim(),
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

    if (!['all', 'group', 'inbox', 'off'].includes(option)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Option inconnue. Tape `.autoreact` pour voir les options disponibles.',
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

    // Lecture ou création du fichier autoData pour s'assurer qu'on modifie toujours la dernière version
    let autoData = {};
    try {
      autoData = JSON.parse(fs.readFileSync(dataPath));
    } catch {}

    if (option === 'off') {
      delete autoData.mode;
    } else {
      autoData.mode = option;
    }

    fs.writeFileSync(dataPath, JSON.stringify(autoData, null, 2));

    const status = autoData.mode
      ? `✅ Auto-réaction activée : *${autoData.mode.toUpperCase()}*`
      : '❌ Auto-réaction désactivée.';

    return kaya.sendMessage(m.chat, {
      text:
`╭━━〔 ⚙️ KAYA-MD AUTO-REACT 〕━━⬣
├ 👑 Propriétaire : ${sender}
├ 🔄 Mode sélectionné : *${option.toUpperCase()}*
├ 🎭 Réactions variées sur chaque message
╰────────────────────────⬣

${status}`,
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

  onMessage: async (kaya, m) => {
    let autoData = {};
    try {
      autoData = JSON.parse(fs.readFileSync(dataPath));
    } catch {}

    const { mode } = autoData;
    if (!mode) return;

    const emoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    const isGroup = m.key.remoteJid.endsWith('@g.us');

    if (
      (mode === 'group' && isGroup) ||
      (mode === 'inbox' && !isGroup) ||
      (mode === 'all')
    ) {
      try {
        await kaya.sendMessage(m.chat, {
          react: {
            text: emoji,
            key: m.key
          }
        });
      } catch (err) {
        console.log('❌ Erreur auto reaction :', err.message);
      }
    }
  }
};