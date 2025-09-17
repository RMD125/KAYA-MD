// ----------------- Imports -----------------
import fs from 'fs';
import path from 'path';
import menuCases from './system/menuCases.js';
import config from './config.js';
import checkAdminOrOwner from './utils/checkAdmin.js';
import decodeJid from './utils/decodeJid.js';
import antispam from './commands/antispam.js';
import antibot from './commands/antibot.js';
import antilink from './commands/antilink.js';
import antitag from './commands/antitag.js';

// ----------------- Commandes -----------------
const commands = new Map();

// Charger commandes dynamiquement
const commandFiles = fs.readdirSync(path.join(process.cwd(), 'commands'));
for (const file of commandFiles) {
  if (file.endsWith('.js')) {
    try {
      const cmdModule = await import(`./commands/${file}`);
      const cmd = cmdModule.default ?? cmdModule;
      if (cmd.name && typeof cmd.run === 'function') {
        commands.set(cmd.name.toLowerCase(), cmd);
        console.log(`✅ Commande chargée: ${cmd.name}`);
      }
    } catch (err) {
      console.error(`❌ Erreur chargement ${file}:`, err);
    }
  }
}

// ----------------- Alias menus -----------------
const aliases = {
  'groupemenu': '1', 'ownermenu': '2', 'stickermenu': '3',
  'diversmenu': '4', 'telechargementsmenu': '5',
  'iamenu': '6', 'tousmenus': '7',
  'groupe/menu': '1', 'owner/menu': '2'
};

// ----------------- Global states -----------------
global.menuState = {};
if (!global.blockInbox) global.blockInbox = new Set();
global.disabledGroups = new Set();
global.bannedUsers = [];
global.botModes = { typing: false, recording: false, autoreact: false };
global.groupCache = {};
global.allPrefix = global.allPrefix ?? false; // <-- allPrefix default false

// Charger antiSpamGroups, antiLinkGroups et antiTagGroups
try {
  const antiSpamFile = path.join(process.cwd(), './data/antiSpamGroups.json');
  global.antiSpamGroups = fs.existsSync(antiSpamFile)
    ? new Set(JSON.parse(fs.readFileSync(antiSpamFile, 'utf-8')))
    : new Set();

  const antiLinkFile = path.join(process.cwd(), './data/antiLinkGroups.json');
  global.antiLinkGroups = fs.existsSync(antiLinkFile)
    ? JSON.parse(fs.readFileSync(antiLinkFile, 'utf-8'))
    : {};

  const antiTagFile = path.join(process.cwd(), './data/antiTagGroups.json');
  global.antiTagGroups = fs.existsSync(antiTagFile)
    ? JSON.parse(fs.readFileSync(antiTagFile, 'utf-8'))
    : {};

} catch (err) {
  console.error('❌ Erreur chargement antiSpam/antiLink/antiTag:', err);
  global.antiSpamGroups = new Set();
  global.antiLinkGroups = {};
  global.antiTagGroups = {};
}

