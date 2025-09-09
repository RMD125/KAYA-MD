const checkAdminOrOwner = require('../utils/checkAdmin'); 
const config = require('../config');
const { contextInfo } = require('../utils/contextInfo'); // import centralisé

module.exports = {
  name: 'settings',
  description: 'Voir et modifier les paramètres du bot',
  category: 'Owner',

  run: async (kaya, m, msg, store, args) => {
    // ✅ Vérifie si le sender est owner
    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    if (!permissions.isOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Cette commande est réservée au propriétaire du bot.', contextInfo },
        { quoted: m }
      );
    }

    // Affichage général si aucun argument
    if (!args[0]) {
      const mode = config.publicBot ? '🌍 public' : '🔒 private';
      const autoRead = config.autoRead ? '✅ on' : '❌ off';
      const restrict = config.restrict ? '✅ on' : '❌ off';
      const botImg = config.botImage || 'Aucune';

      const message = `
╭───〔 PARAMÈTRES - 〕───⬣
│ Prefix : ${config.PREFIX}
│ Owner(s) : ${config.OWNER_NUMBER}
│ AutoRead : ${autoRead}
│ Restrict : ${restrict}
│ Mode : ${mode}
│ Bot Image : ${botImg}
╰─────────────────────⬣

🔧 Modifier un paramètre :
.prefix !
.botmode public|private
.autoread on|off
.restrict on|off
.botimage <lien>
`;

      return kaya.sendMessage(m.chat, { text: message, contextInfo }, { quoted: m });
    }

    // Modification d’un paramètre
    const param = args[0].toLowerCase();
    const value = args[1];

    switch (param) {
      case '.prefix':
        if (!value) return kaya.sendMessage(m.chat, { text: '❌ Indique le nouveau préfixe', contextInfo }, { quoted: m });
        config.PREFIX = value;
        config.saveConfig({ PREFIX: value });
        return kaya.sendMessage(m.chat, { text: `✅ Préfixe mis à jour : ${value}`, contextInfo }, { quoted: m });

      case '.botmode':
        if (!['public','private'].includes(value)) return kaya.sendMessage(m.chat, { text: '❌ Valeur invalide. public|private', contextInfo }, { quoted: m });
        config.publicBot = value === 'public';
        config.saveConfig({ publicBot: value === 'public' });
        return kaya.sendMessage(m.chat, { text: `✅ Mode du bot : ${value}`, contextInfo }, { quoted: m });

      case '.autoread':
        if (!['on','off'].includes(value)) return kaya.sendMessage(m.chat, { text: '❌ Valeur invalide. on|off', contextInfo }, { quoted: m });
        config.autoRead = value === 'on';
        config.saveConfig({ autoRead: value === 'on' });
        return kaya.sendMessage(m.chat, { text: `✅ AutoRead : ${value}`, contextInfo }, { quoted: m });

      case '.restrict':
        if (!['on','off'].includes(value)) return kaya.sendMessage(m.chat, { text: '❌ Valeur invalide. on|off', contextInfo }, { quoted: m });
        config.restrict = value === 'on';
        config.saveConfig({ restrict: value === 'on' });
        return kaya.sendMessage(m.chat, { text: `✅ Restrict : ${value}`, contextInfo }, { quoted: m });

      case '.botimage':
        if (!value) return kaya.sendMessage(m.chat, { text: '❌ Fournis le lien de la nouvelle image', contextInfo }, { quoted: m });
        config.botImage = value;
        config.saveConfig({ botImage: value });
        return kaya.sendMessage(m.chat, { text: `✅ Photo du bot mise à jour : ${value}`, contextInfo }, { quoted: m });

      default:
        return kaya.sendMessage(m.chat, { text: '❌ Paramètre inconnu.', contextInfo }, { quoted: m });
    }
  }
};