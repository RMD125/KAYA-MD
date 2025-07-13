const config = require('../system/config');

module.exports = {
  name: 'link',
  description: 'Envoie le lien d’invitation du groupe',
  category: 'groupe',

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) {
      return m.reply('❌ Cette commande fonctionne uniquement dans un groupe.');
    }

    const metadata = await kaya.groupMetadata(m.chat).catch(() => null);
    if (!metadata) return m.reply('❌ Impossible de récupérer les informations du groupe.');

    const senderId = m.sender.split('@')[0];
    const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;
    const isOwner = config.owner.includes(senderId);
    const botId = kaya.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = metadata.participants.find(p => p.id === botId)?.admin;

    if (!isAdmin && !isOwner) {
      return m.reply('🚫 *Seuls les administrateurs ou le propriétaire du bot peuvent utiliser cette commande.*');
    }

    if (!isBotAdmin) {
      return m.reply('❌ *KAYA-MD doit être administrateur pour générer un lien d\'invitation.*');
    }

    try {
      const inviteCode = await kaya.groupInviteCode(m.chat);
      const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

      await kaya.sendMessage(m.chat, {
        text: `╭━━〔 🔗 LIEN DU GROUPE 〕━━⬣
├ 📎 *Lien :* ${groupLink}
╰────────────────────⬣`
      });
    } catch (err) {
      console.error(err);
      return m.reply('❌ *Erreur lors de la génération du lien.*');
    }
  }
};