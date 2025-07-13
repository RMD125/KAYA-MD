const { config } = require('../system/config'); // ✅ Accès correct à config.owner

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 122
  }
};

module.exports = {
  name: 'add',
  description: 'Ajoute un utilisateur dans le groupe (owner uniquement)',
  category: 'Groupe',

  run: async (kaya, m, msg, store, args) => {
    const senderNumber = m.sender.split('@')[0];

    if (!config.owner.includes(senderNumber)) {
      return kaya.sendMessage(m.chat, {
        text: '🚫 Cette commande est réservée au propriétaire du bot.',
        contextInfo
      }, { quoted: m });
    }

    if (!m.isGroup) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Cette commande ne peut être utilisée que dans un groupe.',
        contextInfo
      }, { quoted: m });
    }

    const number = args[0]?.replace(/[^0-9]/g, '');
    if (!number) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Utilisation : *.add numéro*\nExemple : *.add 243970000000*',
        contextInfo
      }, { quoted: m });
    }

    const jid = `${number}@s.whatsapp.net`;

    try {
      await kaya.groupParticipantsUpdate(m.chat, [jid], 'add');

      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const dateStr = now.toLocaleDateString('fr-FR', options);
      const timeStr = now.toLocaleTimeString('fr-FR');

      const message = `
╭━━━━━━〔 KAYA-MD 〕━━━━━⬣
├ 👤 Nouveau membre : @${number}
├ ✅ Ajouté avec succès dans le groupe !
├ 📆 Date : ${dateStr}
├ ⏰ Heure : ${timeStr}
╰━━━━━━━━━━━━━━━━━━━━⬣
`;

      await kaya.sendMessage(m.chat, {
        text: message,
        mentions: [jid],
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      kaya.sendMessage(m.chat, {
        text: '⚠️ Une erreur est survenue lors de l’ajout. Peut-être que l’utilisateur a restreint les ajouts.',
        contextInfo
      }, { quoted: m });
    }
  }
};
