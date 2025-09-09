const config = require('../config');
const checkAdminOrOwner = require('../utils/checkAdmin');

const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 201
    }
};

module.exports = {
    name: 'block',
    description: '🚫 Bloque l’utilisateur en conversation (Owner uniquement)',
    category: 'Owner',

    run: async (kaya, m, msg) => {
        try {
            // Vérifie si l'expéditeur est owner
            const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
            if (!permissions.isOwner) {
                return kaya.sendMessage(
                    m.chat,
                    { text: '🚫 Seul le propriétaire peut utiliser cette commande.', contextInfo },
                    { quoted: m }
                );
            }

            // La personne à bloquer = la personne avec qui le bot converse
            const target = m.chat; // Pour les conversations privées, m.chat = l'autre numéro
            if (!target.endsWith('@s.whatsapp.net')) return;

            // Bloque la personne
            await kaya.updateBlockStatus(target, 'block');

            await kaya.sendMessage(
                m.chat,
                { text: `✅ L'utilisateur @${target.split('@')[0]} a été bloqué.`, mentions: [target], contextInfo },
                { quoted: m }
            );

        } catch (err) {
            console.error('❌ Erreur commande block :', err);
            return kaya.sendMessage(
                m.chat,
                { text: `❌ Impossible de bloquer l'utilisateur : ${err.message}`, contextInfo },
                { quoted: m }
            );
        }
    }
};