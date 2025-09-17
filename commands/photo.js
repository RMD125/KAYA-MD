// ================= commands/photo.js =================
import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { contextInfo } from '../utils/contextInfo.js'; // import centralisé

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export const name = 'photo';
export const description = 'Convertit un sticker en image PNG';
export const category = 'Stickers';

export async function run(kaya, m, msg, store, args) {
  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const targetMsg = quoted || m.message;

    if (!targetMsg) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Réponds à un sticker avec `.photo`', contextInfo },
        { quoted: m }
      );
    }

    const type = Object.keys(targetMsg)[0];
    if (!type.includes('stickerMessage')) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Ce message n’est pas un sticker.', contextInfo },
        { quoted: m }
      );
    }

    const stream = await downloadContentFromMessage(targetMsg[type], 'sticker');
    const buffer = await streamToBuffer(stream);

    if (!buffer || buffer.length < 100) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Impossible de lire ce sticker.', contextInfo },
        { quoted: m }
      );
    }

    const outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.png`);
    await sharp(buffer).png().toFile(outputPath);

    await kaya.sendMessage(
      m.chat,
      {
        image: fs.readFileSync(outputPath),
        caption: '✅ Sticker converti en image PNG',
        contextInfo
      },
      { quoted: m }
    );

    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error('Sticker to photo error:', err);
    return kaya.sendMessage(
      m.chat,
      { text: '❌ Une erreur est survenue lors de la conversion.', contextInfo },
      { quoted: m }
    );
  }
}