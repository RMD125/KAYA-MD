module.exports = {
  name: 'info',
  description: 'Affiche les informations du développeur du bot Kaya-MD',
  run: async (kaya, m) => {

    const ownerText = `
╭━━〔 👑 𝙋𝙍𝙊𝙋𝙍𝙄É𝙏𝘼𝙄𝙍𝙀 〕━━⬣
┃ 🤖 *Bot* : KAYA MD
┃ 🌍 *Pays* : 🇨🇩 RDC
┃ 🧠 *Créateur* : 𝗞𝗔𝗬𝗔
┃ 📆 *Bot actif depuis* : 2025
╰━━━━━━━━━━━━━━━━━━━━⬣

╭─〔 🔗 𝙇𝙄𝙀𝙉𝙎 𝙐𝙏𝙄𝙇𝙀𝙎 〕─⬣
┃ 💬 *WhatsApp* :
┃ wa.me/243993621718
┃
┃ 📺 *Chaîne YouTube* :
┃https://youtube.com/@KAYATECH243
┃
┃ 🧑‍💻 *GitHub* :
┃ https://github.com/Kaya2005/KAYA-MD
┃
┃ ✈️ *Canal Telegram* :
┃ https://t.me/techword1
╰━━━━━━━━━━━━━━━━━━━━⬣
╭══════❖ MERCI ❖══════╮
┃      Merci d'utiliser  
┃       *KAYA-MD* !
╰════════════════════╯
    `.trim();

    await kaya.sendMessage(m.chat, {
      text: ownerText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363402565816662@newsletter', // remplace par ton propre ID de chaîne
          newsletterName: 'KAYA MD',
          serverMessageId: 143
        }
      }
    }, { quoted: m });
  }
};