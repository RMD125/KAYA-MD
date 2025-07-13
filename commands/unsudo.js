const config = require('../system/config');

module.exports = {
  name: 'unsudo',
  description: '➖ Retire un owner existant (réservé au propriétaire principal)',
  category: 'owner',

  run: async (kaya, m, msg, store, args) => {
    const senderId = m.sender.split('@')[0];
    const isOwner = config.owner.includes(senderId);

    if (!isOwner) {
      return m.reply('🚫 *Seul le propriétaire principal peut retirer un owner.*');
    }

    let targetId;
    if (m.quoted) {
      targetId = m.quoted.sender.split('@')[0];
    } else if (args[0]) {
      targetId = args[0].replace(/[^0-9]/g, '');
    } else {
      return m.reply('❌ *Réponds à un message ou indique un numéro à retirer.*');
    }

    if (!config.owner.includes(targetId)) {
      return m.reply(`❌ *@${targetId}* n’est pas un owner.`, {
        mentions: [targetId + '@s.whatsapp.net']
      });
    }

    if (targetId === senderId) {
      return m.reply('🛑 *Tu ne peux pas te retirer toi-même.*');
    }

    config.owner = config.owner.filter(o => o !== targetId);
    config.saveUserConfig({ owner: config.owner });

    await kaya.sendMessage(m.chat, {
      text: `╭━━〔 🔓 RETRAIT OWNER 〕━━⬣
├ 📲 Numéro : @${targetId}
├ ❌ Statut : *Supprimé de la liste des owners*
├ 🧹 Nettoyage terminé
╰────────────────────⬣`,
      mentions: [targetId + '@s.whatsapp.net']
    }, { quoted: m });
  }
};