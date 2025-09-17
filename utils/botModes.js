// ==================== botModes.js ====================
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier modes
const modeFile = path.join(new URL('../data/botModes.json', import.meta.url).pathname);

// Valeurs par défaut
const defaultModes = { typing: false, recording: false, autoreact: false };

// Charger les modes au démarrage
export function loadBotModes() {
  if (!fs.existsSync(modeFile)) {
    saveBotModes(defaultModes);
    return { ...defaultModes };
  }
  try {
    return JSON.parse(fs.readFileSync(modeFile, 'utf-8'));
  } catch {
    return { ...defaultModes };
  }
}

// Sauvegarder les modes
export function saveBotModes(modes) {
  fs.writeFileSync(modeFile, JSON.stringify(modes, null, 4));
}

// Toggle un mode
export function toggleMode(modeName) {
  if (!(modeName in global.botModes)) return false;
  global.botModes[modeName] = !global.botModes[modeName];
  saveBotModes(global.botModes);
  return global.botModes[modeName];
}

// Initialisation au démarrage
global.botModes = loadBotModes();