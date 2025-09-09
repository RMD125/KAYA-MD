const axios = require('axios');
const yts = require('yt-search');
const { contextInfo } = require('../utils/contextInfo');

const axiosInstance = axios.create({
    timeout: 60000,
    maxRedirects: 5,
    headers: { 'User-Agent': 'Mozilla/5.0' }
});

// Liste des APIs pour télécharger l'audio
const APIs = [
    { url: 'https://kaiz-apis.gleeze.com/api/ytdown-mp3', key: 'cf2ca612-296f-45ba-abbc-473f18f991eb' },
    { url: 'https://another-ytdl-service.com/api/mp3', key: 'YOUR_OTHER_API_KEY' }
];

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
    for (const api of APIs) {
        try {
            const res = await axiosInstance.get(`${api.url}?url=${encodeURIComponent(videoUrl)}&apikey=${api.key}`);
            if (res.data?.download_url) return res.data;
        } catch (e) {
            console.warn(`⚠️ API échouée: ${api.url}, erreur: ${e.message}`);
            continue; // passer à l'API suivante
        }
    }
    throw new Error('Toutes les APIs ont échoué à récupérer l’audio');
}

async function downloadAudio(url) {
    try {
        const res = await axiosInstance.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://kaiz-apis.gleeze.com/'
            }
        });
        if (!res.data) throw new Error('Audio vide reçu depuis le serveur');
        return Buffer.from(res.data, 'binary');
    } catch (err) {
        throw new Error(`Erreur lors du téléchargement de l’audio depuis l’API: ${err.message}`);
    }
}

module.exports = {
    name: 'play',
    description: 'Télécharge une chanson depuis YouTube 🎵',
    category: 'Musique',

    run: async (kaya, m, msg, store, args) => {
        const text = args.join(' ');
        if (!text) {
            return kaya.sendMessage(m.chat, {
                text: `❌ Titre manquant.\n💡 Exemple : .song Stromae Santé`,
                contextInfo
            }, { quoted: m });
        }

        await kaya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });
        await kaya.sendMessage(m.chat, { text: `🔎 Recherche en cours pour : *${text}*`, contextInfo }, { quoted: m });

        try {
            const { url: videoUrl, info: videoInfo } = await fetchVideoInfo(text);
            const audioData = await fetchAudioData(videoUrl);

            console.log(`✅ URL audio trouvée: ${audioData.download_url}`);

            const audioBuffer = await downloadAudio(audioData.download_url);

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
            console.error('❌ Erreur commande song:', err);
            return kaya.sendMessage(m.chat, {
                text: `❌ Impossible de récupérer la chanson.\n${err.message}`,
                contextInfo
            }, { quoted: m });
        }
    }
};