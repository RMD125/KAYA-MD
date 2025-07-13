const config = require('../system/config');

module.exports = {
  name: 'kick',
  description: 'Expulse un membre du groupe en répondant à son message',
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
      return m.reply('❌ *KAYA-MD doit être administrateur pour pouvoir expulser un membre.*');
    }

    if (!m.quoted) {
      return m.reply('❗ *Réponds au message de la personne que tu veux expulser.*');
    }

    const target = m.quoted.sender;
    if (target === m.sender) {
      return m.reply('🙄 *Tu veux t’expulser toi-même ?*');
    }

    if (target === botId) {
      return m.reply('😑 *Je ne vais pas m’expulser moi-même hein.*');
    }

    const isTargetAdmin = metadata.participants.find(p => p.id === target)?.admin;
    if (isTargetAdmin && !isOwner) {
      return m.reply('🛑 *Impossible d’expulser un admin, sauf si tu es le propriétaire du bot.*');
    }

    // Expulsion
    await kaya.groupParticipantsUpdate(m.chat, [target], 'remove').then(() => {
      kaya.sendMessage(m.chat, {
        text: `╭━━〔 ☠️ EXPULSION KAYA-MD 〕━━⬣
├ 👤 Cible : @${target.split('@')[0]}
├ ✅ Statut : *EXPULSÉ AVEC SUCCÈS*
├ 🧹 Motif : *Commande .kick exécutée*
╰────────────────────────⬣`,
        mentions: [target]
      });
    }).catch(err => {
      console.error(err);
      m.reply('❌ *Erreur lors de l’expulsion. Peut-être un droit manquant ou une erreur technique.*');
    });
  }
};