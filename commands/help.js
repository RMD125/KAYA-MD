const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Affiche la liste des commandes ou la description d\'une commande spécifique',
  
  run: async (kaya, m, msg, store, args) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    const commandsList = commandFiles.map(file => {
      const command = require(path.join(commandsPath, file));
      return {
        name: command.name || 'inconnu',
        description: command.description || 'Pas de description disponible.'
      };
    });

    const contextInfo = {
      mentionedJid: [m.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 143
      }
    };

    if (args.length === 0) {
      let text = `📜 *Liste des commandes disponibles* 📜\n\n`;

      commandsList.forEach(cmd => {
        text += `🔹 *${cmd.name}*\n`;
      });

      text += `\nPour voir la description d'une commande, tape :\n* .help <commande> *\n\n_⚡ Merci d'utiliser KAYA-MD !_`;

      await kaya.sendMessage(m.chat, { text: text.trim(), contextInfo }, { quoted: m });

    } else {
      const cmdName = args[0].toLowerCase();
      const cmd = commandsList.find(c => c.name === cmdName);

      if (!cmd) {
        return kaya.sendMessage(m.chat, {
          text: `❌ La commande *${cmdName}* est introuvable.`,
          contextInfo
        }, { quoted: m });
      }

      let text = `📄 *${cmd.name.toUpperCase()}*\n\n` +
                 `🔹 Description :\n${cmd.description}\n\n` +
                 `_⚡ Merci d'utiliser KAYA-MD !_`;

      await kaya.sendMessage(m.chat, { text: text.trim(), contextInfo }, { quoted: m });
    }
  }
};