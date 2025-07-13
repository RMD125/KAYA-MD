const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  name: 'sticker',
  description: 'Transforme une image ou une vidéo courte en sticker',
  category: 'Utilitaires',

  run: async (kaya, m, msg, store, args) => {
    try {
      const quoted = m.quoted;
      if (!quoted) {
        return kaya.sendMessage(m.chat, {
          text:
`╭─「 🤖 *KAYA-MD* 」─⬣
│ 🖼️ *Aucun média détecté !*
│ 📌 *Utilisation correcte :*
│ Réponds à une image ou une vidéo courte
│ puis tape la commande *.sticker*
╰──────────────⬣`
        }, { quoted: m });
      }

      const mime = quoted.mimetype || '';
      if (!/^image|video/.test(mime)) {
        return kaya.sendMessage(m.chat, {
          text:
`╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Le média n'est pas valide !*
│ 📌 *Utilise une image ou une vidéo courte.*
╰──────────────⬣`
        }, { quoted: m });
      }

      const buffer = await quoted.download();
      if (!buffer) {
        return kaya.sendMessage(m.chat, {
          text:
`❌ Erreur : impossible de lire le média.
📌 Vérifie que le fichier n’est pas corrompu.`
        }, { quoted: m });
      }

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const isVideo = mime.includes('video');
      const inputFile = path.join(tempDir, `input_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`);
      const outputFile = path.join(tempDir, `output_${Date.now()}.webp`);

      fs.writeFileSync(inputFile, buffer);

      const cmd = isVideo
        ? `ffmpeg -i ${inputFile} -vcodec libwebp -filter:v "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -lossless 0 -qscale 70 -preset default -an -vsync 0 -loop 0 -t 8 ${outputFile}`
        : `ffmpeg -i ${inputFile} -vcodec libwebp -filter:v "scale=512:512:force_original_aspect_ratio=decrease" -lossless 1 -qscale 80 -preset default -an -vsync 0 ${outputFile}`;

      exec(cmd, async (err) => {
        if (err) {
          console.error('❌ Erreur de conversion :', err);
          return kaya.sendMessage(m.chat, {
            text: `❌ ffmpeg a échoué : ${err.message}`
          }, { quoted: m });
        }

        const sticker = fs.readFileSync(outputFile);
        await kaya.sendMessage(m.chat, {
          sticker
        }, {
          quoted: m
        });

        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
      });

    } catch (err) {
      console.error('❌ Erreur générale :', err);
      return kaya.sendMessage(m.chat, {
        text: `❌ Une erreur est survenue : ${err.message}`
      }, { quoted: m });
    }
  }
};