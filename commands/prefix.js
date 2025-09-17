// ================= commands/prefix.js =================
import checkAdminOrOwner from "../utils/checkAdmin.js";
import config from '../config.js';

export default {
  name: 'prefix',
  description: '🔑 Change le préfixe du bot (owner uniquement)',
  category: 'Owner',

  run: async (kaya, m, msg, store, args) => {
    try {
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: '🚫 Cette commande est réservée au propriétaire du bot.' },
          { quoted: m }
        );
      }

      const newPrefix = args[0];
      if (!newPrefix) {
        return kaya.sendMessage(
          m.chat,
          { text: `❌ Utilisation : ${config.PREFIX}prefix <nouveau préfixe>` },
          { quoted: m }
        );
      }

      config.PREFIX = newPrefix;

      if (config.saveConfig) config.saveConfig({ PREFIX: newPrefix });

      return kaya.sendMessage(
        m.chat,
        { text: `✅ Préfixe changé avec succès !\nNouveau : \`${newPrefix}\`` },
        { quoted: m }
      );
    } catch (err) {
      console.error('❌ Erreur commande prefix :', err);
      return kaya.sendMessage(
        m.chat,
        { text: '⚠️ Impossible de changer le préfixe pour le moment.' },
        { quoted: m }
      );
    }
  }
};