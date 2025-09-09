const { contextInfo } = require('../utils/contextInfo'); // centralisé

module.exports = {
  '1': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗠𝗘𝗡𝗨 𝗚𝗥𝗢𝗨𝗣𝗘 〕━━⬣
├ 👥 .tagall
├ 👤 .tag
├ 🔒 .lock
├ 🔓 .unlock
├ 🔗 .link
├ ⛓️ .antilink on/off  
├ 📵  .antispam on/off
├ 🔰 .promote
├ ⛔️ .revoque
├ 🚮 .purge 
├ 🤺 .kick
├ 🧘 .add
├ 🗑 .delete ou del
├ ⚠️ .antipromote on/off
├ 🚷 .antirevoque on/off
├ 🙌 .welcome on
├ 👋 .bye on 
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '2': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗠𝗘𝗡𝗨 𝗢𝗪𝗡𝗘𝗥 〕━━⬣
├ 👑 .owner
├ ⚙️ .setting 
├ 🎙 .recording on/off
├ 🖋 .typing on/off
├ 📵  .blockinbox
├ 🚫 .block 
├ ✅ .unblock
├ 👑 .sudo
├ 🗑 .unsudo
├ 📋 .sudolist
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '3': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗦𝗧𝗜𝗖𝗞𝗘𝗥𝗦 𝗠𝗘𝗡𝗨 〕━━⬣
├ 🖼️ .sticker
├ ✍️ .take 
├ 📸 .photo 
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '4': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗗𝗜𝗩𝗘𝗥𝗦 𝗠𝗘𝗡𝗨 〕━━⬣
├ ⏰ .alive 
├ 🏓 .ping
├ 📅 .calendrier 
├ 🔎 .info
├ 💡.repo
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '5': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 📥 𝗧É𝗟É𝗖𝗛𝗔𝗥𝗚𝗘𝗠𝗘𝗡𝗧𝗦 〕━━⬣
├ 🎵 .song 
├ ▶️ .play
├ 🎞 .tiktok 
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '6': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗜𝗔 & 𝗢𝗨𝗧𝗜𝗟𝗦 〕━━⬣
├ 🤖 . ai
├ 🎤.voix
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '7': async (kaya, m) => {
    const allMenus = `
╭━━━〔 𝐓𝐎𝐔𝐒 𝐋𝐄𝐒 𝐌𝐄𝐍𝐔𝐒 〕━━⬣

👥 *𝗚𝗥𝗢𝗨𝗣𝗘*
├ .tagall
├ .tag
├ .lock
├ .unlock
├ .link
├ .delete ou del
├ .antilink on
├ .antilink off
├ .promote
├ .revoque
├ .antipromote on/off
├ .antirevoque on/off
├ .welcome on 
├ .bye on
├ .purge
├ .kick 
├ .add
👑 *𝗢𝗪𝗡𝗘𝗥*
├ .owner
├ .settings
├ .recording on
├ .recording off
├ .typing on
├ .typing off
├ .blockinbox 
├ .block 
├ .unblock
├ .sudo 
├ .unsudo
├ .sudolist

🖼️ *𝗦𝗧𝗜𝗖𝗞𝗘𝗥𝗦*
├ .sticker
├ .take
├ .photo

🎲 *𝗗𝗜𝗩𝗘𝗥𝗦*
├ .alive
├ .ping
├ calendrier 
├ .info
├ .repo

📥 *𝗧É𝗟É𝗖𝗛𝗔𝗥𝗚𝗘𝗠𝗘𝗡𝗧𝗦*
├ .song
├ .play
├ .tiktok

🤖 *𝗜𝗔 & 𝗢𝗨𝗧𝗜𝗟𝗦*
├ .ai
├ .voix

╰━━━━━━━━━━━━━━━━━━━━━━⬣`;

    await kaya.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/k06gcy.jpg' },
      caption: allMenus,
      contextInfo
    }, { quoted: m });
  },

  'default': async (kaya, m) => {
    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').trim();
    if (/^\d+$/.test(text)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Option invalide. Veuillez répondre par un chiffre (1 à 7).',
        contextInfo
      }, { quoted: m });
    }
    return;
  }
};