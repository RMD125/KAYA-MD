module.exports = {
  name: 'ping',
  description: 'Vérifie la latence et le statut du bot',
  run: async (kaya, m) => {
    const start = Date.now();

    // Message temporaire
    const sentMsg = await kaya.sendMessage(
      m.chat,
      { text: '⏳ Calcul de la latence...' },
      { quoted: m }
    );

    const end = Date.now();
    const latency = end - start;

    const formattedResponse = `
🏓 *PONG !*

✅ Statut : *KAYA-MD* est actif et prêt à vous aider !
⏱️ Latence : *${latency} ms*
⚡ Performance : *Ultra rapide* ⚡
    `.trim();

    // Message final avec ID de ta chaîne
    await kaya.sendMessage(
      m.chat,
      {
        text: formattedResponse,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter', // Ton ID
            newsletterName: "KAYA MD",
            serverMessageId: 143
          }
        }
      },
      { quoted: m }
    );
  }
};