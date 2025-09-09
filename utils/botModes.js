const fs = require("fs");
const path = require("path");

const modeFile = path.join(__dirname, "../data/botModes.json");

// Valeurs par défaut
const defaultModes = { typing: false, recording: false, autoreact: false };

// Charger les modes au démarrage
function loadBotModes() {
    if (!fs.existsSync(modeFile)) {
        saveBotModes(defaultModes);
        return { ...defaultModes };
    }
    try {
        return JSON.parse(fs.readFileSync(modeFile, "utf-8"));
    } catch {
        return { ...defaultModes };
    }
}

// Sauvegarder les modes
function saveBotModes(modes) {
    fs.writeFileSync(modeFile, JSON.stringify(modes, null, 4));
}

// Toggle un mode
function toggleMode(modeName) {
    if (!(modeName in global.botModes)) return false;
    global.botModes[modeName] = !global.botModes[modeName];
    saveBotModes(global.botModes);
    return global.botModes[modeName];
}

// Initialisation au démarrage
global.botModes = loadBotModes();

module.exports = {
    toggleMode,
    saveBotModes,
    loadBotModes
};