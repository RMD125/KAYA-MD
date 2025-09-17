// ================= commands/join.js =================
import config from '../config.js';
import checkAdminOrOwner from '../utils/checkAdmin.js';

export const name = 'join';
export const description = 'Le bot rejoint un groupe via un lien (owner uniquement, silencieux)';
export const category = 'Owner';

export async function run(kaya, m, msg, store, args) {
  try {
    // ✅ Vérifie si l'utilisateur est owner
    const permissions = await checkAdminOrOwner(kaya, null, m.sender);
    if (!permissions.isOwner) return; // Ignore si pas owner

    // Récupérer le lien depuis le reply si existe
    const replyText =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || '';

    // Priorité au reply, sinon prendre l'argument
    const link = replyText || args[0];
    if (!link || !link.includes('whatsapp.com/invite/')) return; // Ignore si pas de lien valide

    // Extraire le code d’invitation
    const code = link.split('whatsapp.com/invite/')[1].trim().replace(/[^a-zA-Z0-9]/g, '');
    if (!code) return; // Ignore si code invalide

    // ✅ Rejoindre le groupe silencieusement
    await kaya.groupAcceptInvite(code);

    // Optionnel : log console pour info
    console.log(`✅ Le bot a rejoint un groupe via le lien de ${m.sender.split('@')[0]}`);
  } catch (err) {
    console.error('❌ Erreur commande join.js :', err);
  }
}