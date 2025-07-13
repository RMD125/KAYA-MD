global.groupSettings = {};
const handleCommand = require('./handler');
require('./system/config');
const { Boom } = require('@hapi/boom');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, jidDecode, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Buffer } = require('buffer');
const pino = require('pino');
const FileType = require('file-type');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const chalk = require('chalk');
const readline = require('readline');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
globalThis.crypto = crypto.webcrypto;
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./system/kaya-md');
const { smsg, fetchJson, await: awaitfunc, sleep } = require('./system/func');

// Configuration globale
// Initialisation du store
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const usePairingCode = true;

// ==============================================
// SYSTÈME ANTI-SPAM INTÉGRÉ (CORRIGÉ)
// ==============================================
class AntiSpamSystem {
    constructor(Kaya) {
        this.Kaya = Kaya;
        this.userMessageCount = new Map();
        this.blockedUsers = new Map();
        this.suspiciousChars = /[\uA9FE\uA9F9\uA9FD\u202E\u202D]/g;
        this.linkRegex = /(https?:\/\/[^\s]+|wa\.me|whatsapp\.com)/gi;
    }

    async handleMessage(m) {
        try {
            const sender = m.key.remoteJid;
            if (!sender || m.key.fromMe) return false;

            if (this.blockedUsers.has(sender)) {
                await this.ask.sendMessage(sender, { 
                    text: "🚨 Vous êtes bloqué pour spam !" 
                });
                return true;
            }

            const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            
            // Détection flood
            const count = (this.userMessageCount.get(sender) || 0) + 1;
            this.userMessageCount.set(sender, count);
            if (count >= 20) {
                await this.punishUser(m, "FLOOD (6+ messages)");
                return true;
            }

            // Caractères suspects
            if (this.suspiciousChars.test(text)) {
                await this.punishUser(m, "CARACTÈRES MALVEILLANTS");
                return true;
            }

            // Détection liens spam
            const links = text.match(this.linkRegex) || [];
            if (links.length >= 2) {
                await this.punishUser(m, "LIENS SUSPECTS");
                return true;
            }

            return false;
        } catch (error) {
            console.error('AntiSpam Error:', error);
            return false;
        }
    }

    async punishUser(m, reason) {
        const sender = m.key.remoteJid;
        try {
            // 1. Supprimer le message
            await this.deleteMessage(m);

            // 2. Bloquer l'utilisateur
            await this.ask.updateBlockStatus(sender, "block");
            this.blockedUsers.set(sender, true);

            // 3. Envoyer un avertissement
            await this.ask.sendMessage(sender, { 
                text: `🚨 *VOUS ÊTES BLOQUÉ* 🚨\n\n` +
                      `Raison: ${reason}\n` +
                      `Vous ne pouvez plus contacter ce bot.\n` +
                      `Contactez l'admin pour déblocage.`
            });

            console.log(chalk.red(`[ANTI-SPAM] ${sender} bloqué pour: ${reason}`));
        } catch (error) {
            console.error('Erreur punishUser:', error);
        }
    }

