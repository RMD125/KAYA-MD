// ================= commands/kick.js =================
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js";

export const name = "kick";
export const description = "Expulse un membre du groupe";
export const category = "Groupe";
export const group = true;
export const admin = true;

export async function run(kaya, m, msg, store, args) {
  const chatId = m.chat;

  // ✅ Vérifie si l’utilisateur est admin/owner
  const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
  if (!permissions.isAdminOrOwner) {
    return kaya.sendMessage(
      chatId,
      { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent utiliser `.kick`.", contextInfo },
      { quoted: m }
    );
  }

  // ✅ Identifier la cible
  let target;
  if (m.quoted) {
    target = m.quoted.sender;
  } else if (args[0]) {
    target = args[0].replace(/[@+]/g, "") + "@s.whatsapp.net";
  }

  if (!target) {
    return kaya.sendMessage(
      chatId,
      { text: "⚙️ Usage: `.kick @utilisateur` ou répondre à son message.", contextInfo },
      { quoted: m }
    );
  }

  try {
    // ✅ Vérifie que ce n’est pas un admin
    const groupMetadata = await kaya.groupMetadata(chatId);
    const groupAdmins = groupMetadata.participants
      .filter(p => p.admin)
      .map(p => p.id);

    if (groupAdmins.includes(target)) {
      return kaya.sendMessage(
        chatId,
        { text: "❌ Impossible d’expulser un *Admin*.", contextInfo },
        { quoted: m }
      );
    }

    // ✅ Expulsion
    await kaya.groupParticipantsUpdate(chatId, [target], "remove");

    return kaya.sendMessage(
      chatId,
      {
        text: `🚷 @${target.split("@")[0]} a été expulsé du groupe.`,
        mentions: [target],
        contextInfo
      },
      { quoted: m }
    );

  } catch (err) {
    console.error("❌ Erreur commande kick:", err);
    return kaya.sendMessage(
      chatId,
      { text: "⚠️ Impossible d’expulser ce membre.", contextInfo },
      { quoted: m }
    );
  }
}