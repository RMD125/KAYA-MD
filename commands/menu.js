const fs = require('fs');
const path = require('path');
const { contextInfo } = require('../utils/contextInfo'); // import centralisé

const botImagePath = path.join(__dirname, '../data/botImage.json');

module.exports = {
  name: 'menu',
  description: 'Affiche le menu interactif Kaya-MD',
  run: async (kaya, m, msg, store, args) => {
    // Date & Heure en format FR
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR');
    const time = now.toLocaleTimeString('fr-FR');

    // Nombre total de commandes
    let totalCmds = 0;
    try {
      const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
      totalCmds = commandFiles.length;
    } catch (e) {
      totalCmds = 'Erreur';
    }

    // Chargement de l’image du bot dynamique
    let botImageUrl = 'https://files.catbox.moe/ya7puq.jpg'; // Image par défaut
    try {
      if (fs.existsSync(botImagePath)) {
        const data = JSON.parse(fs.readFileSync(botImagePath));
        if (data.botImage) botImageUrl = data.botImage;
      }
    } catch (e) {
      console.error('Erreur lors du chargement de l’image du bot:', e);
    }

    const menuText = `
╭────KAYA-MD MENU───╮
│ 📅 *Date* : ${date}
│ 🕒 *Heure* : ${time}
│ 📂 *Commandes* : ${totalCmds}
│
│ 🔹 1. Groupe menu
│ 🔹 2. Owner menu
│ 🔹 3. Stickers menu
│ 🔹 4. Divers menu
│ 🔹 5. Téléchargements menu
│ 🔹 6. IA & Outils menu
│ 🔹 7. Tous les menus
│      
╰──────────────────╯
📋 *Astuce :* Réponds au menu avec un chiffre (1 à 7) ou 
               tape .groupemenu | stickermenu etc..
    `.trim();

    await kaya.sendMessage(
      m.chat,
      {
        image: { url: botImageUrl },
        caption: menuText,
        contextInfo: { ...contextInfo, mentionedJid: [m.sender] } // utilisation centralisée
      },
      { quoted: m }
    );

    // Active le menu de manière permanente
    global.menuState = global.menuState || {};
    global.menuState[m.sender] = true;
  }
};
