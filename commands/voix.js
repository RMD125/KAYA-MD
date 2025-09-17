// ==================== commands/voix.js ====================
import { getAudioUrl } from '../lib/tts.js';
import { contextInfo } from '../utils/contextInfo.js'; // import centralisé

export default {
  name: 'voix',
  description: 'Transforme du texte en message vocal',
  category: 'IA',

  run: async (kaya, m, msg, store, args) => {
    const text = args.join(' ');
    if (!text) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Fournis un texte à convertir en voix.\nExemple : `.voix Bonjour à tous !`', contextInfo },
        { quoted: m }
      );
    }

    try {
      // Obtenir l'URL audio
      const url = await getAudioUrl(text, { lang: 'fr' });
      if (!url) throw new Error('URL audio invalide');

      await kaya.sendMessage(
        m.chat,
        {
          audio: { url },
          mimetype: 'audio/mpeg', // mp4 ou mpeg selon ton API
          ptt: true,
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('Erreur voix :', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ Une erreur est survenue lors de la génération de la voix.', contextInfo },
        { quoted: m }
      );
    }
  }
};