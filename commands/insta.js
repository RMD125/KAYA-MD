// ================= commands/instagram.js =================
const axios = require('axios');
const { contextInfo } = require('../utils/contextInfo'); // ✅ Import centralisé

module.exports = {
  name: 'instagram',
  description: 'Télécharge une image ou vidéo Instagram.',
  category: 'Téléchargement',

  async run(kaya, m, msg, store, args) {
    const query = args[0];
    if (!query || !query.includes("instagram.com")) {
      return kaya.sendMessage(m.chat, {
        text: `╭━━━〔 INSTAGRAM DOWNLOADER 〕━━⬣
┃ ❌ Aucun lien Instagram détecté !
┃ 📌 Utilisation : *.instagram https://www.instagram.com/p/xxx*
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣`,
        contextInfo
      }, { quoted: m });
    }

    try {
      let result;

      // 🔹 API 1 : FGMods
      try {
        const api1 = `https://api.fgmods.xyz/api/downloader/igdl?url=${encodeURIComponent(query)}&apikey=E8sfLg9l`;
        const res1 = await axios.get(api1);

        if (res1.data && res1.data.status && res1.data.result) {
          result = {
            username: res1.data.result.username,
            caption: res1.data.result.caption,
            medias: res1.data.result.url.map(u => ({
              url: u,
              type: res1.data.result.isVideo ? "video" : "image"
            }))
          };
        }
      } catch {
        console.log("❌ FGMods API failed, trying NexOracle...");
      }

      // 🔹 API 2 : NexOracle (fallback)
      if (!result) {
        const api2 = `https://api.nexoracle.com/downloader/aio2?apikey=free_key@maher_apis&url=${encodeURIComponent(query)}`;
        const res2 = await axios.get(api2);

        if (res2.data && res2.data.status === 200 && res2.data.result) {
          result = {
            username: res2.data.result.username || "Inconnu",
            caption: res2.data.result.title || "Non disponible",
            medias: (res2.data.result.medias || []).map(m => ({
              url: m.url || m.high || m.low,
              type: m.type
            }))
          };
        }
      }

      if (!result || !result.medias || result.medias.length === 0) {
        return kaya.sendMessage(m.chat, {
          text: `❌ Impossible de récupérer le post Instagram.\n🔁 Vérifie le lien ou réessaie plus tard.`,
          contextInfo
        }, { quoted: m });
      }

      // 🔹 Envoi des médias
      for (const media of result.medias) {
        if (!media.url) continue;

        const fileRes = await axios.get(media.url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(fileRes.data, 'binary');

        if (media.type === "video") {
          await kaya.sendMessage(m.chat, {
            video: buffer,
            caption: 
`╭━━━〔 🎬 INSTAGRAM VIDÉO 〕━━⬣
👤 *Auteur* : ${result.username}
📝 *Description* : ${result.caption}
   *By* : KAYA-MD
╰━━━━━━━━━━━━━━━━━━━━━━⬣`,
            contextInfo
          }, { quoted: m });
        } else {
          await kaya.sendMessage(m.chat, {
            image: buffer,
            caption: 
`╭━━━〔 🖼 INSTAGRAM IMAGE 〕━━⬣
👤 *Auteur* : ${result.username}
📝 *Description* : ${result.caption}
   *By* : KAYA-MD
╰━━━━━━━━━━━━━━━━━━━━━━⬣`,
            contextInfo
          }, { quoted: m });
        }
      }

    } catch (e) {
      console.error('Erreur Instagram :', e);
      await kaya.sendMessage(m.chat, {
        text: `❌ Une erreur est survenue : ${e.message || "Inconnue"}`,
        contextInfo
      }, { quoted: m });
    }
  }
};