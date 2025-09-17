import fs from "fs";
import path from "path";
import { contextInfo } from "../utils/contextInfo.js";
import checkAdminOrOwner from "../utils/checkAdmin.js";

const antiTagAllFile = path.join(process.cwd(), "data/antiTagAllGroups.json");

function loadAntiTagAllGroups() {
  if (!fs.existsSync(antiTagAllFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(antiTagAllFile, "utf-8"));
  } catch {
    return {};
  }
}

function saveAntiTagAllGroups(groups) {
  fs.writeFileSync(antiTagAllFile, JSON.stringify(groups, null, 2));
}

if (!global.antiTagAllGroups) global.antiTagAllGroups = loadAntiTagAllGroups();
if (!global.userTagWarns) global.userTagWarns = {}; // suivi des avertissements

export default {
  name: "antitag",
  description: "Anti-tagall : supprime tous les messages qui mentionnent tous les membres",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(m.chat, { text: "❌ Cette commande fonctionne uniquement dans un groupe.", contextInfo }, { quoted: m });
      }

      const action = args[0]?.toLowerCase();

      if (!action || !["on", "off", "delete", "warn", "kick"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚙️ Usage :\n- .antitag on\n- .antitag off\n- .antitag delete\n- .antitag warn\n- .antitag kick" },
          { quoted: m }
        );
      }

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
        global.antiTagAllGroups[m.chat] = { enabled: true };
        saveAntiTagAllGroups(global.antiTagAllGroups);
        return kaya.sendMessage(m.chat, { text: "✅ *Anti-tagall activé !*", contextInfo }, { quoted: m });
      }

      if (action === "off") {
        delete global.antiTagAllGroups[m.chat];
        saveAntiTagAllGroups(global.antiTagAllGroups);
        return kaya.sendMessage(m.chat, { text: "❌ *Anti-tagall désactivé* pour ce groupe.", contextInfo }, { quoted: m });
      }

      if (["delete", "warn", "kick"].includes(action)) {
        if (!global.antiTagAllGroups[m.chat]) global.antiTagAllGroups[m.chat] = { enabled: true };
        global.antiTagAllGroups[m.chat].enabled = true;
        global.antiTagAllGroups[m.chat].mode = action;
        saveAntiTagAllGroups(global.antiTagAllGroups);
        return kaya.sendMessage(m.chat, { text: `✅ Mode *${action.toUpperCase()}* activé pour l’anti-tagall.`, contextInfo }, { quoted: m });
      }

    } catch (err) {
      console.error("Erreur antitag.js :", err);
      await kaya.sendMessage(m.chat, { text: "❌ Impossible de modifier l’anti-tagall.", contextInfo }, { quoted: m });
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup) return;
      const chatId = m.chat;

      if (!global.antiTagAllGroups?.[chatId]?.enabled) return;

      const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const bodyText = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || "";
      const tagAllRegex = /@all|@everyone|@here/gi;

      const isTagAll = mentions.length >= 5 || tagAllRegex.test(bodyText);
      if (!isTagAll) return;

      const sender = m.sender;
      const metadata = await kaya.groupMetadata(chatId);
      const participants = metadata.participants || [];
      const check = await checkAdminOrOwner(kaya, chatId, sender, participants);

      if (check.isAdminOrOwner) return;

      try { await kaya.sendMessage(chatId, { delete: m.key }); } catch {}

      const mode = global.antiTagAllGroups[chatId].mode || "warn";

      if (mode === "kick") {
        await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        return kaya.sendMessage(chatId, { text: `👢 @${sender.split("@")[0]} expulsé pour tagall !`, mentions: [sender], contextInfo });
      }

      if (mode === "warn") {
        if (!global.userTagWarns[chatId]) global.userTagWarns[chatId] = {};
        if (!global.userTagWarns[chatId][sender]) global.userTagWarns[chatId][sender] = 0;

        global.userTagWarns[chatId][sender]++;

        if (global.userTagWarns[chatId][sender] >= 4) {
          delete global.userTagWarns[chatId][sender];
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
          return kaya.sendMessage(chatId, { text: `🚫 @${sender.split("@")[0]} expulsé après 4 avertissements !`, mentions: [sender], contextInfo });
        }

        return kaya.sendMessage(chatId, { text: `⚠️ @${sender.split("@")[0]}, tagall interdit ! (avertissement ${global.userTagWarns[chatId][sender]}/4)`, mentions: [sender], contextInfo });
      }

      if (mode === "delete") {
        return kaya.sendMessage(chatId, { text: `🗑️ Message supprimé pour tagall. @${sender.split("@")[0]}`, mentions: [sender], contextInfo });
      }

    } catch (err) {
      console.error("Erreur détecteur AntiTagAll :", err);
    }
  },
};