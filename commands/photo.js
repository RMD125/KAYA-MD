const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  name: 'photo',
  description: 'Transforme un sticker en image',
  category: 'Utilitaires',

  run: async (kaya, m) => {
    try {
      const quoted = m.quoted;
      if (!quoted || !quoted.mimetype || !quoted.mimetype.includes('webp')) {
        return kaya.sendMessage(m.chat, {
          text: `╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Sticker non détecté !*
│ 💡 Réponds à un sticker puis tape *.photo*
│ 🖼️ *Convertis un sticker en photo !*
╰──────────────⬣`
        }, { quoted: m });
      }

      const buffer = await quoted.download();
      if (!buffer) {
        return kaya.sendMessage(m.chat, {
          text: `╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Impossible de lire le sticker.*
╰──────────────⬣`
        }, { quoted: m });
      }

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const input = path.join(tempDir, `input_${Date.now()}.webp`);
      const output = path.join(tempDir, `output_${Date.now()}.png`);

      fs.writeFileSync(input, buffer);

      const cmd = `ffmpeg -i ${input} ${output}`;

      exec(cmd, async (err) => {
        if (err) {
          return kaya.sendMessage(m.chat, {
            text: `╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Erreur de conversion.*
╰──────────────⬣`
          }, { quoted: m });
        }

        const image = fs.readFileSync(output);
        await kaya.sendMessage(m.chat, { image }, { quoted: m });

        fs.unlinkSync(input);
        fs.unlinkSync(output);
      });

    } catch (err) {
      return kaya.sendMessage(m.chat, {
        text: `╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Erreur inattendue.*
╰──────────────⬣`
      }, { quoted: m });
    }
  }
};