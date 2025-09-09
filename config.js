// ==================== config.js ====================
const fs = require("fs");
const path = require("path");

const defaultConfig = {
  SESSION_ID: "",
  OWNER_NUMBER: "",
  PREFIX: ".",
  TIMEZONE: "Africa/Kinshasa",
  publicBot: true, // true = public, false = privé par défaut
  autoRead: true,
  restrict: false,
  botImage: "",
  LINKS: {
    group: "https://chat.whatsapp.com/DoMh6jWjly2ErwVppmCGZo",
    chanel: "https://whatsapp.com/channel/0029Vb6FFPM002T3SKA6bb2D",
    telegram: "https://t.me/zonetech2"
  }
};

// 📂 chemin vers ./data/config.json
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const configPath = path.join(dataDir, "config.json");

// Crée config.json si inexistant
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log("✅ config.json créé avec les paramètres par défaut dans /data");
}

// Charge config.json
let userConfig = JSON.parse(fs.readFileSync(configPath));

// Fonction pour sauvegarder après modification
function saveConfig(updatedConfig) {
  userConfig = { ...userConfig, ...updatedConfig };
  fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));
  console.log("✅ Configuration sauvegardée avec succès.");

  // Mettre à jour les propriétés exportées en mémoire
  Object.keys(updatedConfig).forEach(key => {
    module.exports[key] = userConfig[key];
  });
}

// Export
module.exports = {
  ...userConfig,
  saveConfig
};