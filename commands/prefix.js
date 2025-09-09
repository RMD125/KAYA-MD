const checkAdminOrOwner = require('../utils/checkAdmin');
const config = require('../config');

module.exports = {
  name: 'prefix',
  description: '🔑 Change le préfixe du bot (owner uniquement)',
  category: 'Owner',

  run: async (Kaya, m, msg, store, args) => {
    try {
      // ✅ Vérifie si le sender est owner
      const permissions = await checkAdminOrOwner(Kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return Kaya.sendMessage(
          m.chat,
          { text: '🚫 Cette commande est réservée au propriétaire du bot.' },
          { quoted: m }
        );
      }

      const newPrefix = args[0];
      if (!newPrefix) {
        return Kaya.sendMessage(
          m.chat,
          { text: `❌ Utilisation : ${config.PREFIX}prefix <nouveau préfixe>` },
          { quoted: m }
        );
      }

      // Met à jour en mémoire
      config.PREFIX = newPrefix;

      // Sauvegarde dans config.json
      if (config.saveConfig) config.saveConfig({ PREFIX: newPrefix });

      return Kaya.sendMessage(
        m.chat,
        { text: `✅ Préfixe changé avec succès !\nNouveau : \`${newPrefix}\`` },
        { quoted: m }
      );
    } catch (err) {
      console.error('❌ Erreur commande prefix :', err);
      return Kaya.sendMessage(
        m.chat,
        { text: '⚠️ Impossible de changer le préfixe pour le moment.' },
        { quoted: m }
      );
    }
  }
};