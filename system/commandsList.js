// system/commandsList.js
const fs = require('fs');
const path = require('path');

// Chemin vers le dossier contenant toutes les commandes
const commandsPath = path.join(__dirname, '../commands');

const commandsList = [];

fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const command = require(path.join(commandsPath, file));
    if (command && command.name) {
      commandsList.push(command);
    }
  }
});

module.exports = commandsList;