module.exports = {
  name: 'unlock',
  description: 'Ouvre le groupe (tout le monde peut écrire).',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    const contextInfo = {
      mentionedJid: [m.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 143
      }
    };

    try {
      await kaya.groupSettingUpdate(m.chat, 'not_announcement');

      const text = `
╭━━〔🔓𝗚𝗥𝗢𝗨𝗣𝗘 𝗢𝗨𝗩𝗘𝗥𝗧 ━━⬣
┃ ✨ Les *membres* peuvent de nouveau écrire.
┃ 📌 N'oublie pas de le refermer si besoin avec *.lock*
╰━━━━━━━━━━━━━━━━━━━━⬣
      `.trim();

      await kaya.sendMessage(m.chat, {
        text,
        mentions: [m.sender],
        contextInfo
      }, { quoted: m });
    } catch (e) {
      await kaya.sendMessage(m.chat, {
        text: '❌ Impossible d’ouvrir le groupe. Vérifie que je suis admin.',
        contextInfo
      }, { quoted: m });
    }
  }
};