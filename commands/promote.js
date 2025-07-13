module.exports = {  
  name: 'promote',  
  description: 'Nomme un membre administrateur du groupe (mention ou réponse)',  
  
  run: async (kaya, m, msg, store, args) => {  
    if (!m.isGroup) {  
      return m.reply('❌ Cette commande fonctionne uniquement dans les groupes.');  
    }  
  
    const metadata = await kaya.groupMetadata(m.chat);  
    const participants = metadata.participants;  
  
    const senderId = m.sender;  
    const botId = kaya.user.id.includes(':')  
      ? kaya.user.id.split(':')[0] + '@s.whatsapp.net'  
      : kaya.user.id;  
  
    const isSenderAdmin = participants.find(p => p.id === senderId)?.admin;  
    const isBotAdmin = participants.find(p => p.id === botId)?.admin;  
  
    if (!isSenderAdmin) {  
      return m.reply('🚫 Tu dois être *admin* pour utiliser cette commande.');  
    }  
  
    if (!isBotAdmin) {  
      return m.reply('❌ Le bot doit être *admin* dans le groupe.');  
    }  
  
    const mentioned = m.mentionedJid?.[0];  
    const quoted = m.quoted?.sender;  
    const target = mentioned || quoted;  
  
    if (!target) {  
      return m.reply('❗ Utilise `.promote @user` ou réponds à un message.');  
    }  
  
    if (target === botId) {  
      return m.reply('❌ Je ne peux pas me promouvoir moi-même.');  
    }  
  
    try {  
      await kaya.groupParticipantsUpdate(m.chat, [target], 'promote');  
  
      const username = '@' + target.split('@')[0];  
      const msgText = `╭━━〔  KAYA-MD 〕━━⬣  
├ ✅ *PROMOTION D’UN MEMBRE*  
├ 📛 Utilisateur : ${username}  
├ 📢 Statut : *ADMINISTRATEUR*  
├ 🔐 Nomination réussie  
╰────────────────────⬣`;  
  
      await kaya.sendMessage(m.chat, {  
        text: msgText,  
        mentions: [target],  
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter', // Remplace par ton ID de chaîne
            newsletterName: 'KAYA MD',
            serverMessageId: 143
          }
        }
      });  
  
    } catch (err) {  
      console.error('Erreur promote :', err);  
      m.reply('❌ Impossible de promouvoir cet utilisateur.');  
    }  
  }  
};