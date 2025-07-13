const axios = require('axios');

module.exports = {
  name: 'tiktok',
  description: 'Télécharge une vidéo TikTok sans watermark à partir d’un lien',
  run: async (kaya, m, msg, store, args) => {
    const url = args[0];
    if (!url || !url.includes('tiktok.com')) {
      return m.reply('❌ Merci de fournir un lien TikTok valide.\nUsage : .tiktok <lien>');
    }

    try {
      await m.reply('⏳ Recherche de la vidéo TikTok...');

      // Appel à l'API tierce (TikTok-scraper alternatif)
      const response = await axios.get('https://api.tikapi.io/api/v1/video/detail', {
        params: { video_url: url },
        headers: {
          'x-rapidapi-host': 'tiktok-scraper.p.rapidapi.com',
          'x-rapidapi-key': 'TA_CLE_API_RAPIDAPI_ICI' // À remplacer par ta clé RapidAPI
        }
      });

      if (!response.data || !response.data.video || !response.data.video.download) {
        return m.reply('❌ Impossible de récupérer la vidéo TikTok.');
      }

      const videoUrl = response.data.video.download.no_watermark || response.data.video.download.watermark;

      // Envoi de la vidéo
      await kaya.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: 'Voici ta vidéo TikTok sans watermark !'
      }, { quoted: m });

    } catch (error) {
      console.error('Erreur commande tiktok:', error.response?.data || error.message);
      return m.reply('❌ Une erreur est survenue lors du téléchargement. Essaie plus tard.');
    }
  }
};