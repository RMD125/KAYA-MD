const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'menu',
  description: 'Affiche le menu interactif Kaya-MD',
  run: async (kaya, m, msg, store, args) => {
    // Date & Heure en format FR
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR');
    const time = now.toLocaleTimeString('fr-FR');

    // Nombre total de commandes (dans le dossier commands)
    let totalCmds = 0;
    try {
      const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
      totalCmds = commandFiles.length;
    } catch (e) {
      totalCmds = 'Erreur';
    }

    const menuText = `
╭────\`KAYA-MD MENU\` ───╮
│ 📅 *Date* : ${date}
│ 🕒 *Heure* : ${time}
│ 📂 *Commandes* : ${totalCmds}
│
│ 1.  Groupe menu
│ 2.  Owner menu
│ 3.  Stickers menu
│ 4.  Médias menu
│ 5.  Divers menu
│ 6.  Téléchargements menu
│ 7.  IA & Outils menu
│ 8.  Apprentissage menu
│ 9.  Réseaux menu
│10. Tous les menus
│      
╰────────────────────╯
📋 *Astuce :* Réponds au menu avec un chiffre (1 à 10) ou tape une commande comme : .groupemenu | .stickermenu | .iamenu
    `.trim();

    await kaya.sendMessage(
      m.chat,
      {
        image: { url: 'https://files.catbox.moe/e3g4cv.jpg' },
        caption: menuText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402565816662@newsletter',
            newsletterName: 'KAYA MD,
            serverMessageId: 143
          }
        }
      },
      { quoted: m }
    );

    // Active le menu de manière permanente
    global.menuState = global.menuState || {};
    global.menuState[m.sender] = true;
  }
};