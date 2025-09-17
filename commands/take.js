// ==================== commands/take.js ====================
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { contextInfo } from '../utils/contextInfo.js';

// Util: convertir stream -> buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default {
  name: 'take',
  description: 'Reprend un sticker/image/vidéo et met l’auteur = pseudo de la personne',
  category: 'Stickers',

  run: async (kaya, m, msg, store, args) => {
    try {
      const authorName = m.pushName || "User";

      // Vérifie qu’il y a une réponse
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const current = m.message;
      const targetMsg = quoted || current;

      if (!targetMsg) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Réponds à un sticker/image/vidéo avec `.take`', contextInfo },
          { quoted: m }
        );
      }

      // Détecte type
      const type = Object.keys(targetMsg)[0];
      const node = targetMsg[type];

      if (!['stickerMessage', 'imageMessage', 'videoMessage'].includes(type)) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Réponds à un sticker/image/vidéo valide.', contextInfo },
          { quoted: m }
        );
      }

      // Télécharge le média
      let kind = "sticker";
      if (type === 'imageMessage') kind = "image";
      if (type === 'videoMessage') kind = "video";

      const stream = await downloadContentFromMessage(node, kind);
      const buffer = await streamToBuffer(stream);

      if (!buffer || buffer.length < 100) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Impossible de lire ce média.', contextInfo },
          { quoted: m }
        );
      }

      // Crée le sticker (sans packname, author = pseudo)
      const sticker = new Sticker(buffer, {
        author: authorName,        // pseudo de la personne
        type: StickerTypes.FULL,   // taille pleine
        quality: 70
      });

      const webp = await sticker.build();

      // Envoie le sticker
      await kaya.sendMessage(m.chat, { sticker: webp }, { quoted: m });

    } catch (err) {
      console.error("Take error:", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Erreur lors de la création du sticker.", contextInfo },
        { quoted: m }
      );
    }
  }
};