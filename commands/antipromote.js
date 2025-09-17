// ================= commands/antipromote.js =================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js"; // ← import contextInfo global

// 📂 Fichier de sauvegarde
const antiPromoteFile = path.join(process.cwd(), "data/antipromote.json");

// Charger ou créer le fichier
let antiPromoteData = {};
try {
  antiPromoteData = JSON.parse(fs.readFileSync(antiPromoteFile, "utf-8"));
} catch {
  antiPromoteData = {};
  fs.writeFileSync(antiPromoteFile, "{}");
}

// Sauvegarde
function saveAntiPromote() {
  fs.writeFileSync(antiPromoteFile, JSON.stringify(antiPromoteData, null, 2));
}

// Set pour éviter les boucles infinies
const processing = new Set();

export default {
  name: "antipromote",
  description: "🚫 Empêche la promotion automatique des membres",
  category: "Sécurité",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Cette commande fonctionne uniquement dans un groupe.", contextInfo },
          { quoted: m }
        );
      }

      // Vérifie admin ou owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isAdmin && !permissions.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’anti-promote.", contextInfo },
          { quoted: m }
        );
      }

      const chatId = m.chat;
      const action = args[0]?.toLowerCase();

      if (action === "on") {
        antiPromoteData[chatId] = true;
        saveAntiPromote();
        return kaya.sendMessage(
          m.chat,
          { text: "✅ *AntiPromote activé* : toute promotion sera automatiquement annulée.", contextInfo },
          { quoted: m }
        );
      }

      if (action === "off") {
        delete antiPromoteData[chatId];
        saveAntiPromote();
        return kaya.sendMessage(
          m.chat,
          { text: "❌ *AntiPromote désactivé* dans ce groupe.", contextInfo },
          { quoted: m }
        );
      }

      return kaya.sendMessage(
        m.chat,
        { text: "⚙️ Utilisation :\n`.antipromote on`\n`.antipromote off`", contextInfo },
        { quoted: m }
      );
    } catch (err) {
      console.error("Erreur antipromote.js :", err);
    }
  },

  participantUpdate: async (kaya, update) => {
    try {
      const { id: chatId, participants, action, byBot } = update;

      if (!antiPromoteData[chatId]) return;
      if (action !== "promote") return;
      if (byBot) return; // Ignore si c'est le bot qui agit

      for (const user of participants) {
        if (processing.has(user)) continue; // évite spam
        processing.add(user);

        try {
          await kaya.groupParticipantsUpdate(chatId, [user], "demote", { byBot: true });
          await kaya.sendMessage(chatId, {
            text: `🚫 *AntiPromote actif*\n@${user.split("@")[0]} a été rétrogradé automatiquement.`,
            mentions: [user],
            contextInfo,
          });
        } catch (err) {
          console.error("Erreur antipromote participantUpdate :", err);
        } finally {
          setTimeout(() => processing.delete(user), 2000); // reset après 2s
        }
      }
    } catch (err) {
      console.error("Erreur antipromote global:", err);
    }
  },
};