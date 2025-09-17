// ================= commands/info.js =================
import { contextInfo } from '../utils/contextInfo.js'; // ✅ Import centralisé

export const name = 'info';
export const description = 'Affiche les informations du développeur du bot Kaya-MD';

export async function run(kaya, m) {
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
┃ https://youtube.com/@KAYATECH243
┃
┃ 🧑‍💻 *GitHub* :
┃ https://github.com/Kaya2005/KAYA-MD
┃
┃ ✈️ *Canal Telegram* :
┃ https://t.me/techword1
╰━━━━━━━━━━━━━━━━━━━━⬣
  `.trim();

  await kaya.sendMessage(
    m.chat,
    { text: ownerText, contextInfo }, // ✅ contextInfo unique
    { quoted: m }
  );
}