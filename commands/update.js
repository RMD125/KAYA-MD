import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import decodeJid from '../utils/decodeJid.js';
import config from '../config.js';

export default {
  name: 'update',
  description: 'Met à jour le bot depuis GitHub',
  category: 'Bot',
  ownerOnly: true, // Seul le propriétaire peut l’exécuter
  run: async (kaya, m, msg, store, args) => {
    const chatId = m.chat;
    const sender = decodeJid(m.sender);

    const owners = config.OWNER_NUMBER.split(',').map(o =>
      o.includes('@') ? o.trim() : `${o.trim()}@s.whatsapp.net`
    );
    if (!owners.includes(sender)) {
      return kaya.sendMessage(chatId, { text: '🚫 Seul le propriétaire peut mettre à jour le bot.' }, { quoted: msg });
    }

    try {
      await kaya.sendMessage(chatId, { text: '🔄 Vérification des mises à jour...' }, { quoted: msg });

      const REPO_URL = 'https://github.com/Kaya2005/KAYA-MD.git';
      const BOT_DIR = process.cwd();

      // Vérifier la dernière version GitHub
      const latestCommit = execSync(`git ls-remote ${REPO_URL} refs/heads/main`).toString().split('\t')[0];
      let localCommit = '';
      try {
        localCommit = execSync('git rev-parse HEAD', { cwd: BOT_DIR }).toString().trim();
      } catch {}

      if (localCommit === latestCommit) {
        return kaya.sendMessage(chatId, { text: '✅ Le bot est déjà à jour.' }, { quoted: msg });
      }

      // Mettre à jour tous les fichiers depuis GitHub
      kaya.sendMessage(chatId, { text: '📦 Mise à jour du bot en cours...' }, { quoted: msg });
      execSync(`git fetch && git reset --hard origin/main`, { cwd: BOT_DIR, stdio: 'inherit' });

      kaya.sendMessage(chatId, { text: '✅ Mise à jour terminée. Redémarrage...' }, { quoted: msg });

      // Redémarrage du bot
      process.exit(0);

    } catch (err) {
      console.error(err);
      return kaya.sendMessage(chatId, { text: '❌ Une erreur est survenue pendant la mise à jour.' }, { quoted: msg });
    }
  }
};