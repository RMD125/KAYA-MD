const checkAdminOrOwner = require('../utils/checkAdmin');
const { saveBotModes } = require('../utils/botModes');

const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 145
    }
};

module.exports = {
    name: 'autoreact',
    description: 'Active/Désactive le mode réaction automatique ❤️ (owner uniquement)',
    category: 'Owner',

    run: async (kaya, m, msg, store, args) => {
        const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
        if (!permissions.isOwner) {
            return kaya.sendMessage(m.chat, { text: '🚫 Commande réservée au propriétaire.', contextInfo }, { quoted: m });
        }

        const action = args[0]?.toLowerCase();
        if (!['on','off'].includes(action)) {
            return kaya.sendMessage(m.chat, { text: '❌ Utilisation : .autoreact on|off', contextInfo }, { quoted: m });
        }

        global.botModes.autoreact = action === 'on';
        saveBotModes(global.botModes);

        return kaya.sendMessage(m.chat, {
            text: global.botModes.autoreact
                ? '❤️ Mode "autoreact" activé ! Le bot réagira automatiquement.' 
                : '❌ Mode "autoreact" désactivé.',
            contextInfo
        }, { quoted: m });
    }
};