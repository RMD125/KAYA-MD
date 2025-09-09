const config = require('../config');

module.exports = {
  name: 'left',
  description: 'Le bot quitte le groupe (owner uniquement)',
  category: 'Owner',

  run: async (kaya, m) => {
    const senderNumber = m.sender.split('@')[0];
    const owners = config.OWNER_NUMBER.split(',').map(o => o.trim());

    // ✅ Vérifie que seul le propriétaire peut utiliser
    if (!owners.includes(senderNumber)) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Cette commande est réservée au propriétaire du bot.' },
        { quoted: m }
      );
    }

    if (!m.isGroup) {
      return kaya.sendMessage(
        m.chat,
        { text: '❗ Cette commande doit être utilisée dans un groupe.' },
        { quoted: m }
      );
    }

    try {
      // Le bot quitte silencieusement le groupe
      await kaya.groupLeave(m.chat);
    } catch (e) {
      console.error('Erreur leave:', e);
      await kaya.sendMessage(
        m.chat,
        { text: '⚠️ Impossible de quitter le groupe.' },
        { quoted: m }
      );
    }
  }
};