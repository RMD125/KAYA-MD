const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('./system/config');
const antilink = require('./commands/antilink');
const menuCases = require('./system/menuCases');
const antispam = require('./commands/antispam'); 

// Chargement des commandes dynamiques
const commands = new Map();
fs.readdirSync(path.join(__dirname, 'commands')).forEach(file => {
  if (file.endsWith('.js')) {
    const cmd = require(`./commands/${file}`);
    if (cmd.name && typeof cmd.run === 'function') {
      commands.set(cmd.name.toLowerCase(), cmd);
    }
  }
});

// GPT avec style humain (askGPT fonction)
async function askGPT(prompt) {
  try {
    const systemPrompt = `
Tu es un jeune congolais drôle et naturel, tu réponds comme un vrai ami.
Tu ne dis jamais que tu es une IA.
Réponds de façon décontractée à ce message : "${prompt}"
`;
    const res = await axios.post('https://stablediffusion.fr/gpt3/predict', {
      prompt: systemPrompt
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://stablediffusion.fr/chatgpt3',
        'Origin': 'https://stablediffusion.fr',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    return res.data.message || 'Je sais pas trop quoi te dire là 😅';
  } catch (err) {
    return '❌ Une erreur est survenue : ' + err.message;
  }
}

// Chargement des utilisateurs bannis
const banData = require('./data/ban.json');

// Auto-react
const autoReactCmd = require('./commands/autoreact');

// Auto-read
const autoreadFile = path.join(__dirname, 'data', 'autoread.json');
let autoreadData = { enabled: false };
if (fs.existsSync(autoreadFile)) {
  autoreadData = JSON.parse(fs.readFileSync(autoreadFile));
} else {
  fs.writeFileSync(autoreadFile, JSON.stringify(autoreadData, null, 2));
}

// Recording
const recordingFile = path.join(__dirname, 'data', 'recording.json');
let recordingData = { enabled: false };
if (fs.existsSync(recordingFile)) {
  recordingData = JSON.parse(fs.readFileSync(recordingFile));
} else {
  fs.writeFileSync(recordingFile, JSON.stringify(recordingData, null, 2));
}

module.exports = async function handleCommand(kaya, m, msg, store) {
  try {
    // === ANTI-SPAM sur tous les messages ===
    if (antispam.onMessage) {
      await antispam.onMessage(kaya, m, msg, store);
    }

    // === ANTI-LINK sur tous les messages ===
    if (antilink.onMessage) {
      await antilink.onMessage(kaya, m);
    }

    // === AUTO-REACT sur tous les messages ===
    if (autoReactCmd.onMessage) {
      await autoReactCmd.onMessage(kaya, m);
    }

    // === RECORDING presence ===
    if (recordingData.enabled) {
      await kaya.sendPresenceUpdate('recording', m.chat);
    }

    // === AUTO-READ ===
    if (autoreadData.enabled) {
      try {
        await kaya.sendReadReceipt(m.chat, m.key);
      } catch (e) {
        console.error('❌ Erreur auto-read :', e);
      }
    }

    const senderNumber = m.sender.split('@')[0];
    const typeMsg = Object.keys(m.message || {})[0];
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    const trimmedBody = body.trim();

    global.menuState = global.menuState || {};

    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText =
      quoted?.conversation ||
      quoted?.extendedTextMessage?.text ||
      quoted?.imageMessage?.caption || '';

    const isReplyToMenu = quotedText?.toLowerCase().includes('kaya-md');
    const isCommand = trimmedBody.startsWith(config.prefix);

    // === Mode privé ===
    const isMenuReply = global.menuState[m.sender] && isReplyToMenu;
    if ((isCommand || isMenuReply) && !config.publicBot && !config.owner.includes(senderNumber)) {
      return kaya.sendMessage(m.chat, {
        text: '🚫 *KAYA-MD* est en mode *privé*. Seul le propriétaire peut utiliser les commandes.'
      }, { quoted: m });
    }

    // === Vérification ban ===
    if (banData[senderNumber]) {
      return kaya.sendMessage(m.chat, {
        text: '🚫 *Tu es banni de l’utilisation du bot.*'
      }, { quoted: m });
    }

    // === Vérifie si utilisateur est bien membre (évite l'absence de menu dans groupes) ===
    if (m.key.remoteJid.endsWith('@g.us')) {
      const metadata = await kaya.groupMetadata(m.chat);
      const participant = metadata.participants.find(p => p.id === m.sender);
      if (!participant || participant.admin === 'left' || participant.admin === 'removed') return;
    }

    // === Gestion des commandes ===
    if (isCommand) {
      const args = trimmedBody.slice(config.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      // Commande spéciale .settings
      const params = [
        'prefix', 'botname', 'author', 'packname', 'sessionname',
        'welcomemessage', 'botstatus', 'autoread', 'restrict',
        'botmode', 'owner', 'botimage'
      ];
      if (params.includes(command)) {
        const argsForSettings = [command, ...args];
        const settingsCmd = require('./commands/settings.js');
        return settingsCmd.run(kaya, m, msg, store, argsForSettings);
      }

      // === Exécuter la commande si elle existe ===
      if (commands.has(command)) {
        return await commands.get(command).run(kaya, m, msg, store, args);
      }

      // === Alias de menu ===
      const aliases = {
        'groupemenu': '1',
        'ownermenu': '2',
        'stickermenu': '3',
        'mediasmenu': '4',
        'diversmenu': '5',
        'telechargementsmenu': '6',
        'iamenu': '7',
        'apprentissage': '8',
        'reseauxmenu': '9',
        'tousmenus': '10',
        'groupe/menu': '1',
        'owner/menu': '2',
        'sticker/menu': '3',
        'medias/menu': '4'
      };
      if (aliases[command]) {
        const menuFn = menuCases[aliases[command]];
        if (typeof menuFn === 'function') {
          return await menuFn(kaya, m, msg, store);
        }
      }

      // Commande inconnue
      return kaya.sendMessage(m.chat, {
        text: `❌ La commande *${command}* est inconnue.`
      }, { quoted: m });
    } else {
      // === Réponses à .welcome ou menu interactif ===
      const welcomeCmd = require('./commands/welcome');
      if (global.welcomePending && global.welcomePending[m.chat]) {
        const handled = await welcomeCmd.handleResponse(kaya, m);
        if (handled) return;
      }

      if (global.menuState[m.sender] && isReplyToMenu) {
        const menuFn = menuCases[trimmedBody] || menuCases['default'];
        if (typeof menuFn === 'function') {
          await menuFn(kaya, m, msg, store);
        } else {
          await kaya.sendMessage(m.chat, {
            text: '❓ Menu non reconnu.'
          }, { quoted: m });
        }
        return;
      }

      // === Mode ChatBot global ===
      const db = JSON.parse(fs.readFileSync('./data/chabot.json'));
      if (db["global"]) {
        if (!['conversation', 'extendedTextMessage'].includes(typeMsg)) return;
        if (!trimmedBody) return;

        const rep = await askGPT(trimmedBody);
        return kaya.sendMessage(m.chat, { text: rep }, { quoted: m });
      }
    }
  } catch (err) {
    console.error('❌ Erreur dans handler.js:', err);
  }
};