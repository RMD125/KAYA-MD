const config = require('../system/config');
module.exports = {
  name: 'allkaya',
  alias: ['kayaall', 'kayasend'],
  description: '📢 Envoie un message dans tous les groupes (réservé au propriétaire).',
  category: 'owner',

  run: async (kaya, m, msg, store, args) => {
    try {
// Vérifie si l'utilisateur est propriétaire du bot
const senderNumber = m.sender.split('@')[0];
if (!config.owner.includes(senderNumber)) {
  return kaya.sendMessage(m.chat, {
    text: "⛔ Cette commande est réservée au *propriétaire* du bot."
  }, { quoted: m });
}
      if (!args.length) {
        return kaya.sendMessage(m.chat, {
          text: `ℹ️ *Description de la commande .allkaya*\n\n${module.exports.description}\n\n📌 *Utilisation :* !allkaya votre_message_personnalisé`
        }, { quoted: m });
      }

      // Compose le message à envoyer
      const message = `📢 *Annonce KAYA-MD :*\n\n${args.join(" ")}\n\n_Envoyé par @${m.sender.split("@")[0]}_`;

      // Récupère la liste des groupes via store
      let chats = store.chats.all ? store.chats.all() : [];
      const groupIds = chats.filter(chat => chat.id.endsWith('@g.us')).map(chat => chat.id);

      if (groupIds.length === 0) {
        return m.reply("⚠️ Le bot n'est membre d'aucun groupe.");
      }

      m.reply(`📡 Envoi du message dans *${groupIds.length} groupes*...`);

      // Envoi du message dans chaque groupe avec délai
      for (const groupId of groupIds) {
        await kaya.sendMessage(groupId, {
          text: message,
          mentions: [m.sender]
        });
        await new Promise(res => setTimeout(res, 1500)); // Pause 1.5s entre chaque envoi
      }

      return m.reply("✅ Message envoyé avec succès dans tous les groupes !");
    } catch (error) {
      console.error('Erreur dans la commande allkaya :', error);
      return m.reply('❌ Une erreur est survenue lors de l\'envoi du message.');
    }
  }
};