const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const byeFile = path.join(__dirname, '../data/bye.json');
if (!fs.existsSync(byeFile)) fs.writeFileSync(byeFile, '{}');
const byeData = JSON.parse(fs.readFileSync(byeFile));

// 🔗 Info pour promouvoir ta chaîne WhatsApp
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
  name: 'bye',
  description: 'Active ou désactive le message d\'adieu dans les groupes',

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) return m.reply('❌ Cette commande fonctionne uniquement dans un groupe.');

    const metadata = await kaya.groupMetadata(m.chat).catch(() => null);
    if (!metadata) return m.reply('❌ Impossible de récupérer les informations du groupe.');

    const senderId = m.sender.split('@')[0];
    const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;
    const isOwner = config.owner.includes(senderId);

    if (!isAdmin && !isOwner) {
      return m.reply('❌ Seuls les administrateurs ou le propriétaire du bot peuvent utiliser cette commande.');
    }

    const subCmd = args[0]?.toLowerCase();
    const groupPP = await kaya.profilePictureUrl(m.chat, 'image').catch(() => null);
    const imageUrl = groupPP || 'https://i.imgur.com/3XjWdoI.png';

    if (subCmd === 'on') {
      byeData[m.chat] = true;
      fs.writeFileSync(byeFile, JSON.stringify(byeData, null, 2));

      return kaya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `╭━━〔 📤 KAYA-MD 〕━━⬣
├ *BYE ACTIVÉ ✔️*
├ Un message d'adieu sera envoyé aux membres qui quittent
├ Tape \`.bye off\` pour désactiver
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    if (subCmd === 'off') {
      delete byeData[m.chat];
      fs.writeFileSync(byeFile, JSON.stringify(byeData, null, 2));

      return kaya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `╭━━〔 ❌ KAYA-MD 〕━━⬣
├ *BYE DÉSACTIVÉ*
├ Aucun message d'adieu ne sera envoyé
╰────────────────────⬣`,
        contextInfo
      }, { quoted: m });
    }

    return kaya.sendMessage(m.chat, {
      text: '❓ Utilise `.bye on` pour activer ou `.bye off` pour désactiver.',
      contextInfo
    }, { quoted: m });
  },

  participantUpdate: async (kaya, update) => {
    const { id, participants, action } = update;

    // 🚫 Si ce n’est pas une sortie, on ignore
    if (action !== 'remove' || !byeData[id] || global.isPurging) return;

    for (const user of participants) {
      try {
        const metadata = await kaya.groupMetadata(id).catch(() => null);
        if (!metadata) return;

        const groupPP = await kaya.profilePictureUrl(id, 'image').catch(() => null);
        const imageUrl = groupPP || 'https://i.imgur.com/3XjWdoI.png';
        const username = '@' + user.split('@')[0];
        const groupName = metadata.subject || 'Nom inconnu';

        const now = new Date().toLocaleString('fr-FR', {
          timeZone: 'Africa/Kinshasa',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        const goodbyeText = `╭━━〔 AU REVOIR 👋 KAYA-MD 〕━━⬣
├ 😢 Adieu ${username}
├ 📤 Tu as quitté le groupe *${groupName}*
├ 🕊️ Nous te souhaitons bonne chance !
├ 📆 Départ : ${now}
╰────────────────────⬣`;

        await kaya.sendMessage(id, {
          image: { url: imageUrl },
          caption: goodbyeText,
          mentions: [user],
          contextInfo: {
            ...contextInfo,
            mentionedJid: [user]
          }
        });
      } catch (err) {
        console.log('❌ Erreur bye :', err);
      }
    }
  }
};