const { contextInfo } = require('../utils/contextInfo'); // <-- import centralisé

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

    // Message final avec contextInfo centralisé
    await kaya.sendMessage(
      m.chat,
      {
        text: formattedResponse,
        contextInfo: {
          ...contextInfo,
          mentionedJid: [m.sender]
        }
      },
      { quoted: m }
    );
  }
};