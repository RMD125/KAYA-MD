const axios = require('axios');
const config = require('../system/config');
module.exports = {
  name: 'ai',
  description: 'Interroge une IA avec ChatGPT',
  category: 'IA',

  run: async (kaya, m, msg, store, args) => {
    const prompt = args.join(' ');
    if (!prompt) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Donne-moi une question après `.ai`\n\n📌 *Exemple :* `.ai Quelle est la capitale du Japon ?`'
      }, { quoted: m });
    }

    // Fonction IA via OpenAI
    async function askOpenAI(prompt) {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Tu es un assistant intelligent nommé Kaya-MD.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`
        }
      });
      return response.data.choices[0].message.content.trim();
    }

    // Fonction IA de secours (gratuite)
    async function askBackupAPI(prompt) {
      const response = await axios.post('https://stablediffusion.fr/gpt3/predict', {
        prompt
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://stablediffusion.fr/chatgpt3',
          'Origin': 'https://stablediffusion.fr',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      return response.data.message || "Réponse non disponible.";
    }

    try {
      let result;
      try {
        result = await askOpenAI(prompt);
      } catch (openaiErr) {
        console.warn('[⚠️ OpenAI échoué] => Utilisation de l’API de secours');
        result = await askBackupAPI(prompt);
      }

      await kaya.sendMessage(m.chat, { text: result }, { quoted: m });
      
    } catch (err) {
      console.error('Erreur IA:', err);
      await kaya.sendMessage(m.chat, {
        text: `❌ Erreur lors de la communication avec l'IA.\n\n📌 *Détails techniques :*\n\`\`\`${err.message}\`\`\``
      }, { quoted: m });
    }
  }
};