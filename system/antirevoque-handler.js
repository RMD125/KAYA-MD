// ✅ Protection contre double chargement (tout en haut)
if (global.__antirevoque_handler_loaded__) return;
global.__antirevoque_handler_loaded__ = true;

const fs = require('fs');
const path = require('path');
const config = require('../system/config'); // ✅ Corrigé ici
const { markAction, wasRecentlyActed } = require('./actionTracker');

const antirevoquePath = path.join(__dirname, '../data/antirevoque.json');
// 🔁 Liste temporaire pour éviter conflit avec anti-promotion
const lastRevoqueByBot = new Set();

function loadAntirevoqueData() {
  if (!fs.existsSync(antirevoquePath)) fs.writeFileSync(antirevoquePath, '{}');
  return JSON.parse(fs.readFileSync(antirevoquePath));
}

module.exports = (conn) => {
  // Injecte la mémoire pour antipromote-handler
  if (!conn.lastRevoqueByBot) conn.lastRevoqueByBot = lastRevoqueByBot;

  conn.ev.on('group-participants.update', async (update) => {
    const { id: groupId, participants, action } = update;

    if (action !== 'demote') return;

    const data = loadAntirevoqueData();
    if (!data[groupId]) return;

    for (const user of participants) {
      const number = user.split('@')[0];
      const isOwner = config.owner.includes(number);
      const isBot = user === conn.user.id;

      // Ignore owner et bot
      if (isOwner || isBot) continue;

      // Ignore si récemment promu/dégradé
      if (wasRecentlyActed(groupId, user, 'demote') || wasRecentlyActed(groupId, user, 'promote')) continue;

      try {
        // 🔐 Mémoriser la promotion faite par l'anti-révoque
        conn.lastRevoqueByBot?.add(user);

        await conn.groupParticipantsUpdate(groupId, [user], 'promote');
        markAction(groupId, user, 'promote');

        await conn.sendMessage(groupId, {
          text: `⚠️ *Anti-révoque actif*\n@${number} a été automatiquement re-promu.`,
          mentions: [user]
        });
      } catch (err) {
        console.error('❌ Erreur anti-révoque :', err);
      }
    }
  });
};