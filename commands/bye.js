const fs = require('fs');
const path = require('path');
const checkAdminOrOwner = require('../utils/checkAdmin');
const decodeJid = require('../utils/decodeJid');

const byeFile = path.join(__dirname, '../data/bye.json');
let byeData = {};

// Charger ou créer le fichier
try {
  byeData = JSON.parse(fs.readFileSync(byeFile, 'utf-8'));
} catch {
  byeData = {};
  fs.writeFileSync(byeFile, '{}');
}

function saveByeData() {
  fs.writeFileSync(byeFile, JSON.stringify(byeData, null, 2));
}

const contextInfo = {
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
  description: 'Active ou désactive le message d’au revoir dans les groupes',

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup)
        return kaya.sendMessage(m.chat, { text: '❌ Cette commande fonctionne uniquement dans un groupe.' }, { quoted: msg });

      const chatId = decodeJid(m.chat);
      const sender = decodeJid(m.sender);

      const permissions = await checkAdminOrOwner(kaya, chatId, sender);
      permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

      if (!permissions.isAdminOrOwner)
        return kaya.sendMessage(chatId, { text: '❌ Seuls les admins ou le propriétaire peuvent utiliser cette commande.' }, { quoted: msg });

      let subCmd = args[0]?.toLowerCase() || '';
      if (!subCmd && m.body.toLowerCase().startsWith('.bye')) {
        subCmd = m.body.toLowerCase().replace('.bye', '').trim();
      }

      // Récupère la photo du groupe
      const groupPP = await kaya.profilePictureUrl(chatId, 'image').catch(() => 'https://i.imgur.com/3XjWdoI.png');

      if (subCmd === 'on' || subCmd === '1') {
        byeData[chatId] = true;
        saveByeData();
        return kaya.sendMessage(chatId, { 
          image: { url: groupPP }, 
          caption: '✅ *BYE ACTIVÉ* pour ce groupe !'
        }, { quoted: m });
      }

      if (subCmd === 'off') {
        delete byeData[chatId];
        saveByeData();
        return kaya.sendMessage(chatId, { 
          image: { url: groupPP }, 
          caption: '❌ *BYE DÉSACTIVÉ* pour ce groupe.'
        }, { quoted: m });
      }

      return kaya.sendMessage(chatId, {
        text: '❓ Utilise `.bye on` ou `.bye off`.',
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error('❌ Erreur bye run :', err);
      return kaya.sendMessage(m.chat, { text: `❌ Erreur bye : ${err.message}` }, { quoted: m });
    }
  },

  participantUpdate: async (kaya, update) => {
    const chatId = decodeJid(update.id); // <-- Correction ici
    const { participants, action } = update;

    if (action !== 'remove' || (!byeData.global && !byeData[chatId])) return;

    for (const user of participants) {
      try {
        const metadata = await kaya.groupMetadata(chatId).catch(() => null);
        if (!metadata) return;

        // Photo membre + fallback
        const userPP = await kaya.profilePictureUrl(user, 'image').catch(() => null);
        const imageUrl = userPP || await kaya.profilePictureUrl(chatId, 'image').catch(() => 'https://i.imgur.com/3XjWdoI.png');

        const username = '@' + user.split('@')[0];
        const groupName = metadata.subject || 'Nom inconnu';
        const groupSize = metadata.participants.length;

        const byeText = `╭━━〔 BYE 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ 👋 Au revoir ${username}
├ 🎓 Groupe: *${groupName}*
├ 👥 Membres restants : ${groupSize}
╰─────────────────────⬣`;

        await kaya.sendMessage(chatId, {
          image: { url: imageUrl },
          caption: byeText,
          mentions: [user],
          contextInfo: { ...contextInfo, mentionedJid: [user] }
        });

      } catch (err) {
        console.error('❌ Erreur bye participantUpdate :', err);
      }
    }
  }
};