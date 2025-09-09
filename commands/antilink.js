// ================= commands/antilink.js =================
const fs = require("fs");
const path = require("path");
const { contextInfo } = require("../utils/contextInfo"); // ← import contextInfo global

// 📂 Fichier de sauvegarde
const antiLinkFile = path.join(__dirname, "../data/antiLinkGroups.json");

// Fonction pour sauvegarder les groupes
function saveAntiLinkGroups(groups) {
  fs.writeFileSync(antiLinkFile, JSON.stringify([...groups], null, 2));
}

module.exports = {
  name: "antilink",
  description: "Active ou désactive l’anti-link dans le groupe",
  category: "Groupe",
  group: true,

  run: async (kaya, m, msg, store, args, { isAdminOrOwner }) => { // ✅ récupère depuis le handler
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Cette commande fonctionne uniquement dans un groupe.", contextInfo },
          { quoted: m }
        );
      }

      // ✅ Vérifie si l'utilisateur est admin ou owner
      if (!isAdminOrOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’anti-link.", contextInfo },
          { quoted: m }
        );
      }

      const action = args[0]?.toLowerCase();
      if (!action || !["on", "off"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚙️ Usage : .antilink on/off", contextInfo },
          { quoted: m }
        );
      }

      if (!global.antiLinkGroups) global.antiLinkGroups = new Set();

      if (action === "on") {
        global.antiLinkGroups.add(m.chat);
      } else {
        global.antiLinkGroups.delete(m.chat);
      }

      // Sauvegarde auto dans le fichier JSON
      saveAntiLinkGroups(global.antiLinkGroups);

      await kaya.sendMessage(
        m.chat,
        { text: `✅ *Anti-link ${action === "on" ? "activé" : "désactivé"}* pour ce groupe.`, mentions: [m.sender], contextInfo },
        { quoted: m }
      );
    } catch (err) {
      console.error("Erreur antilink.js :", err);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Impossible de modifier l’anti-link.", contextInfo },
        { quoted: m }
      );
    }
  },
};