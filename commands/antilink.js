import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";

const spamFile = path.join(process.cwd(), "data/antiSpamGroups.json");

// Charger depuis fichier
function loadAntiSpamGroups() {
  if (!fs.existsSync(spamFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(spamFile, "utf-8"));
  } catch {
    return {};
  }
}

// Sauvegarde
function saveAntiSpamGroups(groups) {
  fs.writeFileSync(spamFile, JSON.stringify(groups, null, 2));
}

// Initialisation globale
if (!global.antiSpamGroups) global.antiSpamGroups = loadAntiSpamGroups();
if (!global.userSpam) global.userSpam = {};

export default {
  name: "antispam",
  description: "Anti-spam configurable",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) return kaya.sendMessage(m.chat, { text: "❌ Cette commande fonctionne uniquement dans un groupe." }, { quoted: m });

      const chatId = m.chat;
      const sender = m.sender;
      const action = args[0]?.toLowerCase();

      if (!action || !["on","off","warn","kick","delete"].includes(action)) {
        return kaya.sendMessage(chatId, { text: "⚙️ Modes :\n- .antispam on\n- .antispam off\n- .antispam warn\n- .antispam kick\n- .antispam delete" }, { quoted: m });
      }

      // Vérification admin/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (!check.isAdminOrOwner) return kaya.sendMessage(chatId, { text: "🚫 Seuls les admins ou le propriétaire peuvent modifier le mode anti-spam." }, { quoted: m });

      if (action === "on") {
        if (!global.antiSpamGroups[chatId]) global.antiSpamGroups[chatId] = { enabled: true };
        global.antiSpamGroups[chatId].enabled = true;
        saveAntiSpamGroups(global.antiSpamGroups);
        return kaya.sendMessage(chatId, { text: "✅ Anti-spam activé ! Veuillez choisir le mode : warn / kick / delete" }, { quoted: m });
      }

      if (action === "off") {
        delete global.antiSpamGroups[chatId];
        saveAntiSpamGroups(global.antiSpamGroups);
        return kaya.sendMessage(chatId, { text: "❌ Anti-spam désactivé pour ce groupe." }, { quoted: m });
      }

      if (["warn","kick","delete"].includes(action)) {
        if (!global.antiSpamGroups[chatId]) global.antiSpamGroups[chatId] = { enabled: true };
        global.antiSpamGroups[chatId].mode = action;
        saveAntiSpamGroups(global.antiSpamGroups);
        return kaya.sendMessage(chatId, { text: `✅ Mode *${action.toUpperCase()}* activé pour l'anti-spam.` }, { quoted: m });
      }

    } catch (err) {
      console.error("Erreur antispam.js :", err);
      return kaya.sendMessage(m.chat, { text: "❌ Impossible de modifier l’anti-spam." }, { quoted: m });
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup) return;
      const chatId = m.chat;
      const sender = m.sender;
      const body = m.text || m.message?.conversation || "";

      if (!global.antiSpamGroups?.[chatId]?.enabled) return;
      const mode = global.antiSpamGroups[chatId].mode;
      if (!mode) return;

      if (!global.userSpam[chatId]) global.userSpam[chatId] = {};
      if (!global.userSpam[chatId][sender]) global.userSpam[chatId][sender] = { lastMsg: "", count: 0, lastTime: Date.now() };

      const user = global.userSpam[chatId][sender];
      const now = Date.now();

      // Détection simple : message répété ou envoyé trop rapidement
      const isRepeat = body === user.lastMsg;
      const isFast = (now - user.lastTime) < 3000; // 3s entre messages

      if (isRepeat || isFast || body.length > 500) { // message trop long = spam
        user.count++;
      } else {
        user.count = 0;
      }

      user.lastMsg = body;
      user.lastTime = now;

      // Ignore admins/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      if (user.count >= 3) { // 3 infractions = action
        // Reset compteur
        user.count = 0;

        if (mode === "kick") {
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
          return kaya.sendMessage(chatId, { text: `👢 @${sender.split("@")[0]} expulsé pour spam !`, mentions: [sender] });
        }

        if (mode === "warn") {
          if (!global.userWarns[chatId]) global.userWarns[chatId] = {};
          global.userWarns[chatId][sender] = (global.userWarns[chatId][sender] || 0) + 1;

          if (global.userWarns[chatId][sender] >= 4) {
            delete global.userWarns[chatId][sender];
            await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
            return kaya.sendMessage(chatId, { text: `🚫 @${sender.split("@")[0]} expulsé après 4 avertissements !`, mentions: [sender] });
          }

          return kaya.sendMessage(chatId, { text: `⚠️ @${sender.split("@")[0]} spam détecté ! (avertissement ${global.userWarns[chatId][sender]}/4)`, mentions: [sender] });
        }

        if (mode === "delete") {
          return kaya.sendMessage(chatId, { delete: m.key });
        }
      }

    } catch (err) {
      console.error("Erreur détecteur AntiSpam :", err);
    }
  },
};