    async deleteMessage(m) {
        try {
            await this.Kaya.sendMessage(m.key.remoteJid, {
                delete: {
                    remoteJid: m.key.remoteJid,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });
        } catch (error) {
            console.error('Erreur deleteMessage:', error);
        }
    }

    resetCounter(jid) {
        this.userMessageCount.delete(jid);
    }
}

// ==============================================
// FONCTIONS UTILITAIRES
// ==============================================
const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

async function getBuffer(url) {
    try {
        const response = await fetch(url);
        return await response.buffer();
    } catch (e) {
        console.error("Erreur getBuffer:", e);
        return null;
    }
}

async function getProfilePicture(jid, type = 'image') {
    try {
        const url = await ask.profilePictureUrl(jid, type);
        return url || (type === 'user' 
            ? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
            : 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png');
    } catch (e) {
        console.error('Erreur getProfilePicture:', e);
        return type === 'user' 
            ? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
            : 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png';
    }
}

function loadGroupSettings() {
    try {
        return JSON.parse(fs.readFileSync('./system/database/groupSettings.json'));
    } catch (e) {
        console.error('Erreur groupSettings:', e);
        return {};
    }
}

// ==============================================
// AFFICHAGE INITIAL
// ==============================================
console.log(chalk.red.bold(`\n🚀 CRÉÉ PAR DEV KAYA\n`));

console.log(chalk.white.bold(`
 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐔𝐄 𝐃𝐀𝐍𝐒 𝐋𝐄 𝐁𝐎𝐓 𝐊𝐀𝐘𝐀 - 𝐌𝐃 🤖
══════════════════════════════════════════════
⚠️ 𝟐𝟎𝟐𝟓 • 𝐁𝐎𝐓 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 *𝐊𝐀𝐘𝐀*
══════════════════════════════════════════════
🌐 *Base :* 𝗞𝗔𝗬𝗔-𝗠𝗗
🐛 *Type :* Bot MD 

📊 ${chalk.green.bold("Infos système :")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️  Plateforme       : ${os.platform()}
🏗️  Architecture     : ${os.arch()}
⚙️  Modèle CPU       : ${os.cpus()[0].model}
💾  Mémoire Totale   : ${(os.totalmem() / 1024 / 1024).toFixed(2)} Mo
📉  Mémoire Libre    : ${(os.freemem() / 1024 / 1024).toFixed(2)} Mo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Bot KAYA-MD initialisé avec succès ✅*
`));
// ==============================================
// FONCTION PRINCIPALE STARTBOT (CORRIGÉE)
// ==============================================
async function StartBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const Kaya = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // Initialisation des systèmes
    const antiSpam = new AntiSpamSystem(Kaya);
    
    
// ✅ 🔁 Anti-promotion handler : ajout ici  
require('./system/antipromote-handler')(Kaya);  
require('./system/antirevoque-handler')(Kaya);  

    // Gestion de la connexion
    if (!Kaya.authState.creds.registered) {
        console.log(chalk.blue("Entrez votre numéro, sans le plus (+) exemple: 243"));
        const phoneNumber = await question(chalk.blue('📱 Votre Numéro\n> '));
        const customPairingCode = "KAYAXMD1";
        console.log(chalk.blue("⏳ Patientez un instant pour récupérer un code de connexion..."));
        try {
            const code = await Kaya.requestPairingCode(phoneNumber.trim(), customPairingCode);
            console.log(chalk.red.bold(`✅ Votre code de connexion : ${code}`));
        } catch (error) {
            console.log(chalk.red("❌ Impossible de récupérer le code, essayez de mettre un numéro valide..."));
        }
    }

    // Écouteur d'événement pour les mises à jour de connexion
    Kaya.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
        // Suivre la newsletter
        Kaya.newsletterFollow("120363401251267400@newsletter");

        // Message de démarrage du bot avec image et menu stylisé
        Kaya.sendMessage(Kaya.user.id, {
            image: { url: "https://files.catbox.moe/rcid1h.jpeg" },
            caption: `
╭━━━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗  〕━━━━╮
┃👦 *Développeur* : +243993621718
┃🤖 *Nom du Bot* : 𝗞𝗔𝗬𝗔-𝗠𝗗 v1.3.5
┃🧾 *Commandes* : 47 disponibles
┃💠 *Préfixe* : ${global.prefix}
┃🧠 *Créé par* : 𝗞𝗔𝗬𝗔
╰━━━━━━━━━━━━━━━━━━━╯

╭─〔 🌐 𝗖𝗢𝗠𝗠𝗨𝗡𝗔𝗨𝗧É 〕─╮
┃👥 *Groupe WhatsApp*
┃🔗 ${global.group}
┃
┃📣 *Channel WhatsApp*
┃🔗 ${global.chanel}
┃
┃📬 *Canal Telegram*
┃🔗 ${global.telegram}
╰━━━━━━━━━━━━━━━━━━━╯

╭─────❖ *MENU PRINCIPAL* ❖─────╮
➤ Tapez *.menu* pour voir toutes les commandes
╰──────────────────────────────╯`
            });
            console.log(chalk.green('Bot connected!'));
        } else if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.badSession) {
                console.warn(`Mauvaise session, supprimez la session et scannez à nouveau.`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.warn('Connexion fermée, tentative de reconnexion...');
                await sleep(5000);
                StartBot();
            } else if (reason === DisconnectReason.connectionLost) {
                console.warn('Connexion perdue, tentative de reconnexion...');
                await sleep(5000);
                StartBot();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.warn('Session remplacée, déconnexion...');
                Kaya.logout();
            } else if (reason === DisconnectReason.loggedOut) {
                console.warn('Déconnecté, veuillez scanner à nouveau.');
                Kaya.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.warn('Redémarrage requis, redémarrage...');
                await StartBot();
            } else if (reason === DisconnectReason.timedOut) {
                console.warn('Connexion expirée, tentative de reconnexion...');
                await sleep(5000);
                StartBot();
            } else {
                console.warn('Connexion fermée sans raison spécifique, tentative de reconnexion...');
                await sleep(5000);
                StartBot();
            }
        } else if (connection === "connecting") {
            console.warn('Connexion en cours...');
        }
    });

    Kaya.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            const msg = messages[0] || messages[messages.length - 1];
            if (type !== "notify") return;
            if (!msg?.message) return;

            if (msg.key && msg.key.remoteJid === "status@broadcast") {
                await Kaya.readMessages([msg.key]);
                await Kaya.sendMessage(msg.key.remoteJid, { react: { text: "❤️", key: msg.key }});
                return;
            }

            if (await antiSpam.handleMessage(msg)) return;

            const m = smsg(Kaya, msg, store);
            require(`./handler`)(Kaya, m, msg, store);

            if (msg.key.fromMe) antiSpam.resetCounter(msg.key.remoteJid);

        } catch (err) {
            console.error('Erreur dans messages.upsert:', err);
        }
    });

    Kaya.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer = options && (options.packname || options.author) ? await writeExifImg(buff, options) : await imageToWebp(buff);
        await Kaya.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    Kaya.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer = options && (options.packname || options.author) ? await writeExifVid(buff, options) : await videoToWebp(buff);
        await Kaya.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    Kaya.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    Kaya.sendTextWithMentions = async (jid, text, quoted, options = {}) => Kaya.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted });

    Kaya.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype 
            ? message.mtype.replace(/Message/gi, '') 
            : mime.split('/')[0]

        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }

    const welcomeCmd = require('./commands/welcome');
    const byeCmd = require('./commands/bye');

