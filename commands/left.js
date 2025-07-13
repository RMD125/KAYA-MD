const config = require('../system/config');

module.exports = {
  name: 'left',
  description: 'Le bot quitte le groupe (owner uniquement)',
  category: 'owner',

  run: async (kaya, m) => {
    const sender = m.sender.split('@')[0];

    if (!config.owner.includes(sender)) {
      return m.reply('🚫 *Commande réservée au propriétaire du bot.*');
    }

    if (!m.isGroup) {
      return m.reply('❗ Cette commande doit être utilisée dans un groupe.');
    }

    await m.reply('👋 *KAYA-MD quitte le groupe...*');
    await kaya.groupLeave(m.chat);
  }
};