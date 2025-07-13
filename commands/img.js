const axios = require('axios');

const UNSPLASH_ACCESS_KEY = 'm06j8BhneE6Gb-6T9DaxEWC4Kk8qXI6CRRGSXqwYBkg';

module.exports = {
  name: 'img',
  description: 'Recherche une image sur Unsplash',
  category: 'Recherche',

  run: async (kaya, m, msg, store, args) => {
    const query = args.join(' ');
    if (!query) {
      return kaya.sendMessage(m.chat, {
        text:
`╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Mot-clé manquant !*
│ 💡 Exemple : *.img naruto*
╰──────────────⬣`
      }, { quoted: m });
    }

    try {
      const res = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, per_page: 10 },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
      });

      const results = res.data.results;
      if (!results.length) {
        return kaya.sendMessage(m.chat, {
          text:
`╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Aucune image trouvée !*
│ 💡 Essaie un autre mot-clé.
╰──────────────⬣`
        }, { quoted: m });
      }

      const image = results[Math.floor(Math.random() * results.length)].urls.small;

      await kaya.sendMessage(m.chat, {
        image: { url: image },
        caption: `🔎 *Résultat pour :* ${query}\n\n_by KAYA-MD_`
      }, { quoted: m });

    } catch (err) {
      console.error('❌ Erreur Unsplash:', err);
      return kaya.sendMessage(m.chat, {
        text:
`╭─「 🤖 *KAYA-MD* 」─⬣
│ ❌ *Erreur lors de la recherche.*
│ 💡 Essaie de nouveau plus tard.
╰──────────────⬣`
      }, { quoted: m });
    }
  }
};