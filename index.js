// ==================== index.js ====================
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import pino from 'pino';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import config from './config.js';
import handleCommand from './handler.js';
import { smsg, sleep } from './system/func.js';
import checkAdminOrOwner from './utils/checkAdmin.js';
import welcomeCmd from './commands/welcome.js';
import byeCmd from './commands/bye.js';
import antiPromoteCmd from './commands/antipromote.js';
import antiDemoteCmd from './commands/antidemote.js';
import antilinkCmd from './commands/antilink.js';
import antispamCmd from './commands/antispam.js';
import makeWASocket, { jidDecode, useMultiFileAuthState } from '@whiskeysockets/baileys';

// ==================== ESM __dirname ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== Globals ====================
global.groupSettings = {};
global.menuState = {};
global.groupCache = {};
if (!globalThis.crypto?.subtle) globalThis.crypto = crypto.webcrypto;

global.PREFIX = config.PREFIX;
global.owner = [config.OWNER_NUMBER];
global.SESSION_ID = config.SESSION_ID;

// ==================== MegaJS ====================
let File;
try {
  const megajs = await import('megajs');
  File = megajs?.default?.File || megajs.File;
} catch {
  console.log('📦 Installation de megajs...');
  execSync('npm install megajs', { stdio: 'inherit' });
  const megajs = await import('megajs');
  File = megajs?.default?.File || megajs.File;
}

// ==================== AntiLink Groups ====================
const antiLinkFile = path.join(__dirname, './data/antiLinkGroups.json');
global.antiLinkGroups = fs.existsSync(antiLinkFile)
  ? JSON.parse(fs.readFileSync(antiLinkFile, 'utf-8'))
  : {};

// ==================== Session ====================
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// ==================== Charger session Mega ====================
async function loadSessionFromMega() {
  try {
    // ⚡ Ne télécharger que si creds.json n'existe pas
    if (fs.existsSync(credsPath)) {
      console.log("✅ Session locale déjà présente, pas besoin de retélécharger depuis Mega.");
      return false;
    }

    if (!global.SESSION_ID.startsWith('kaya~')) return false;
    const [fileID, key] = global.SESSION_ID.replace('kaya~', '').split('#');
    if (!fileID || !key) throw new Error('❌ SESSION_ID invalide');

    console.log(`◆ Tentative de téléchargement Mega : fileID=${fileID}, key=${key}`);
    const file = File.fromURL(`https://mega.nz/file/${fileID}#${key}`);
    await file.loadAttributes();
    const data = await new Promise((resolve, reject) =>
      file.download((err, d) => (err ? reject(err) : resolve(d)))
    );
    await fs.promises.writeFile(credsPath, data);
    console.log('✅ Session téléchargée et sauvegardée localement (creds.json).');
    return true;

  } catch (err) {
    console.warn('⚠️ Impossible de charger la session depuis Mega :', err);
    return false;
  }
}

// ==================== Lancer le bot ====================
async function StartBot() {
  try {
    // ⚡ Télécharger depuis Mega uniquement si nécessaire
    await loadSessionFromMega();

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const Kaya = makeWASocket({
      logger: pino({ level: 'silent' }),
      auth: state,
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

    // ==================== Connexion ====================
    Kaya.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.log(chalk.yellow('📱 QR Code reçu, scanne-le avec WhatsApp :'), qr);
      }

      if (connection === 'open') {
        console.log(chalk.green('✅ Bot connecté !'));
        const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
        const message = `
╭────────────────────────╮
│            KAYA-MD
├────────────────────────┤
│ 👦 Développeur : ${config.OWNER_NUMBER}
│ 🏷️ Nom du Bot : 𝗞𝗔𝗬𝗔-𝗠𝗗 v1
│ 💠 Préfixe : ${config.PREFIX}
│ 🕰️ Fuseau horaire : ${config.TIMEZONE}
╰────────────────────────╯
🌐 COMMUNAUTÉ
👥 Groupe WhatsApp : ${config.LINKS.group}
📣 Channel WhatsApp : ${config.LINKS.chanel}
📬 Canal Telegram : ${config.LINKS.telegram}
`;
        try { await Kaya.sendMessage(ownerJid, { text: message }); } catch (err) { console.error(err); }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode === 401) {
          fs.unlinkSync(credsPath);
          console.log('❌ Session invalide, creds.json supprimé, relancer le bot manuellement.');
        } else {
          console.log('⚠️ Bot déconnecté, attente automatique pour reconnexion...');
        }
      }
    });

    // ==================== Messages ====================
    Kaya.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (!msg?.message) continue;
        const m = smsg(Kaya, msg);
        try {
          await handleCommand(Kaya, m, msg, undefined);
        } catch (err) {
          console.error('❌ Message error:', err);
        }
      }
    });

    // ==================== Participants ====================
    Kaya.ev.on('group-participants.update', async (update) => {
      try {
        const chatId = update.id;
        if (typeof welcomeCmd?.participantUpdate === 'function') await welcomeCmd.participantUpdate(Kaya, update);
        if (typeof byeCmd?.participantUpdate === 'function') await byeCmd.participantUpdate(Kaya, update);
        if (typeof antiPromoteCmd?.participantUpdate === 'function') await antiPromoteCmd.participantUpdate(Kaya, update);
        if (typeof antiDemoteCmd?.participantUpdate === 'function') await antiDemoteCmd.participantUpdate(Kaya, update);

        if (update?.participants?.length) {
          const metadata = await Kaya.groupMetadata(chatId);
          const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
          global.groupSettings[chatId] = global.groupSettings[chatId] || {};
          global.groupSettings[chatId].admins = admins;
          global.groupCache[chatId] = { metadata, participants: metadata.participants };
        }
      } catch (err) { console.error(err); }
    });

    Kaya.ev.on('creds.update', saveCreds);

    return Kaya;

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// ==================== Execute ====================
StartBot();