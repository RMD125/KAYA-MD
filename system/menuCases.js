const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 122
  }
};

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
├ 🔰 .promote
├ ⛔️ .revoque
├ 🚮 .purge 
├ 🤺 .kick
├ 🧘 .add
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
├ 🔧 .restart
├ 🤖 .chatbot
├ ⚙️ .setting 
├ 🔖 .allkaya 
├ 🎙 .recording on/off
├ 🖋 .typing on/off
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
├ 📂 .tgs
├ 📸 .photo 
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '4': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗠É𝗗𝗜𝗔 𝗠𝗘𝗡𝗨 〕━━⬣
├ 🎵 musique 
├ ▶️ .play
├ 🎞 .tiktok 
├ 📽 .youtube
├ 📰 .img
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '5': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗗𝗜𝗩𝗘𝗥𝗦 𝗠𝗘𝗡𝗨 〕━━⬣
├ ⏰ .alive 
├ 🏓 .ping
├ 📅 .calendar
├ 🔎 .info
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '6': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 📥 𝗧É𝗟É𝗖𝗛𝗔𝗥𝗚𝗘𝗠𝗘𝗡𝗧𝗦 〕━━⬣
├ 🎞️ .ytmp4
├ 🎵 .ytmp3
├ 📁 .mediafire
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '7': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔  𝗜𝗔 & 𝗢𝗨𝗧𝗜𝗟𝗦 〕━━⬣
├ 🤖 .gpt
├ 🧠 .ia
├ 📎 .shortlink
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '8': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 𝗔𝗣𝗣𝗥𝗘𝗡𝗧𝗜𝗦𝗦𝗔𝗚𝗘 〕━━⬣
├ 🧑‍💻 .cours
├ 💻 .python
├ 📘 .tutoriel
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '9': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 𝗥É𝗦𝗘𝗔𝗨𝗫 𝗦𝗢𝗖𝗜𝗔𝗨𝗫 〕━━⬣
├ 📷 .insta
├ 🐦 .twitter
├ 🎐 .fb
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  '10': async (kaya, m) => {
    const allMenus = `
╭━━━〔 𝐓𝐎𝐔𝐒 𝐋𝐄𝐒 𝐌𝐄𝐍𝐔𝐒 - KAYA MD 〕━━⬣

👥 *𝗚𝗥𝗢𝗨𝗣𝗘*
├ .tagall
├ .tag
├ .lock
├ .unlock
├ .link
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
├ .restart
├ .chatbot 
├ .settings
├ .allkaya
├ .recording on
├ .recording off
├ .typing on
├ .typing off
├ .block 
├ .unblock
├ .sudo 
├ .unsudo
├ .sudolist

🖼️ *𝗦𝗧𝗜𝗖𝗞𝗘𝗥𝗦*
├ .sticker
├ .take
├ .tgs
├ .photo

🎧 *𝗠É𝗗𝗜𝗔*
├ .musique 
├ .photo
├ .play
├ .tiktok
├ .youtube
├ .img

🎲 *𝗗𝗜𝗩𝗘𝗥𝗦*
├ .alive
├ .ping
├ .calendar
├🔎info

📥 *𝗧É𝗟É𝗖𝗛𝗔𝗥𝗚𝗘𝗠𝗘𝗡𝗧𝗦*
├ .ytmp4
├ .ytmp3
├ .mediafire

🤖 *𝗜𝗔 & 𝗢𝗨𝗧𝗜𝗟𝗦*
├ .gpt
├ .ia
├ .shortlink

📚 *𝗔𝗣𝗣𝗥𝗘𝗡𝗧𝗜𝗦𝗦𝗔𝗚𝗘*
├ .cours
├ .python
├ .tutoriel

🌐 *𝗥É𝗦𝗘𝗔𝗨𝗫 𝗦𝗢𝗖𝗜𝗔𝗨𝗫*
├ .insta
├ .twitter
├ .fb

╰━━━━━━━━━━━━━━━━━━━━━━⬣`;

    await kaya.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/e3g4cv.jpg' },
      caption: allMenus,
      contextInfo
    }, { quoted: m });
  },

  'default': async (kaya, m) => {
    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').trim();
    if (/^\d+$/.test(text)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Option invalide. Veuillez répondre par un chiffre (1 à 10).',
        contextInfo
      }, { quoted: m });
    }
    return;
  }
};