const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const welcomeFile = path.join(__dirname, '../data/welcome.json');
let welcomeData = {};

try {
  welcomeData = JSON.parse(fs.readFileSync(welcomeFile));
} catch {
  welcomeData = {};
  fs.writeFileSync(welcomeFile, '{}');
}

function saveWelcomeData() {
  fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
}

// Chaîne contextuelle
const contextInfo = {
  mentionedJid: [],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 143
  }
};

module.exports = {
  name: 'welcome',
  description: 'Active ou désactive le message de bienvenue dans les groupes',

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) return m.reply('❌ Cette commande fonctionne uniquement dans un groupe.');

    const metadata = await kaya.groupMetadata(m.chat).catch(() => null);
    if (!metadata) return m.reply('❌ Impossible de récupérer les informations du groupe.');

    const senderId = m.sender.split('@')[0];
    const participant = metadata.participants.find(p => p.id === m.sender);
    const isAdmin = ['admin', 'superadmin'].includes(participant?.admin);
    const isOwner = config.owner.includes(senderId);

    if (!isAdmin && !isOwner) {
      return m.reply('❌ Seuls les administrateurs ou le propriétaire du bot peuvent utiliser cette commande.');
    }

    const groupPP = await kaya.profilePictureUrl(m.chat, 'image').catch(() => null);
    const imageUrl = groupPP || 'https://i.imgur.com/3XjWdoI.png';

    const subCmd = args[0]?.toLowerCase();

    if (subCmd === 'on') {
      return kaya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ *WELCOME*
├ 1. Pour ce groupe uniquement : tape \`.welcome 1\`
├ 2. Pour tous les groupes : tape \`.welcome all\`
├ Tape \`.welcome off\` pour désactiver
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    if (subCmd === 'off') {
      return kaya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ *WELCOME OFF*
├ 1. Pour ce groupe uniquement tape \`.welcome 1 off\`
├ 2. Pour tous les groupes tape \`.welcome all off\`
├ 🔙 Tape \`.welcome on\` pour réactiver
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    if (subCmd === '1') {
      if (args[1] === 'off') {
        delete welcomeData[m.chat];
        saveWelcomeData();
        return kaya.sendMessage(m.chat, {
          image: { url: imageUrl },
          caption: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ *WELCOME DÉSACTIVÉ*
├ Pour ce groupe uniquement 🚫
╰────────────────────⬣`,
          contextInfo
        }, { quoted: m });
      }
      welcomeData[m.chat] = true;
      saveWelcomeData();
      return kaya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ *WELCOME ACTIVÉ ✔️*
├ Pour ce groupe uniquement ✅
├ Tape \`.welcome off\` pour désactiver
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    if (subCmd === 'all') {
      if (args[1] === 'off') {
        delete welcomeData.global;
        saveWelcomeData();
        return kaya.sendMessage(m.chat, {
          image: { url: imageUrl },
          caption: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ *WELCOME DÉSACTIVÉ*
├ Pour tous les groupes 🌍
╰────────────────────⬣`,
          contextInfo
        }, { quoted: m });
      }
      welcomeData.global = true;
      saveWelcomeData();
      return kaya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ *WELCOME ACTIVÉ ✔️*
├ Pour tous les groupes 🌍
├ Tape \`.welcome off\` pour désactiver
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    return kaya.sendMessage(m.chat, {
      text: '❓ Utilise `.welcome on`, `.welcome 1`, `.welcome all`, `.welcome off`, `.welcome 1 off` ou `.welcome all off`.',
      contextInfo
    }, { quoted: m });
  },

  participantUpdate: async (kaya, update) => {
    const { id, participants, action } = update;
    if (action !== 'add' || (!welcomeData.global && !welcomeData[id])) return;

    for (const user of participants) {
      try {
        const metadata = await kaya.groupMetadata(id).catch(() => null);
        if (!metadata) return;

        const userPP = await kaya.profilePictureUrl(user, 'image').catch(() => null);
        const imageUrl = userPP || 'https://i.imgur.com/3XjWdoI.png';
        const username = '@' + user.split('@')[0];

        const groupName = metadata.subject || 'Nom inconnu';
        const groupSize = metadata.participants.length;
        const creationDate = new Date(metadata.creation * 1000).toLocaleDateString('fr-FR', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        const currentDate = new Date().toLocaleDateString('fr-FR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const welcomeText = `╭━━〔 WELCOME 𝗞𝗔𝗬𝗔-𝗠𝗗〕━━⬣
├ 👤 Bienvenue ${username}
├ 🎓 Groupe: *${groupName}*
├ 👥 Membres : ${groupSize}
├ 🏗️ Créé le : ${creationDate}
├ 📆 Date: ${currentDate}
├ 📜 \`Règles\` :
│  ┗ Pas de liens interdits ❌
│  ┗ Pas de contenu xxx 🔞
│  ┗ Pas de spam 🚫
╰─────────────────────⬣`;

        await kaya.sendMessage(id, {
          image: { url: imageUrl },
          caption: welcomeText,
          mentions: [user],
          contextInfo: {
            ...contextInfo,
            mentionedJid: [user]
          }
        });
      } catch (err) {
        console.log('❌ Erreur welcome :', err);
      }
    }
  }
};