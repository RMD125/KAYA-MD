const config = require('../system/config');

const newsletterInfo = {
  newsletterJid: '120363402565816662@newsletter',
  newsletterName: 'KAYA MD',
  serverMessageId: 125
};

module.exports = {
  name: 'sudolist',
  description: '📋 Affiche la liste des owners actuels',
  category: 'owner',

  run: async (kaya, m) => {
    if (!config.owner.includes(m.sender.split('@')[0])) {
      return kaya.sendMessage(
        m.chat,
        {
          text: '🚫 *Commande réservée aux owners.*',
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: newsletterInfo
          }
        },
        { quoted: m }
      );
    }

    const ownerList = config.owner
      .map((id, i) => `*${i + 1}. wa.me/${id}*`)
      .join('\n');

    return kaya.sendMessage(
      m.chat,
      {
        text: `╭━━〔 👑 LISTE DES OWNERS 〕━━⬣\n${ownerList}\n╰────────────────────⬣`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: newsletterInfo
        }
      },
      { quoted: m }
    );
  }
};