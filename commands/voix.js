const { getAudioUrl } = require('../lib/tts');

module.exports = {
  name: 'voix',
  description: 'Transforme du texte en message vocal',
  category: 'IA',
  
  run: async (kaya, m, msg, store, args) => {
    const text = args.join(' ');
    if (!text) {
      return m.reply('❌ Fournis un texte à convertir en voix.\nExemple : `.voix Bonjour à tous !`');
    }

    try {
      const url = getAudioUrl(text, { lang: 'fr' });
      
      await kaya.sendMessage(m.chat, {
        audio: { url },
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: m });

    } catch (err) {
      console.error('Erreur voix:', err);
      return m.reply('❌ Une erreur est survenue.');
    }
  }
};