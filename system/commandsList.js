// system/commandsList.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le dossier contenant toutes les commandes
const commandsPath = path.join(__dirname, '../commands');

const commandsList = [];

// Lecture des fichiers commandes
for (const file of fs.readdirSync(commandsPath)) {
  if (file.endsWith('.js')) {
    const commandModule = await import(path.join(commandsPath, file));
    // Récupère l'export default si présent
    const command = commandModule.default || commandModule;
    if (command && command.name) commandsList.push(command);
  }
}

export default commandsList;