// Écoute des mises à jour de participants dans les groupes
Kaya.ev.on('group-participants.update', async update => {
  try {
    if (typeof welcomeCmd.participantUpdate === 'function') {
      await welcomeCmd.participantUpdate(Kaya, update);
    }

    if (typeof byeCmd.participantUpdate === 'function') {
      await byeCmd.participantUpdate(Kaya, update);
    }
  } catch (e) {
    console.error('❌ Erreur dans group-participants.update :', e);
  }
});
  

Kaya.ev.on('messages.upsert', async ({ messages }) => {
  try {
    const msg = messages[0];
    if (!msg || !msg.key || !msg.key.remoteJid) return;
    
const typingPath = path.join(__dirname, 'data', 'typing.json'); // ⚠️ ajuste le chemin si besoin


    // ✅ Lire le statut "typing" depuis le fichier
    let typingData = { enabled: false };
    if (fs.existsSync(typingPath)) {
      typingData = JSON.parse(fs.readFileSync(typingPath));
    }

    if (typingData.enabled) {
      await Kaya.sendPresenceUpdate('composing', msg.key.remoteJid);
      await new Promise(resolve => setTimeout(resolve, 100000)); // 5 secondes "en train d'écrire"
      await Kaya.sendPresenceUpdate('paused', msg.key.remoteJid);
    }

  } catch (err) {
    console.error('❌ Erreur dans messages.upsert (typing):', err);
  }
});

Kaya.ev.on('messages.upsert', async ({ messages }) => {
  try {
    const msg = messages[0];
    if (!msg || !msg.key || !msg.key.remoteJid) return;

    // 🔁 Charger l’état de recording
    const recordingFile = path.join(__dirname, 'data', 'recording.json');
    let recordingData = { enabled: false };

    if (fs.existsSync(recordingFile)) {
      const rawData = fs.readFileSync(recordingFile);
      recordingData = JSON.parse(rawData);
    }

    // ⚠️ Vérifie si le mode recording est activé avant de l’envoyer
    if (recordingData.enabled) {
      await Kaya.sendPresenceUpdate('recording', msg.key.remoteJid);
      await new Promise(resolve => setTimeout(resolve, 100000)); // sleep 10s
      await Kaya.sendPresenceUpdate('paused', msg.key.remoteJid);
    }

  } catch (err) {
    console.error('❌ Erreur dans messages.upsert (recording):', err);
  }
});
    Kaya.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    Kaya.sendText = (jid, text, quoted = '', options) => Kaya.sendMessage(jid, { text: text, ...options }, { quoted });

    Kaya.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = Kaya.decodeJid(contact.id);
            if (store && store.contacts) {
                store.contacts[id] = { id, name: contact.notify };
            }
        }
    });

    Kaya.ev.on('creds.update', saveCreds);
    return Kaya;
}

StartBot().catch(err => {
    console.error('Erreur dans StartBot:', err);
    process.exit(1);
});
