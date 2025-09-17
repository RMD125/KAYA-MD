// ==================== commands/sticker.js ====================
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { contextInfo } from '../utils/contextInfo.js';

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default {
  name: 'sticker',
  description: 'Convertit une image (ou courte vidéo) en sticker avec author = pseudo by KAYA-MD',
  category: 'Stickers',

  run: async (kaya, m, msg, store, args) => {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const current = m.message;
      const targetMsg = quoted || current;

      if (!targetMsg) {
        return kaya.sendMessage(m.chat, { text: '❌ Réponds à une image/vidéo ou envoie-en une avec `.sticker`', contextInfo }, { quoted: m });
      }

      const type = Object.keys(targetMsg)[0];
      const node = targetMsg[type];

      if (!['imageMessage', 'videoMessage'].includes(type)) {
        return kaya.sendMessage(m.chat, { text: '❌ Réponds à une image/vidéo (JPEG/PNG ou vidéo courte).', contextInfo }, { quoted: m });
      }

      if (type === 'videoMessage') {
        const seconds = node.seconds || node.videoMessage?.seconds || 0;
        if (seconds > 8) {
          return kaya.sendMessage(m.chat, { text: '⏱️ La vidéo est trop longue. Max 8 secondes pour un sticker.', contextInfo }, { quoted: m });
        }
      }

      const kind = type === 'imageMessage' ? 'image' : 'video';
      const stream = await downloadContentFromMessage(node, kind);
      const buffer = await streamToBuffer(stream);

      if (!buffer || buffer.length < 100) {
        return kaya.sendMessage(m.chat, { text: '❌ Impossible de lire ce média. Réessaie avec une image/vidéo différente.', contextInfo }, { quoted: m });
      }

      const pseudo = m.pushName || 'User';
      const sticker = new Sticker(buffer, {
        author: `${pseudo} by KAYA-MD`,
        type: StickerTypes.FULL,
        quality: 80
      });

      const webp = await sticker.build();
      await kaya.sendMessage(m.chat, { sticker: webp }, { quoted: m });

    } catch (err) {
      console.error('Sticker error:', err);
      if (String(err?.message || err).toLowerCase().includes('ffmpeg')) {
        return kaya.sendMessage(m.chat, { text: '❌ ffmpeg est requis pour les stickers vidéo. Installe-le puis réessaie.', contextInfo }, { quoted: m });
      }
      return kaya.sendMessage(m.chat, { text: '❌ Erreur lors de la création du sticker.', contextInfo }, { quoted: m });
    }
  }
};