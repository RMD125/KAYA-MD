const fs = require("fs");
const path = require("path");
const checkAdminOrOwner = require("../utils/checkAdmin");
const { contextInfo } = require("../utils/contextInfo"); // ← import contextInfo global

const antiDemoteFile = path.join(__dirname, "../data/antidemote.json");

// Charger ou créer le fichier
let antiDemoteData = {};
try {
  antiDemoteData = JSON.parse(fs.readFileSync(antiDemoteFile, "utf-8"));
} catch {
  antiDemoteData = {};
  fs.writeFileSync(antiDemoteFile, "{}");
}

function saveAntiDemote() {
  fs.writeFileSync(antiDemoteFile, JSON.stringify(antiDemoteData, null, 2));
}

// Set pour éviter les boucles
const processing = new Set();

module.exports = {
  name: "antidemote",
  description: "🚫 Empêche de retirer les admins (re-nomme automatiquement)",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

      if (!permissions.isAdminOrOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Seuls les admins ou owners peuvent utiliser cette commande.", contextInfo },
          { quoted: m }
        );
      }

      if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Utilisation : .antidemote on / off", contextInfo },
          { quoted: m }
        );
      }

      if (args[0].toLowerCase() === "on") {
        antiDemoteData[m.chat] = true;
        saveAntiDemote();
        return kaya.sendMessage(
          m.chat,
          { text: "✅ *AntiDemote activé* : les admins seront automatiquement renommés si on les retire.", contextInfo },
          { quoted: m }
        );
      } else {
        delete antiDemoteData[m.chat];
        saveAntiDemote();
        return kaya.sendMessage(
          m.chat,
          { text: "❌ *AntiDemote désactivé* pour ce groupe.", contextInfo },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error("Erreur antidemote.js :", err);
    }
  },

  participantUpdate: async (kaya, update) => {
    try {
      const { id: chatId, participants, action, byBot } = update;

      if (!antiDemoteData[chatId]) return;
      if (action !== "demote") return;
      if (byBot) return; // Ignore les actions générées par le bot

      for (const user of participants) {
        if (processing.has(user)) continue; // Ignorer si déjà traité

        processing.add(user);
        try {
          await kaya.groupParticipantsUpdate(chatId, [user], "promote", { byBot: true });
          await kaya.sendMessage(chatId, {
            text: `⚠️ *AntiDemote actif*\n@${user.split("@")[0]} a été re-promu automatiquement.`,
            mentions: [user],
            contextInfo
          });
        } catch (e) {
          console.error("Erreur antiDemote participantUpdate:", e);
        } finally {
          setTimeout(() => processing.delete(user), 2000);
        }
      }
    } catch (err) {
      console.error("Erreur antiDemote global:", err);
    }
  }
};