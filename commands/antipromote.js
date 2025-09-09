const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");
const { contextInfo } = require("../utils/contextInfo"); // ← import contextInfo global

const antiPromoteFile = path.join(__dirname, "../data/antipromote.json");

let antiPromoteData = {};
try {
  antiPromoteData = JSON.parse(fs.readFileSync(antiPromoteFile, "utf-8"));
} catch {
  antiPromoteData = {};
  fs.writeFileSync(antiPromoteFile, "{}");
}

function saveAntiPromote() {
  fs.writeFileSync(antiPromoteFile, JSON.stringify(antiPromoteData, null, 2));
}

// Set pour marquer les actions automatiques et éviter la boucle
const processing = new Set();

module.exports = {
  name: "antipromote",
  description: "🚫 Active ou désactive la protection contre la promotion automatique",
  category: "Sécurité",
  group: true,
  admin: true,

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) return kaya.sendMessage(m.chat, { text: '❌ Cette commande ne fonctionne que dans un groupe.', contextInfo }, { quoted: m });

    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

    if (!permissions.isAdminOrOwner) {
      return kaya.sendMessage(m.chat, { text: '🚫 Seuls les admins ou owners peuvent activer/désactiver cette protection.', contextInfo }, { quoted: m });
    }

    const chatId = m.chat;
    const subCmd = args[0]?.toLowerCase();

    if (subCmd === 'on') {
      antiPromoteData[chatId] = true;
      saveAntiPromote();
      return kaya.sendMessage(m.chat, { text: '✅ *AntiPromote activé* : toute promotion sera annulée automatiquement.', contextInfo }, { quoted: m });
    }

    if (subCmd === 'off') {
      delete antiPromoteData[chatId];
      saveAntiPromote();
      return kaya.sendMessage(m.chat, { text: '❌ *AntiPromote désactivé*.', contextInfo }, { quoted: m });
    }

    return kaya.sendMessage(m.chat, { text: '⚙️ Utilisation : `.antipromote on` ou `.antipromote off`', contextInfo }, { quoted: m });
  },

  participantUpdate: async (kaya, update) => {
    const { id: chatId, participants, action, byBot } = update;

    if (!antiPromoteData[chatId]) return;
    if (action !== "promote") return;
    if (byBot) return; // Ignore les actions générées par le bot

    for (const user of participants) {
      if (processing.has(user)) continue; // Ignore si déjà traité

      processing.add(user);
      try {
        await kaya.groupParticipantsUpdate(chatId, [user], "demote", { byBot: true });
        await kaya.sendMessage(chatId, {
          text: `🚫 *AntiPromote activé*\n@${user.split('@')[0]} a été rétrogradé automatiquement.`,
          mentions: [user],
          contextInfo
        });
      } catch (err) {
        console.error('Erreur antipromote auto:', err);
      } finally {
        // Retirer le marqueur après 2s pour éviter boucle infinie
        setTimeout(() => processing.delete(user), 2000);
      }
    }
  }
};