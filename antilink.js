// commands/antilink.js
import fs from "fs";
import path from "path";
import { contextInfo } from "../utils/contextInfo.js";
import checkAdminOrOwner from "../utils/checkAdmin.js";

const antiLinkFile = path.join(process.cwd(), "data/antiLinkGroups.json");

// Charger depuis fichier
function loadAntiLinkGroups() {
  if (!fs.existsSync(antiLinkFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(antiLinkFile, "utf-8"));
  } catch {
    return {};
  }
}

// Sauvegarde
function saveAntiLinkGroups(groups) {
  fs.writeFileSync(antiLinkFile, JSON.stringify(groups, null, 2));
}

// Initialisation globale
if (!global.antiLinkGroups) global.antiLinkGroups = loadAntiLinkGroups();
if (!global.userWarns) global.userWarns = {}; // suivi des avertissements

export default {
  name: "antilink",
  description: "Anti-link avec options delete, warn ou kick",
  category: "Groupe",
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

      const action = args[0]?.toLowerCase();

      if (!action || !["on", "off", "delete", "warn", "kick"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚙️ Usage :\n- .antilink on\n- .antilink off\n- .antilink delete\n- .antilink warn\n- .antilink kick", contextInfo },
          { quoted: m }
        );
      }

      // Vérification admin/owner
      const check = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!check.isAdminOrOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver ou changer le mode.", contextInfo },
          { quoted: m }
        );
      }

      // ==================== Actions ====================
      if (action === "on") {
        global.antiLinkGroups[m.chat] = { enabled: true, mode: "warn" };
        saveAntiLinkGroups(global.antiLinkGroups);
        return kaya.sendMessage(m.chat, { text: "✅ *Anti-link activé !* (mode par défaut : warn)", contextInfo }, { quoted: m });
      }

      if (action === "off") {
        delete global.antiLinkGroups[m.chat];
        saveAntiLinkGroups(global.antiLinkGroups);
        return kaya.sendMessage(m.chat, { text: "❌ *Anti-link désactivé* pour ce groupe.", contextInfo }, { quoted: m });
      }

      if (["delete", "warn", "kick"].includes(action)) {
        if (!global.antiLinkGroups[m.chat]) global.antiLinkGroups[m.chat] = { enabled: true };
        global.antiLinkGroups[m.chat].enabled = true;
        global.antiLinkGroups[m.chat].mode = action;
        saveAntiLinkGroups(global.antiLinkGroups);
        return kaya.sendMessage(
          m.chat,
          { text: `✅ Mode *${action.toUpperCase()}* activé pour l’anti-link.`, contextInfo },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error("Erreur antilink.js :", err);
      await kaya.sendMessage(m.chat, { text: "❌ Impossible de modifier l’anti-link.", contextInfo }, { quoted: m });
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup) return;
      const chatId = m.chat;
      const body = m.text || m.message?.conversation || "";

      if (!global.antiLinkGroups?.[chatId]?.enabled) return;

      const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[0-9]+|t\.me\/[^\s]+)/gi;
      if (!linkRegex.test(body)) return;

      const sender = m.sender;
      const metadata = await kaya.groupMetadata(chatId);
      const participants = metadata.participants || [];
      const check = await checkAdminOrOwner(kaya, chatId, sender, participants);

      if (check.isAdminOrOwner) return;

      // Supprime le message du lien
      try { await kaya.sendMessage(chatId, { delete: m.key }); } catch {}

      const mode = global.antiLinkGroups[chatId].mode || "warn";

      if (mode === "kick") {
        await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        return kaya.sendMessage(chatId, { text: `👢 @${sender.split("@")[0]} expulsé pour lien interdit !`, mentions: [sender], contextInfo });
      }

      if (mode === "warn") {
        if (!global.userWarns[chatId]) global.userWarns[chatId] = {};
        if (!global.userWarns[chatId][sender]) global.userWarns[chatId][sender] = 0;

        global.userWarns[chatId][sender]++;

        if (global.userWarns[chatId][sender] >= 4) {
          delete global.userWarns[chatId][sender];
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
          return kaya.sendMessage(chatId, { text: `🚫 @${sender.split("@")[0]} expulsé après 4 avertissements !`, mentions: [sender], contextInfo });
        }

        return kaya.sendMessage(chatId, { text: `⚠️ @${sender.split("@")[0]}, lien interdit ! (avertissement ${global.userWarns[chatId][sender]}/4)`, mentions: [sender], contextInfo });
      }

      if (mode === "delete") {
        return kaya.sendMessage(chatId, { text: `🗑️ Lien supprimé. @${sender.split("@")[0]}, évite d’envoyer des liens.`, mentions: [sender], contextInfo });
      }
    } catch (err) {
      console.error("Erreur détecteur AntiLink :", err);
    }
  },
};