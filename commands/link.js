// ================= commands/link.js =================
import checkAdminOrOwner from '../utils/checkAdmin.js';
import { contextInfo } from '../utils/contextInfo.js'; // ✅ Import centralisé

export const name = 'link';
export const description = '📎 Obtenir le lien d’invitation du groupe (Admins uniquement)';
export const category = 'Groupe';

export async function run(kaya, m, msg, store, args, { isAdminOrOwner }) {
  try {
    if (!m.isGroup) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Cette commande fonctionne uniquement dans un groupe.', contextInfo },
        { quoted: m }
      );
    }

    if (!isAdminOrOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Seuls les *Admins* ou le *Propriétaire* peuvent obtenir le lien du groupe.', contextInfo },
        { quoted: m }
      );
    }

    const inviteCode = await kaya.groupInviteCode(m.chat);
    const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

    return kaya.sendMessage(
      m.chat,
      { text: `🔗 Voici le lien d’invitation du groupe :\n${groupLink}`, contextInfo },
      { quoted: m }
    );

  } catch (err) {
    console.error('❌ Erreur commande link:', err);
    return kaya.sendMessage(
      m.chat,
      { text: '❌ Impossible de récupérer le lien du groupe.', contextInfo },
      { quoted: m }
    );
  }
}