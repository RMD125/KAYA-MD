const fs = require('fs');

const path = require('path');

const menuCases = require('./system/menuCases');

const config = require('./config');

const checkAdminOrOwner = require('./utils/checkAdmin');

const decodeJid = require('./utils/decodeJid');

const antispam = require('./commands/antispam');

const antibot = require('./commands/antibot'); // <- ajoute ceci

const commands = new Map();

// ----------------- Charger commandes -----------------

fs.readdirSync(path.join(__dirname, 'commands')).forEach(file => {

    if (file.endsWith('.js')) {

        try {

            const cmd = require(`./commands/${file}`);

            if (cmd.name && typeof cmd.run === 'function') {

                commands.set(cmd.name.toLowerCase(), cmd);

                console.log(`✅ Commande chargée: ${cmd.name}`);

            }

        } catch (err) {

            console.error(`❌ Erreur chargement ${file}:`, err);

        }

    }

});

// ----------------- Alias menus -----------------

const aliases = {

    'groupemenu': '1', 'ownermenu': '2', 'stickermenu': '3',

    'mediasmenu': '4', 'diversmenu': '5', 'telechargementsmenu': '6',

    'iamenu': '7', 'apprentissage': '8', 'reseauxmenu': '9',

    'tousmenus': '10', 'groupe/menu': '1', 'owner/menu': '2'

};

// ----------------- Global states -----------------

global.menuState = {};

if (!global.blockInbox) global.blockInbox = new Set();

global.disabledGroups = new Set();

global.bannedUsers = [];

global.botModes = { typing: false, recording: false, autoreact: false };

global.groupCache = {}; 

// ----------------- Charger antiSpamGroups au démarrage -----------------

try {

    const antiSpamFile = path.join(__dirname, './data/antiSpamGroups.json');

    if (fs.existsSync(antiSpamFile)) {

        global.antiSpamGroups = new Set(JSON.parse(fs.readFileSync(antiSpamFile, 'utf-8')));

    } else {

        global.antiSpamGroups = new Set();

    }

} catch (err) {

    console.error('❌ Erreur chargement antiSpamGroups:', err);

    global.antiSpamGroups = new Set();

}

// ----------------- Handler principal -----------------

module.exports = async function handleCommand(Kaya, m, msg, store) {

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

        const isCmd = trimmedBody.startsWith(config.PREFIX);

        // -------- Anti-spam --------

        if (isGroup && global.antiSpamGroups?.has(chatId)) {

            try { 

                await antispam.detect(Kaya, m); 

            } catch (err) { 

                console.error("❌ Anti-spam detect():", err); 

            }

        }

        // -------- Antibot --------

        if (isGroup && global.antibotGroups?.has(chatId)) {

            try {

                await antibot.detect(Kaya, m);

            } catch (err) {

                console.error("❌ Antibot detect():", err);

            }

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

        let isOwner = owners.includes(sender);

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

            if (global.botModes.autoreact) {

                await Kaya.sendMessage(chatId, { react: { text: '❤️', key: m.key } });

            }

        }

        // -------- Préparer commandes et metadata --------

        const args = isCmd ? trimmedBody.slice(config.PREFIX.length).trim().split(/ +/) : [];

        const command = args.shift()?.toLowerCase() || '';

        let participants = [];

        let metadata = null;

        let isAdmins = false;

        let isBotAdmins = false;

        let isAdminOrOwner = false;

        if (isGroup) {

            try {

                // Utilise cache si disponible

                if (!global.groupCache[chatId]) {

                    metadata = await Kaya.groupMetadata(chatId);

                    participants = metadata.participants || [];

                    global.groupCache[chatId] = { metadata, participants };

                } else {

                    metadata = global.groupCache[chatId].metadata;

                    participants = global.groupCache[chatId].participants;

                }

                // Vérifie admin/owner avec participants et metadata

                const senderCheck = await checkAdminOrOwner(Kaya, chatId, sender, participants, metadata);

                isAdmins = senderCheck.isAdmin;

                isOwner = senderCheck.isOwner;

                isAdminOrOwner = senderCheck.isAdminOrOwner; // ✅

                const botJid = decodeJid(Kaya.user?.id);

                const botCheck = await checkAdminOrOwner(Kaya, chatId, botJid, participants, metadata);

                isBotAdmins = botCheck.isAdmin;

            } catch (e) {

                console.error('❌ Erreur récupération groupMetadata:', e);

            }

        }

        // -------- Exécution des commandes --------

        if (isCmd && (commands.has(command) || aliases[command])) {

            if (commands.has(command)) {

                const cmdFn = commands.get(command);

                // Vérification owner uniquement

                if (cmdFn.ownerOnly && !isOwner) {

                    return await Kaya.sendMessage(chatId, { text: '🚫 Commande réservée au propriétaire.' }, { quoted: msg });

                }

                // Passe participants et metadata à la commande

                await cmdFn.run(Kaya, m, msg, store, args, {

                    isGroup,

                    participants,

                    isAdmins,

                    isBotAdmins,

                    isOwner,

                    isAdminOrOwner, // ✅ maintenant correctement passé

                    metadata

                });

                if (command === 'menu') global.menuState[sender] = true;

                return;

            }

            if (aliases[command]) {

                const menuFn = menuCases[aliases[command]];

                if (typeof menuFn === 'function') {

                    global.menuState[sender] = true;

                    return await menuFn(Kaya, m, msg, store);

                }

            }

        }

        // -------- Menu interactif --------

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const quotedText =

            quoted?.conversation ||

            quoted?.extendedTextMessage?.text ||

            quoted?.imageMessage?.caption ||

            quoted?.videoMessage?.caption ||

            '';

        const isReplyToBot = quotedText?.toLowerCase().includes('kaya-md');

        const isButtonOrList = msg.message?.buttonsResponseMessage || msg.message?.listResponseMessage;

        const isMenuReplyActive = global.menuState[sender] && (isReplyToBot || isButtonOrList);

        if (isMenuReplyActive) {

            const menuFn = menuCases[trimmedBody.toLowerCase()] || menuCases['default'];

            if (typeof menuFn === 'function') return await menuFn(Kaya, m, msg, store);

        }

    } catch (err) {

        console.error('❌ Erreur handleCommand:', err);

    }

};