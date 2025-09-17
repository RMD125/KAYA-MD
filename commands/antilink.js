import fs from "fs";
import path from "path";
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
if (!global.userWarns) global.userWarns = {};

export default {
  name: "antilink",
  description: "Anti-link sans mode par défaut",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(m.chat, { text: "❌ Cette commande fonctionne uniquement dans un groupe." }, { quoted: m });
      }

      const sender = m.sender;
      const chatId = m.chat;
      const action = args[0]?.toLowerCase();

      // Si pas d'action ou action invalide, afficher le menu texte
      if (!action || !["on", "off", "delete", "warn", "kick"].includes(action)) {
        return kaya.sendMessage(
          chatId,
          {
            text: `⚙️ Mode :\n- .antilink on\n- .antilink off\n- .antilink delete\n- .antilink warn\n- .antilink kick`
          },
          { quoted: m }
        );
      }

      // Vérification admin/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (!check.isAdminOrOwner) {
        return kaya.sendMessage(chatId, { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent changer le mode anti-link." }, { quoted: m });
      }

      // Actions
      if (action === "on") {
        // Active le groupe mais sans mode par défaut
        if (!global.antiLinkGroups[chatId]) global.antiLinkGroups[chatId] = { enabled: true };
        global.antiLinkGroups[chatId].enabled = true;
        saveAntiLinkGroups(global.antiLinkGroups);
        return kaya.sendMessage(chatId, { text: "✅ *Anti-link activé !*\nVeuillez choisir le mode : delete / warn / kick" }, { quoted: m });
      }

      if (action === "off") {
        delete global.antiLinkGroups[chatId];
        saveAntiLinkGroups(global.antiLinkGroups);
        return kaya.sendMessage(chatId, { text: "❌ *Anti-link désactivé* pour ce groupe." }, { quoted: m });
      }

      if (["delete", "warn", "kick"].includes(action)) {
        if (!global.antiLinkGroups[chatId]) global.antiLinkGroups[chatId] = { enabled: true };
        global.antiLinkGroups[chatId].mode = action;
        saveAntiLinkGroups(global.antiLinkGroups);
        return kaya.sendMessage(chatId, { text: `✅ Mode *${action.toUpperCase()}* activé pour l’anti-link.` }, { quoted: m });
      }

    } catch (err) {
      console.error("Erreur antilink.js :", err);
      return kaya.sendMessage(m.chat, { text: "❌ Impossible de modifier l’anti-link." }, { quoted: m });
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup) return;
      const chatId = m.chat;
      const body = m.text || m.message?.conversation || "";

      if (!global.antiLinkGroups?.[chatId]?.enabled) return;
      const mode = global.antiLinkGroups[chatId].mode;
      if (!mode) return; // Pas de mode choisi, ne rien faire

      const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[0-9]+|t\.me\/[^\s]+)/gi;
      if (!linkRegex.test(body)) return;

      const sender = m.sender;

      // Ignore admins et owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      // Supprime le message du lien
      try { await kaya.sendMessage(chatId, { delete: m.key }); } catch {}

      if (mode === "kick") {
        await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        return kaya.sendMessage(chatId, { text: `👢 @${sender.split("@")[0]} expulsé pour lien interdit !`, mentions: [sender] });
      }

      if (mode === "warn") {
        if (!global.userWarns[chatId]) global.userWarns[chatId] = {};
        if (!global.userWarns[chatId][sender]) global.userWarns[chatId][sender] = 0;

        global.userWarns[chatId][sender]++;
        if (global.userWarns[chatId][sender] >= 4) {
          delete global.userWarns[chatId][sender];
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
          return kaya.sendMessage(chatId, { text: `🚫 @${sender.split("@")[0]} expulsé après 4 avertissements !`, mentions: [sender] });
        }

        return kaya.sendMessage(chatId, { text: `⚠️ @${sender.split("@")[0]}, lien interdit ! (avertissement ${global.userWarns[chatId][sender]}/4)`, mentions: [sender] });
      }

      if (mode === "delete") {
        return kaya.sendMessage(chatId, { text: `🗑️ Lien supprimé. @${sender.split("@")[0]}, évite d’envoyer des liens.`, mentions: [sender] });
      }

    } catch (err) {
      console.error("Erreur détecteur AntiLink :", err);
    }
  },
};