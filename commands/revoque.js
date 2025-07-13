module.exports = {
  name: 'revoque',
  description: 'Retire un membre des administrateurs du groupe (mention ou réponse)',
  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) {
      return m.reply('❌ Cette commande fonctionne uniquement dans les groupes.');
    }

    const groupMetadata = await kaya.groupMetadata(m.chat);
    const participants = groupMetadata.participants;
    const senderId = m.sender;
    const botId = kaya.user.id.split(':')[0] + '@s.whatsapp.net';

    const isSenderAdmin = participants.find(p => p.id === senderId)?.admin;
    const isBotAdmin = participants.find(p => p.id === botId)?.admin;

    if (!isSenderAdmin) {
      return m.reply('🚫 Tu dois être *admin* pour utiliser cette commande.');
    }

    if (!isBotAdmin) {
      return m.reply('❌ Le bot doit être *admin* dans le groupe.');
    }

    // Cible : mention ou réponse
    const mentionedJid = m.mentionedJid?.[0];
    const quotedJid = m.quoted?.sender;
    const target = mentionedJid || quotedJid;

    if (!target) {
      return m.reply('❗ Utilisation : .revoque @user ou en répondant à son message.');
    }

    try {
      await kaya.groupParticipantsUpdate(m.chat, [target], 'demote');
      m.reply(`✅ L'utilisateur a été *révoqué* des administrateurs.`);
    } catch (error) {
      console.error(error);
      m.reply('❌ Erreur : impossible de révoquer cet utilisateur.');
    }
  }
};