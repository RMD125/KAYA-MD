const config = require('../system/config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'sudo',
  description: '➕ Ajoute un nouvel owner (réservé au propriétaire principal)',
  category: 'owner',
  
  run: async (kaya, m, msg, store, args) => {
    const senderId = m.sender.split('@')[0];
    const isOwner = config.owner.includes(senderId);

    if (!isOwner) {
      return m.reply(`🚫 *Seul le propriétaire principal peut utiliser cette commande.*`);
    }

    // Récupération du numéro cible
    let targetId;
    if (m.quoted) {
      targetId = m.quoted.sender.split('@')[0];
    } else if (args[0]) {
      targetId = args[0].replace(/[^0-9]/g, ''); // Nettoyage
    } else {
      return m.reply('❌ *Fournis un numéro ou réponds à un message pour ajouter comme owner.*');
    }

    if (config.owner.includes(targetId)) {
      return m.reply(`ℹ️ *@${targetId}* est déjà owner.`, { mentions: [targetId + '@s.whatsapp.net'] });
    }

    config.owner.push(targetId);
    config.saveUserConfig({ owner: config.owner });

    await kaya.sendMessage(m.chat, {
      text: `╭━━〔 👑 AJOUT OWNER 〕━━⬣
├ 📲 Numéro : @${targetId}
├ ✅ Statut : *Ajouté comme OWNER avec succès !*
├ 🔐 Accès : *Total au bot KAYA-MD*
╰────────────────────⬣`,
      mentions: [targetId + '@s.whatsapp.net']
    }, { quoted: m });
  }
};