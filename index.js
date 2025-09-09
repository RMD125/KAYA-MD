// ==================== index.js ====================
global.groupSettings = {};
global.menuState = {};
global.groupCache = {}; // cache des métadonnées groupes

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const pino = require('pino');
const crypto = require('crypto');
globalThis.crypto = crypto.webcrypto;

// Import config
const config = require('./config');
global.PREFIX = config.PREFIX;
global.owner = [config.OWNER_NUMBER];
global.SESSION_ID = config.SESSION_ID;

// ================= MegaJS =================
let File;
try {
    File = require('megajs').File;
} catch {
    const { execSync } = require('child_process');
    console.log('📦 Installation de megajs...');
    execSync('npm install megajs', { stdio: 'inherit' });
    File = require('megajs').File;
}

// ----------------- Charger groupes AntiLink -----------------
const antiLinkFile = path.join(__dirname, './data/antiLinkGroups.json');
global.antiLinkGroups = new Set(
    fs.existsSync(antiLinkFile)
        ? JSON.parse(fs.readFileSync(antiLinkFile, 'utf-8'))
        : []
);

// ================= Handlers =================
const handleCommand = require('./handler');
const { default: makeWASocket, useMultiFileAuthState, jidDecode } = require('@whiskeysockets/baileys');
const { smsg, sleep } = require('./system/func');
const checkAdminOrOwner = require('./utils/checkAdmin');

// Commandes supplémentaires
const welcomeCmd = require('./commands/welcome');
const byeCmd = require('./commands/bye');
const antiPromoteCmd = require('./commands/antipromote');
const antiDemoteCmd = require('./commands/antidemote');

// ----------------- Session -----------------
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// ================= Charger session depuis Mega =================
async function loadSessionFromMega() {
    try {
        if (!global.SESSION_ID.startsWith('kaya~')) return false;
        const [fileID, key] = global.SESSION_ID.replace('kaya~', '').split('#');
        if (!fileID || !key) throw new Error('❌ SESSION_ID invalide');

        console.log(`◆ Tentative de téléchargement Mega : fileID=${fileID}, key=${key}`);
        const url = `https://mega.nz/file/${fileID}#${key}`;

        const file = File.fromURL(url);
        await file.loadAttributes();

        const data = await new Promise((resolve, reject) => {
            file.download((err, d) => (err ? reject(err) : resolve(d)));
        });

        await fs.promises.writeFile(credsPath, data);
        console.log('✅ Session téléchargée et sauvegardée localement (creds.json).');
        return true;
    } catch (err) {
        console.error('❌ Erreur lors du téléchargement depuis Mega :', err);
        console.warn('⚠️ Le bot continuera avec une session locale.');
        return false;
    }
}

// ================= Lancer le bot =================
async function StartBot() {
    try {
        if (!fs.existsSync(credsPath)) {
            const loaded = await loadSessionFromMega();
            if (!loaded) console.log('⚠️ Aucun creds.json trouvé, le bot créera une session locale.');
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const Kaya = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            printQRInTerminal: false,
            browser: ['KAYA-MD', 'Safari', '3.3'],
        });

        Kaya.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                const decode = jidDecode(jid) || {};
                return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
            }
            return jid;
        };

        // ================= Connexion =================
        Kaya.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
            if (connection === 'open') {
                console.log(chalk.green('✅ Bot connecté !'));
                const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
                const message = `
╭────────────────────────╮
│       🤖 KAYA-MD       │
├────────────────────────┤
│ 👦 Développeur : ${config.OWNER_NUMBER}
│ 🏷️ Nom du Bot : 𝗞𝗔𝗬𝗔-𝗠𝗗 v1.3.5
│ 💠 Préfixe : ${config.PREFIX}
│ 🕰️ Fuseau horaire : ${config.TIMEZONE}
╰────────────────────────╯
╭─🌐 COMMUNAUTÉ─╮
│ 👥 Groupe WhatsApp : ${config.LINKS.group}
│ 📣 Channel WhatsApp : ${config.LINKS.chanel}
│ 📬 Canal Telegram : ${config.LINKS.telegram}
╰────────────────╯`;
                try { await Kaya.sendMessage(ownerJid, { text: message }); } 
                catch (err) { console.error('❌ Impossible d’envoyer le message de bienvenue :', err); }
            }
            if (connection === 'close') {
                console.log(chalk.yellow('⚠️ Déconnecté, reconnexion dans 5s...'));
                await sleep(5000);
                StartBot();
            }
        });

        // ================= Messages =================
        Kaya.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            for (const msg of messages) {
                if (!msg?.message) continue;
                const m = smsg(Kaya, msg);

                try {
                    // -------- Anti-Link --------
                    if (m.isGroup && global.antiLinkGroups.has(m.chat)) {
                        const text = m.body || m.message?.conversation || '';
                        const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[0-9]+|t\.me\/[^\s]+)/gi;

                        if (linkRegex.test(text)) {
                            let participants = global.groupCache[m.chat]?.participants || [];
                            if (!participants.length) {
                                try {
                                    const metadata = await Kaya.groupMetadata(m.chat);
                                    participants = metadata.participants || [];
                                    global.groupCache[m.chat] = { metadata, participants };
                                } catch (e) {
                                    console.error('❌ Impossible de récupérer participants pour anti-link:', e);
                                }
                            }

                            const senderCheck = await checkAdminOrOwner(Kaya, m.chat, m.sender, participants);

                            if (!senderCheck.isAdminOrOwner) {
                                try { await Kaya.sendMessage(m.chat, { delete: msg.key }); } 
                                catch (e) { console.error('❌ Impossible de supprimer le message:', e); }

                                await Kaya.sendMessage(m.chat, {
                                    text: `🚫 @${m.sender.split('@')[0]}, les liens sont interdits !`,
                                    mentions: [m.sender],
                                });
                                continue;
                            }
                        }
                    }

                    // -------- Commandes --------
                    await handleCommand(Kaya, m, msg, undefined); // store n'est plus nécessaire

                } catch (err) { console.error('❌ Message error:', err); }
            }
        });

        // ================= Participants update =================
        Kaya.ev.on('group-participants.update', async (update) => {
            try {
                const chatId = update.id;
                if (typeof welcomeCmd?.participantUpdate === 'function') await welcomeCmd.participantUpdate(Kaya, update);
                if (typeof byeCmd?.participantUpdate === 'function') await byeCmd.participantUpdate(Kaya, update);
                if (typeof antiPromoteCmd?.participantUpdate === 'function') await antiPromoteCmd.participantUpdate(Kaya, update);
                if (typeof antiDemoteCmd?.participantUpdate === 'function') await antiDemoteCmd.participantUpdate(Kaya, update);

                if (update?.participants?.length) {
                    const metadata = await Kaya.groupMetadata(chatId);
                    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
                    global.groupSettings[chatId] = global.groupSettings[chatId] || {};
                    global.groupSettings[chatId].admins = admins;
                    global.groupCache[chatId] = { metadata, participants: metadata.participants };
                }
            } catch (err) { console.error('❌ group-participants.update error:', err); }
        });

        Kaya.ev.on('creds.update', saveCreds);

        return Kaya;

    } catch (err) {
        console.error('❌ StartBot error:', err);
        process.exit(1);
    }
}

// ================= Execute =================
StartBot();