const config = require('../config');
const checkAdminOrOwner = require('../utils/checkAdmin'); // ton utilitaire

module.exports = {
  name: 'join',
  description: 'Le bot rejoint un groupe via un lien (owner uniquement, silencieux)',
  category: 'Owner',

  run: async (kaya, m, msg, store, args) => {
    // ✅ Vérifie si l'utilisateur est owner (pas besoin du chatId ici)
    const permissions = await checkAdminOrOwner(kaya, null, m.sender);
    if (!permissions.isOwner) return; // Ignore si pas owner

    // Récupérer le lien depuis le reply si existe
    const replyText =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || '';

    // Priorité au reply, sinon prendre l'argument
    const link = replyText || args[0];
    if (!link || !link.includes('whatsapp.com/invite/')) return; // Ignore si pas de lien

    // Extraire le code d’invitation
    const code = link.split('whatsapp.com/invite/')[1].trim().replace(/[^a-zA-Z0-9]/g, '');

    try {
      await kaya.groupAcceptInvite(code);
      // ✅ Silencieux : pas de message envoyé
      console.log(`✅ Le bot a rejoint un groupe via le lien de ${m.sender.split('@')[0]}`);
    } catch (e) {
      console.error('❌ Erreur JOIN :', e);
    }
  }
};