/// ✅ Protection contre double chargement (doit être en tout premier)
if (global.__antipromote_handler_loaded__) return;
global.__antipromote_handler_loaded__ = true;

const fs = require('fs');
const path = require('path');
const config = require('../system/config'); // ← Corrigé ici
const { markAction, wasRecentlyActed } = require('./actionTracker');

const antipromotePath = path.join(__dirname, '../data/antipromote.json');
// 🔁 Liste temporaire des promotions faites par le bot anti-révoque
const lastRevoqueByBot = new Set();

function loadAntipromoteData() {
  if (!fs.existsSync(antipromotePath)) fs.writeFileSync(antipromotePath, '{}');
  return JSON.parse(fs.readFileSync(antipromotePath));
}

module.exports = (conn) => {
  // Connexion croisée : permettre à antirevoque-handler d’injecter sa liste
  if (!conn.lastRevoqueByBot) conn.lastRevoqueByBot = lastRevoqueByBot;

  conn.ev.on('group-participants.update', async (update) => {
    const { id: groupId, participants, action } = update;

    if (action !== 'promote') return;

    const data = loadAntipromoteData();
    if (!data[groupId]) return;

    for (const user of participants) {
      const number = user.split('@')[0];
      const isOwner = config.owner.includes(number);
      const isBot = user === conn.user.id;

      // 🛑 Ignore si c’est une promo faite par anti-révoque
      if (conn.lastRevoqueByBot?.has(user)) {
        conn.lastRevoqueByBot.delete(user);
        continue;
      }

      // 🛑 Ignore si owner ou bot
      if (isOwner || isBot) continue;

      // 🛑 Ignore si récemment rétrogradé/promu
      if (wasRecentlyActed(groupId, user, 'promote') || wasRecentlyActed(groupId, user, 'demote')) continue;

      try {
        await conn.groupParticipantsUpdate(groupId, [user], 'demote');
        markAction(groupId, user, 'demote');

        await conn.sendMessage(groupId, {
          text: `⚠️ *Anti-promotion actif*\n@${number} a été automatiquement rétrogradé.`,
          mentions: [user]
        });
      } catch (err) {
        console.error('❌ Erreur anti-promotion :', err);
      }
    }
  });
};