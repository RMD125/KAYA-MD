const fs = require('fs');
const path = require('path');
const config = require('../system/config');

const banFile = path.join(__dirname, '../data/ban.json');
if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, '{}');
const banData = JSON.parse(fs.readFileSync(banFile));

module.exports = {
  name: 'ban',
  description: 'Bannir un utilisateur du bot (owner uniquement)',

  run: async (kaya, m, msg, store, args) => {
    const senderId = m.sender.split('@')[0].replace(/[^0-9]/g, '');
    if (!config.owner.includes(senderId)) {
      return m.reply('❌ *Cette commande est réservée au propriétaire du bot.*');
    }

    let targetJid;

    if (m.quoted) {
      targetJid = m.quoted.sender;
    } else if (args[0]) {
      const number = args[0].replace(/[^0-9]/g, '');
      if (!number) return m.reply('❗ *Numéro invalide.*');
      targetJid = number + '@s.whatsapp.net';
    } else {
      return m.reply('❗ *Réponds au message de la personne ou mets son numéro en argument.*');
    }

    const targetId = targetJid.split('@')[0].replace(/[^0-9]/g, '');

    if (banData[targetId]) {
      return m.reply('⚠️ *Cet utilisateur est déjà banni.*');
    }

    banData[targetId] = true;
    fs.writeFileSync(banFile, JSON.stringify(banData, null, 2));

    const username = '@' + targetId;
    const replyText = `╭━━〔 🚫 KAYA-MD 〕━━⬣
├ ⚠️ *BANNISSEMENT*
├ 👤 Utilisateur : ${username}
├ ✅ *Cet utilisateur est désormais banni* du bot
╰────────────────────⬣`;

    await kaya.sendMessage(m.chat, {
      text: replyText,
      mentions: [targetJid],
    });
  }
};