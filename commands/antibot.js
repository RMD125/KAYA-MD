// commands/antibot.js
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js";

const antibotFile = path.join(process.cwd(), "data/antibotGroups.json");

// Charger les groupes avec antibot activé
function loadAntibotGroups() {
  if (!fs.existsSync(antibotFile)) return new Set();
  try {
    const groups = JSON.parse(fs.readFileSync(antibotFile, "utf-8"));
    return new Set(groups);
  } catch {
    return new Set();
  }
}

// Sauvegarder
function saveAntibotGroups(groups) {
  fs.writeFileSync(antibotFile, JSON.stringify([...groups], null, 4));
}

// Initialisation globale
if (!global.antibotGroups) global.antibotGroups = loadAntibotGroups();

export default {
  name: "antibot",
  description: "Active ou désactive la protection contre les bots dans le groupe",
  category: "Groupe",
  group: true,
  admin: true,

  run: async (kaya, m, msg, store, args) => {
    const chatId = m.chat;
    const action = args[0]?.toLowerCase();

    const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
    if (!permissions.isAdminOrOwner) {
      return kaya.sendMessage(
        chatId,
        { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’antibot.", contextInfo },
        { quoted: m }
      );
    }

    if (!action || !["on", "off"].includes(action)) {
      return kaya.sendMessage(
        chatId,
        { text: "⚙️ Usage: `.antibot on` ou `.antibot off`", contextInfo },
        { quoted: m }
      );
    }

    const antibotGroups = new Set(global.antibotGroups);

    if (action === "on") {
      antibotGroups.add(chatId);
      global.antibotGroups = antibotGroups;
      saveAntibotGroups(antibotGroups);

      return kaya.sendMessage(
        chatId,
        { text: "✅ *Antibot activé* : tous les messages automatiques seront supprimés, sauf ceux des admins et du bot.", contextInfo },
        { quoted: m }
      );
    } else {
      antibotGroups.delete(chatId);
      global.antibotGroups = antibotGroups;
      saveAntibotGroups(antibotGroups);

      return kaya.sendMessage(
        chatId,
        { text: "❌ *Antibot désactivé* dans ce groupe.", contextInfo },
        { quoted: m }
      );
    }
  },

  // 📌 Détection automatique
  detect: async (kaya, m) => {
    const chatId = m.chat;
    if (!global.antibotGroups || !global.antibotGroups.has(chatId)) return;

    const sender = m.sender;
    const body = m.text || m.message?.conversation || "";

    try {
      // Récupère les participants du groupe
      const metadata = await kaya.groupMetadata(chatId);
      const admins = metadata.participants
        .filter(p => p.admin || p.role === "admin" || p.role === "superadmin")
        .map(p => p.id.toLowerCase());

      // Si le message vient d'un admin ou du bot → ignore
      if (admins.includes(sender.toLowerCase()) || sender === kaya.user.id) return;

      // Si message suspect (réponse automatique ou bot) → supprimer
      if (body && body.length > 0) {
        await kaya.sendMessage(chatId, { delete: m.key });
        console.log(`🚫 Message bot supprimé dans ${chatId}: ${body.substring(0, 20)}...`);
      }
    } catch (err) {
      console.error("❌ Erreur antibot detect:", err);
    }
  }
};