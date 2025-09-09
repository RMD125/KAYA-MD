const config = require('./config');
const {
    default: baileys, proto, getContentType, generateWAMessage,
    generateWAMessageFromContent, generateWAMessageContent,
    prepareWAMessageMedia, downloadContentFromMessage, downloadAndSaveMediaMessage
} = require("@whiskeysockets/baileys");

const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const axios = require('axios');
const fetch = require("node-fetch");
const { performance } = require('perf_hooks');
const { extractGroupIdFromLink, checkIfBotAdmin } = require('./func.js');
const { addPremiumUser, getPremiumExpired, getPremiumPosition, expiredCheck, checkPremiumUser, getAllPremiumUser } = require("./premium.js");
const { getBuffer, getGroupAdmins, getSizeMedia, formatSize, checkBandwidth, formatp, fetchJson, reSize, sleep, isUrl, runtime } = require('./func.js');

module.exports = async function kayaHandler(kaya, m, msg, store) {
    try {
        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "interactiveResponseMessage" ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
            m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.message.InteractiveResponseMessage.NativeFlowResponseMessage || m.text : "");

        if (!m.message || !m.key || !m.key.remoteJid) return;
        if (m.key.remoteJid.startsWith("status@")) return;

        const startTime = Date.now();
        const sender = m.key.fromMe ? kaya.user.id.split(":")[0] + "@s.whatsapp.net" : m.key.participant || m.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const budy = (typeof m.text === 'string' ? m.text : '');
        const prefix = ".";
        if (!body.startsWith(prefix)) return;

        const command = body.slice(1).split(" ")[0].toLowerCase();
        const args = body.split(" ").slice(1);
        const text = args.join(" ");
        const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mime = (quoted?.message || quoted)?.mimetype || "";
        const from = m.key.remoteJid;
        const isCreator = m.sender == owner + "@s.whatsapp.net" ? true : m.fromMe ? true : false;
        const isGroup = from.endsWith("@g.us");

        const kontributor = JSON.parse(fs.readFileSync('./system/database/owner.json'));
        const botNumber = await kaya.decodeJid(kaya.user.id);
        const Access = [botNumber, ...kontributor, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        const isCmd = budy.startsWith(prefix);
        const pushname = m.pushName || "No Name";

        const groupMetadata = isGroup ? await kaya.groupMetadata(m.chat).catch((e) => { }) : "";
        const groupOwner = isGroup ? groupMetadata.owner : "";
        const groupName = m.isGroup ? groupMetadata.subject : "";
        const participants = isGroup ? await groupMetadata.participants : "";
        const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
        const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
        const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;

        const premium = JSON.parse(fs.readFileSync("./system/database/premium.json"));
        const isPremium = premium.includes(m.sender);

        const now = new Date();
        const options = { timeZone: 'Africa/Libreville', hour12: false };
        const time = now.toLocaleTimeString('fr-FR', options);
        const date = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Libreville' });

        if (!kaya.public && !m.key.fromMe) return;

        console.log(chalk.blue('╭─────────────────────────────❀'));
        console.log(chalk.blue('KAYA 𝐌𝐃'));
        console.log(chalk.blue('├─────────────────────────────'));
        console.log(chalk.blue(`│ 📅 Date : `) + chalk.cyan(new Date().toLocaleString()));
        console.log(chalk.blue(`│ 💬 Message : `) + chalk.white(m.body || m.mtype));
        console.log(chalk.blue(`│ 👤 Expéditeur : `) + chalk.magenta(m.pushname));
        console.log(chalk.blue(`│ 📱 Numéro : `) + chalk.red(senderNumber));
        if (m.isGroup) {
            console.log(chalk.blue('├─────────────────────────────'));
            console.log(chalk.blue(`│ 👥 Groupe : `) + chalk.green(groupName));
            console.log(chalk.blue(`│ Participants : `) + chalk.red(participants.length));
            console.log(chalk.blue(`│ 🆔 ID du groupe : `) + chalk.red(m.chat));
        }
        console.log(chalk.blue('╰─────────────────────────────❀\n'));

        // Switch Commandes
        switch (command) {
        
        
        case 'menu': {
    await kaya.sendMessage(m.chat, { react: { text: "📋", key: m.key } });

    const menuText = `╭───────────────◆
│   🤖 *KAYA-MD SYSTEM*
├───────────────◆
│ 👤 *Utilisateur:* ${pushname}
│ 🔖 *Premium:* ${isPremium ? "✅ Oui" : "❌ Non"}
│ 📅 *Date:* ${date}
│ 🕰 *Heure:* ${time}
├───────────────◆
│ 🔥 *COMMANDES DISPONIBLES:*
├───────────────◆
│ 📥 *.download* - Télécharger 
│ 🎵 *.play* - Télécharger musique
│ 🎞 *.video* - Télécharger vidéo
│ 🎨 *.sticker* - Créer sticker
│ 📝 *.addcase* - Ajouter Case
│ ❌ *.delcase* - Supprimer Case
│ 🔐 *.private* - Mode Privé
│ 🔓 *.public* - Mode Public
│ 👑 *.owner* - Contact Admin
╰───────────────◆
*CRÉÉ PAR KAYA 🔥*`;

    await kaya.sendMessage(m.chat, { 
        image: { url: "" }, 
        caption: menuText 
    });
}
break;

            case 'private':
                await kaya.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
                if (!isCreator) return m.reply("Commande réservée au propriétaire.");
                kaya.public = false;
                m.reply(`✅ Mode privé activé\n\nCRÉÉ PAR KAYA`);
                break;

            case 'public':
                await kaya.sendMessage(m.chat, { react: { text: "🔓", key: m.key } });
                if (!isCreator) return m.reply("Commande réservée au propriétaire.");
                kaya.public = true;
                m.reply(`✅ Mode public activé\n\nCRÉÉ PAR KAYA`);
                break;

            case 'addcase':
                await kaya.sendMessage(m.chat, { react: { text: "➕", key: m.key } });
                if (!isCreator) return m.reply("Commande réservée au propriétaire.");
                if (!text) return m.reply("Veuillez entrer un case à ajouter.");
                const file = 'ask-xmd.js';
                fs.readFile(file, 'utf8', (err, data) => {
                    if (err) return m.reply("Erreur de lecture.");
                    const insertAt = data.indexOf("switch (command) {");
                    if (insertAt === -1) return m.reply("Switch introuvable.");
                    const updated = data.slice(0, insertAt + 18) + `\n\n${text}\n` + data.slice(insertAt + 18);
                    fs.writeFile(file, updated, 'utf8', (err) => {
                        if (err) return m.reply("Erreur d'écriture.");
                        m.reply(`✅ Nouveau case ajouté.\n\nCRÉÉ PAR KAYA`);
                    });
                });
                break;

            case 'delcase':
                await kaya.sendMessage(m.chat, { react: { text: "🗑️", key: m.key } });
                if (!isCreator) return m.reply("Commande réservée au propriétaire.");
                if (!text) return m.reply("Veuillez spécifier le case à supprimer.");
                fs.readFile(file, 'utf8', (err, data) => {
                    if (err) return m.reply("Erreur de lecture.");
                    const regex = new RegExp(`case ['"]${text}['"]:[\\s\\S]*?break;`, 'g');
                    if (!regex.test(data)) return m.reply("Case non trouvé.");
                    const cleaned = data.replace(regex, '');
                    fs.writeFile(file, cleaned, 'utf8', (err) => {
                        if (err) return m.reply("Erreur d'écriture.");
                        m.reply(`✅ Case supprimé.\n\nCRÉÉ PAR KAYA`);
                    });
                });
                break;

            default:
    await kaya.sendMessage(m.chat, { react: { text: "❌", key: m.key } });

    const messageErreur = `🚫 *Commande inconnue !*
    
🛠 *Utilisez:* *.menu* 
📋 *Pour afficher la liste complète des commandes disponibles.*

🤖 *KAYA-MD BOT SYSTEM*
━━━━━━━━━━━━━━━
*CRÉÉ PAR KAYA 🔥*`;

    await kaya.sendMessage(m.key.remoteJid, {
        image: { url: "" },
        caption: messageErreur
    });
    break;
        }
    } catch (err) {
        kaya.sendMessage("243993621718@s.whatsapp.net", { text: "Erreur détectée :\n" + util.format(err) });
        console.log(chalk.red("❌ ERREUR:\n"), err);
    }
}