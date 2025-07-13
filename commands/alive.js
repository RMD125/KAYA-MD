module.exports = {
  name: 'alive',
  description: 'Montre que le bot est en ligne',
  category: 'Info',

  run: async (kaya, m) => {
    const uptime = process.uptime(); // en secondes
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const message = `╭─「 𝗞𝗔𝗬𝗔-𝗠𝗗 」─⬣
│ ✅ *J'suis 𝗞𝗔𝗬𝗔-𝗠𝗗*
│ ⏱️ *Et j'suis en vie depuis :* ${hours}h ${minutes}m ${seconds}s
╰───────────────⬣`;

    await kaya.sendMessage(
      m.chat,
      {
        text: message,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter',
            newsletterName: 'KAYA MD',
            serverMessageId: 143
          }
        }
      },
      { quoted: m }
    );
  }
};