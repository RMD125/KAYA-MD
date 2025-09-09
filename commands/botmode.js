const config = require('../config');
const checkAdminOrOwner = require('../utils/checkAdmin'); 
const { contextInfo } = require('../utils/contextInfo'); // ✅ Import centralisé

module.exports = {
  name: 'botmode',
  description: 'Changer le mode du bot : public ou privé',
  category: 'Owner',

  run: async (kaya, m, msg, store, args) => {
    // ✅ Vérifie les permissions
    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    if (!permissions.isOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Cette commande est réservée au propriétaire du bot.', contextInfo },
        { quoted: m }
      );
    }

    if (!args[0]) {
      return kaya.sendMessage(
        m.chat,
        { text: `❌ Indique le mode :\n.public on|off\n.private on|off`, contextInfo },
        { quoted: m }
      );
    }

    const cmd = args[0].toLowerCase();
    const value = args[1]?.toLowerCase();

    if (!['on', 'off'].includes(value)) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Valeur invalide. Utilise on ou off.', contextInfo },
        { quoted: m }
      );
    }

    if (cmd === 'public') {
      config.saveUserConfig({ publicBot: value === 'on' });
      return kaya.sendMessage(
        m.chat,
        { text: `✅ Mode public du bot : ${value === 'on' ? 'activé' : 'désactivé'}`, contextInfo },
        { quoted: m }
      );
    }

    if (cmd === 'private') {
      config.saveUserConfig({ publicBot: value !== 'on' }); // private = !public
      return kaya.sendMessage(
        m.chat,
        { text: `✅ Mode privé du bot : ${value === 'on' ? 'activé' : 'désactivé'}`, contextInfo },
        { quoted: m }
      );
    }

    return kaya.sendMessage(
      m.chat,
      { text: '❌ Commande inconnue. Utilise .public ou .private.', contextInfo },
      { quoted: m }
    );
  }
};