// ----------------- Handler principal -----------------
export default async function handleCommand(Kaya, m, msg, store) {
  try {
    const sender = decodeJid(m.sender);
    const chatId = decodeJid(m.chat);
    const isGroup = chatId.endsWith('@g.us');

    const body =
      m.body ||
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      '';
    if (!body) return;

    const trimmedBody = body.trim();

    // ----------------- Menu interactif -----------------
    if (global.menuState[sender]) {
      if (/^[1-7]$/.test(trimmedBody)) {
        const menuFn = menuCases[trimmedBody];
        if (typeof menuFn === 'function') {
          return await menuFn(Kaya, m, msg, store);
        }
      }
    }

// ----------------- Détection commande -----------------
let isCmd = false;
let commandText = trimmedBody;

// Préfixe personnalisé défini
const customPrefix = config.PREFIX || '';

// Si allPrefix activé
if (global.allPrefix) {
  isCmd = true;

  // Si le message commence par le préfixe défini, on le retire
  if (customPrefix && trimmedBody.startsWith(customPrefix)) {
    commandText = trimmedBody.slice(customPrefix.length).trim();
  } else {
    // sinon, on prend tout comme commande
    commandText = trimmedBody;
  }

} else {
  // Mode normal : vérifier si commence par le préfixe
  if (customPrefix && trimmedBody.startsWith(customPrefix)) {
    isCmd = true;
    commandText = trimmedBody.slice(customPrefix.length).trim();
  } else {
    isCmd = false;
  }
}

let args = commandText.split(/ +/);
let command = args.shift()?.toLowerCase() || '';

// -------- Si bouton d'une commande --------
if (msg.message?.buttonsResponseMessage?.selectedButtonId) {
  const btnId = msg.message.buttonsResponseMessage.selectedButtonId;
  args = [btnId];
  command = btnId.startsWith(customPrefix) ? btnId.slice(customPrefix.length).toLowerCase() : btnId.toLowerCase();
  isCmd = true;
}    // -------- Anti-spam / antibot / anti-link / anti-tag --------
    if (isGroup && global.antiSpamGroups?.has(chatId)) {
      try { await antispam.detect(Kaya, m); } catch (err) { console.error(err); }
    }
    if (isGroup && global.antibotGroups?.has(chatId)) {
      try { await antibot.detect(Kaya, m); } catch (err) { console.error(err); }
    }
    if (isGroup && global.antiLinkGroups?.[chatId]?.enabled) {
      try { await antilink.detect(Kaya, m); } catch (err) { console.error(err); }
    }
    if (isGroup && global.antiTagGroups?.[chatId]?.enabled) {
      try { await antitag.detect(Kaya, m); } catch (err) { console.error(err); }
    }

    // -------- Groupes désactivés --------
    if (isGroup && global.disabledGroups.has(chatId)) {
      const permissions = await checkAdminOrOwner(Kaya, chatId, sender);
      const isMenuReplyActive = global.menuState[sender] &&
        (msg.message?.buttonsResponseMessage || msg.message?.listResponseMessage);
      if (!permissions.isAdminOrOwner && (isCmd || isMenuReplyActive)) {
        return await Kaya.sendMessage(chatId, { text: `❌ Ce bot est désactivé dans ce groupe.` }, { quoted: msg });
      }
    }

    // -------- Vérification bannis --------
    const owners = config.OWNER_NUMBER.split(',').map(o => o.includes('@') ? o.trim() : `${o.trim()}@s.whatsapp.net`);
    const isOwner = owners.includes(sender);
    if (global.bannedUsers.includes(sender.split('@')[0]) && isCmd) {
      return await Kaya.sendMessage(chatId, { text: "❌ Vous êtes banni du bot." }, { quoted: msg });
    }
    if (!isGroup && global.blockInbox.has('enabled') && !isOwner) return;

    // -------- Modes du bot --------
    if (!m.key.fromMe) {
      const presenceActions = [];
      if (global.botModes.typing) presenceActions.push({ type: 'composing', duration: 1500 });
      if (global.botModes.recording) presenceActions.push({ type: 'recording', duration: 2000 });
      for (const action of presenceActions) {
        await Kaya.sendPresenceUpdate(action.type, chatId);
        await new Promise(r => setTimeout(r, action.duration));
        await Kaya.sendPresenceUpdate('paused', chatId);
      }
      if (global.botModes.autoreact) await Kaya.sendMessage(chatId, { react: { text: '❤️', key: m.key } });
    }

    // -------- Execution commandes --------
    if (isCmd && (commands.has(command) || aliases[command])) {
      // Commande normale
      if (commands.has(command)) {
        const cmdFn = commands.get(command);
        if (cmdFn.ownerOnly && !isOwner) {
          return await Kaya.sendMessage(chatId, { text: '🚫 Commande réservée au propriétaire.', contextInfo: msg.message?.extendedTextMessage?.contextInfo }, { quoted: msg });
        }
        return await cmdFn.run(Kaya, m, msg, store, args, {
          isGroup,
          participants: [],
          isAdmins: false,
          isBotAdmins: false,
          isOwner,
          isAdminOrOwner: false,
          metadata: null,
          contextInfo: m.message?.extendedTextMessage?.contextInfo || {}
        });
      }

      // Menu interactif via alias
      if (aliases[command]) {
        const menuFn = menuCases[aliases[command]];
        if (typeof menuFn === 'function') {
          global.menuState[sender] = true;
          return await menuFn(Kaya, m, msg, store);
        }
      }
    }

  } catch (err) {
    console.error('❌ Erreur handleCommand:', err);
  }
}

// ----------------- Export de la Map des commandes -----------------
export { commands };