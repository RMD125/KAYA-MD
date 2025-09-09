const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Util: stream -> buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  name: 'vv',
  description: 'Convertit une photo vue unique en photo normale',
  category: 'Utils',

  run: async (kaya, m) => {
    try {
      // 🔹 Récupère le message reply
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const current = m.message;
      let targetMsg = quoted || current;

      if (!targetMsg) {
        return kaya.sendMessage(
          m.chat,
          { text: '⚠️ Réponds à une *photo vue unique* avec `.vv`' },
          { quoted: m }
        );
      }

      // 🔹 Détection viewOnce (multi-versions)
      if (targetMsg.viewOnceMessageV2) {
        targetMsg = targetMsg.viewOnceMessageV2.message;
      } else if (targetMsg.viewOnceMessageV2Extension) {
        targetMsg = targetMsg.viewOnceMessageV2Extension.message;
      } else if (targetMsg.viewOnceMessage) {
        targetMsg = targetMsg.viewOnceMessage.message;
      }

      // 🔹 Vérifie si c'est bien une image
      if (!targetMsg.imageMessage) {
        return kaya.sendMessage(
          m.chat,
          { text: '⚠️ Ce n’est pas une *photo vue unique* valide.' },
          { quoted: m }
        );
      }

      const node = targetMsg.imageMessage;

      // 🔹 Télécharge en buffer
      const stream = await downloadContentFromMessage(node, 'image');
      const buffer = await streamToBuffer(stream);

      if (!buffer || buffer.length < 100) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Impossible de lire cette image.' },
          { quoted: m }
        );
      }

      // 🔹 Récupère le caption si existant
      const caption = node.caption || '✅ Photo convertie en normale.';

      // 🔹 Envoie comme photo normale
      await kaya.sendMessage(
        m.chat,
        { image: buffer, caption },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ Erreur commande vv:', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ Erreur lors de la conversion de la photo.' },
        { quoted: m }
      );
    }
  }
};