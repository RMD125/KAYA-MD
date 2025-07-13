const axios = require('axios');

const leconsDisponibles = [
  "Introduction à l’informatique et aux systèmes",
  "Installation et configuration d’un environnement Python",
  "Bases du langage Python : variables et types",
  "Structures conditionnelles en Python",
  "Boucles et itérations en Python",
  "Fonctions et modularité en Python",
  "Manipulation des fichiers en Python",
  "Programmation orientée objet en Python",
  "Gestion des erreurs et exceptions en Python",
  "Introduction aux bibliothèques Python populaires (requests, pandas)",
  "Installation et configuration d’un environnement Java",
  "Syntaxe de base du Java : variables et types",
  "Structures conditionnelles et boucles en Java",
  "Programmation orientée objet en Java : classes et objets",
  "Héritage et polymorphisme en Java",
  "Gestion des exceptions en Java",
  "Collections et structures de données en Java",
  "Introduction à JavaFX pour interfaces graphiques",
  "Concepts de base en réseaux informatiques",
  "Protocoles réseau essentiels (TCP/IP, HTTP, DNS)",
  "Introduction à la sécurité informatique",
  "Cryptographie pour débutants",
  "Introduction au hacking éthique",
  "Utilisation de Kali Linux pour le pentesting",
  "Scan et reconnaissance de réseau avec Nmap",
  "Attaques de type injection SQL : concepts et prévention",
  "Introduction aux attaques XSS et CSRF",
  "Sécurisation des applications web",
  "Introduction aux scripts Bash et automatisation",
  "Utilisation de Git pour le contrôle de version",
  "Concepts de bases en bases de données SQL",
  "Manipulation des données avec SQL",
  "Développement web avec HTML et CSS",
  "Introduction à JavaScript pour débutants",
  "Programmation asynchrone en JavaScript",
  "Création d’API REST avec Node.js",
  "Notions sur Docker et virtualisation",
  "Initiation au machine learning avec Python",
  "Traitement de données avec pandas et numpy",
  "Web scraping avec Python (BeautifulSoup)",
  "Introduction à l’algorithmique et complexité",
  "Programmation fonctionnelle en JavaScript",
  "Développement d’applications mobiles basiques avec Java",
  "Concepts avancés de programmation concurrente",
  "Veille technologique : tendances en sécurité informatique"
];

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  mentionedJid: [],
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 143
  }
};

// Fonction pour appeler OpenAI
async function askOpenAI(prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Tu es un professeur expert en informatique et programmation.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 700,
      temperature: 0.7
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer VOTRE_CLE_API` // Remplace par ta clé réelle
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = {
  name: 'leçons',
  description: 'Liste les leçons ou envoie une leçon spécifique',
  run: async (kaya, m, msg, store, args) => {
    try {
      if (args.length === 0) {
        let liste = '📚 *Liste des leçons disponibles :*\n\n';
        leconsDisponibles.forEach((titre, i) => {
          liste += `*${i + 1}.* ${titre}\n`;
        });
        liste += `\n✍️ Pour recevoir une leçon, tape par exemple :\n.lecon 3`;

        return kaya.sendMessage(m.chat, {
          text: liste,
          contextInfo
        }, { quoted: m });
      }

      const num = parseInt(args[0]);
      if (isNaN(num) || num < 1 || num > leconsDisponibles.length) {
        return kaya.sendMessage(m.chat, {
          text: '❌ Numéro de leçon invalide. Tape simplement `.lecon` pour voir la liste.',
          contextInfo
        }, { quoted: m });
      }

      const sujet = leconsDisponibles[num - 1];
      const prompt = `Explique moi en tant qu'apprenant débutant : "${sujet}". Utilise des explications claires et des exemples simples à comprendre.`;

      const lecon = await askOpenAI(prompt);

      return kaya.sendMessage(m.chat, {
        text: `📖 *Leçon ${num} : ${sujet}*\n\n${lecon}`,
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      return kaya.sendMessage(m.chat, {
        text: '❌ Une erreur est survenue. Réessaie plus tard.',
        contextInfo
      }, { quoted: m });
    }
  }
};