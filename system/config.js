const fs = require('fs');
const path = require('path');

// 📁 Chemin vers config.json
const configPath = path.join(__dirname, '../data/config.json');

// 📌 Valeurs par défaut
const defaultConfig = {
  botName: 'Kaya-MD',
  owner: ['243813627591'],
  author: 'Kaya',
  packname: 'Kaya Bot',
  prefix: '.',
  sessionName: 'session',
  publicBot: true,
  botWelcomeMessage: '👋 Bienvenue dans Kaya-MD ! Tape .menu pour voir les commandes.',
  botStatus: '🟢 En ligne - by Kaya',
  autoRead: true,
  restrict: false,
  botImage: ''
};

// 🧠 Création du fichier si absent
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
}

// 🗂 Chargement de la config personnalisée
let userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// ✅ Fonction pour sauvegarder les modifications autorisées
function saveUserConfig(updatedConfig) {
  // On ne sauvegarde que les clés modifiables
  const modifiableKeys = [
    'botName', 'owner', 'author', 'packname', 'prefix', 'sessionName',
    'botWelcomeMessage', 'botStatus', 'publicBot', 'autoRead',
    'restrict', 'botImage'
  ];

  const cleanConfig = {};
  for (const key of modifiableKeys) {
    if (updatedConfig.hasOwnProperty(key)) {
      cleanConfig[key] = updatedConfig[key];
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(cleanConfig, null, 2));
  userConfig = { ...userConfig, ...cleanConfig };
}

module.exports = {
  ...defaultConfig,
  ...userConfig,
  configPath,
  saveUserConfig,

  // 🚫 Valeurs non modifiables par .settings
  OPENAI_API_KEY: 'sk-xxxxxxxxxxxxxxx',
  links: {
    group: 'https://chat.whatsapp.com/...',
    chanel: 'https://whatsapp.com/channel/...',
    telegram: 'https://t.me/...'
  }
};