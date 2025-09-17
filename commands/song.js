// ==================== commands/song.js ====================
import axios from 'axios';
import yts from 'yt-search';
import { contextInfo } from '../utils/contextInfo.js';

const axiosInstance = axios.create({
  timeout: 60000,
  maxRedirects: 5,
  headers: { 'User-Agent': 'Mozilla/5.0' }
});

const KAIZ_API_KEY = 'cf2ca612-296f-45ba-abbc-473f18f991eb';
const KAIZ_API_URL = 'https://kaiz-apis.gleeze.com/api/ytdown-mp3';

async function fetchVideoInfo(text) {
  const isYtUrl = /(youtube\.com|youtu\.be)/i.test(text);
  if (isYtUrl) {
    const videoId = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (!videoId) throw new Error('URL YouTube invalide');
    const info = await yts({ videoId });
    return { url: `https://youtu.be/${videoId}`, info };
  } else {
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) throw new Error('Aucune vidéo trouvée');
    return { url: video.url, info: video };
  }
}

async function fetchAudioData(videoUrl) {
  const res = await axiosInstance.get(`${KAIZ_API_URL}?url=${encodeURIComponent(videoUrl)}&apikey=${KAIZ_API_KEY}`);
  if (!res.data?.download_url) throw new Error('Impossible de récupérer l’audio depuis l’API');
  return res.data;
}

export default {
  name: 'song',
  description: 'Télécharge une chanson depuis YouTube 🎵',
  category: 'Musique',

  run: async (kaya, m, msg, store, args) => {
    const text = args.join(' ');
    if (!text) return kaya.sendMessage(m.chat, { text: '❌ Titre manquant.', contextInfo }, { quoted: m });

    await kaya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });
    await kaya.sendMessage(m.chat, { text: `🔎 Recherche pour : *${text}*`, contextInfo }, { quoted: m });

    try {
      const { url: videoUrl, info: videoInfo } = await fetchVideoInfo(text);
      const audioData = await fetchAudioData(videoUrl);
      if (!audioData.download_url) throw new Error('Audio introuvable');

      const audioRes = await axiosInstance.get(audioData.download_url, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(audioRes.data, 'binary');

      const caption = `╭───〔 🎶 KAYA-MD 〕───╮
│ 📌 Titre : ${audioData.title || videoInfo.title}
│ 😎 Auteur : ${videoInfo.author?.name || 'Unknown'}
│ ⏱️ Durée : ${videoInfo.timestamp || 'N/A'}
│ 👁️ Vues : ${videoInfo.views?.toLocaleString() || 'N/A'}
│ 🔗 URL : ${videoUrl}
╰─────────────────────╯`;

      await kaya.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${audioData.title || videoInfo.title || 'audio'}.mp3`,
        ptt: false,
        caption,
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error('Erreur song:', err);
      return kaya.sendMessage(m.chat, { text: `❌ Impossible de récupérer la chanson.\n${err.message}`, contextInfo }, { quoted: m });
    }
  }
};