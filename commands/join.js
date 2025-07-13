const config = require('../system/config');

module.exports = {
  name: 'join',
  description: 'Le bot rejoint un groupe via un lien (owner uniquement)',
  category: 'owner',

  run: async (kaya, m, msg, store, args) => {
    const sender = m.sender.split('@')[0];
    if (!config.owner.includes(sender)) {
      return m.reply('🚫 *Commande réservée au propriétaire du bot.*');
    }

    const replyText =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || '';

    const link = replyText || args[0];
    if (!link || !link.includes('whatsapp.com/invite/')) {
      return kaya.sendMessage(m.chat, {
        text: `╭━━〔 ❗ UTILISATION KAYA-MD 〕━━⬣
├ Réponds à un message contenant un lien d'invitation,
├ ou utilise : *.join https://chat.whatsapp.com/ABC123*
╰────────────────────⬣`,
        quoted: m
      });
    }

    const code = link.split('whatsapp.com/invite/')[1].trim().replace(/[^a-zA-Z0-9]/g, '');

    try {
      await kaya.groupAcceptInvite(code);
      await kaya.sendMessage(m.chat, {
        text: `╭━━〔 ✅ KAYA-MD 〕━━⬣
├ 🤖 Groupe rejoint avec succès !
╰────────────────────⬣`,
        quoted: m
      });
    } catch (e) {
      console.error('Erreur JOIN :', e);
      await kaya.sendMessage(m.chat, {
        text: `╭━━〔 ❌ ERREUR 〕━━⬣
├ ❗ Impossible de rejoindre ce groupe.
├ Vérifie si le lien est valide ou déjà utilisé.
╰────────────────────⬣`,
        quoted: m
      });
    }
  }
};