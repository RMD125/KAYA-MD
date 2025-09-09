const checkAdminOrOwner = require('../utils/checkAdmin');
const { saveBotModes, loadBotModes } = require('../utils/botModes');

const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 143
    }
};

module.exports = {
    name: 'typing',
    description: 'Active/Désactive le mode écriture (owner uniquement)',
    category: 'Owner',

    run: async (kaya, m, msg, store, args) => {
        const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
        if (!permissions.isOwner) {
            return kaya.sendMessage(m.chat, { text: '🚫 Commande réservée au propriétaire.', contextInfo }, { quoted: m });
        }

        const action = args[0]?.toLowerCase();
        if (!['on','off'].includes(action)) {
            return kaya.sendMessage(m.chat, { text: '❌ Utilisation : .typing on|off', contextInfo }, { quoted: m });
        }

        global.botModes.typing = action === 'on';
        saveBotModes(global.botModes);

        return kaya.sendMessage(m.chat, {
            text: global.botModes.typing 
                ? '✅ Mode "typing" activé ! Le bot simulera qu’il écrit.' 
                : '❌ Mode "typing" désactivé.',
            contextInfo
        }, { quoted: m });
    }
};