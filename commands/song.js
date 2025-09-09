const axios = require('axios');
const yts = require('yt-search');
const { contextInfo } = require('../utils/contextInfo'); // import centralisé

const axiosInstance = axios.create({
    timeout: 60000, // 60 secondes
    maxRedirects: 5,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
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
    if (!res.data?.download_url) throw new Error('Impossible de récupérer l’audio depuis l’API (URL manquante)');
    return res.data;
}

module.exports = {
    name: 'song',
    description: 'Télécharge une chanson depuis YouTube 🎵',
    category: 'Musique',

    run: async (kaya, m, msg, store, args) => {
        const text = args.join(' ');
        if (!text) {
            return kaya.sendMessage(m.chat, {
                text: `╭──〔 🎼 𝐑𝐄𝐐𝐔𝐄̂𝐓𝐄 𝐒𝐎𝐍𝐆 〕──╮\n│ ❌ Titre manquant.\n│ 💡 Exemple : .song Stromae Santé\n╰──────────────────────────╯`,
                contextInfo
            }, { quoted: m });
        }

        await kaya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });
        await kaya.sendMessage(m.chat, { text: `🔎 Recherche en cours pour : *${text}*`, contextInfo }, { quoted: m });

        try {
            const { url: videoUrl, info: videoInfo } = await fetchVideoInfo(text);

            const audioData = await fetchAudioData(videoUrl);
            if (!audioData.download_url) throw new Error('URL audio vide renvoyée par l’API');

            // Téléchargement du fichier audio
            let audioRes;
            try {
                audioRes = await axiosInstance.get(audioData.download_url, { responseType: 'arraybuffer' });
            } catch (e) {
                throw new Error('Erreur lors du téléchargement de l’audio depuis l’API');
            }

            if (!audioRes.data) throw new Error('Audio introuvable ou vide');

            const audioBuffer = Buffer.from(audioRes.data, 'binary');

            const caption = `╭───〔 🎶 𝗞𝗔𝗬𝗔-𝗠𝗗 〕───╮
│ 📌 Titre   : ${audioData.title || videoInfo.title}
│ 😎 Auteur  : ${videoInfo.author?.name || 'Unknown'}
│ ⏱️ Durée   : ${videoInfo.timestamp || 'N/A'}
│ 👁️ Vues    : ${videoInfo.views?.toLocaleString() || 'N/A'}
│ 🔗 URL     : ${videoUrl}
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
            console.error('Erreur commande song:', err);
            return kaya.sendMessage(m.chat, {
                text: `❌ Impossible de récupérer la chanson.\n${err.message}`,
                contextInfo
            }, { quoted: m });
        }
    }
};