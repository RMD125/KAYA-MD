const checkAdminOrOwner = require('../utils/checkAdmin');
const { saveBotModes } = require('../utils/botModes');

const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 144
    }
};

module.exports = {
    name: 'recording',
    description: 'Active/Désactive le mode micro (owner uniquement)',
    category: 'Owner',

    run: async (kaya, m, msg, store, args) => {
        const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
        if (!permissions.isOwner) {
            return kaya.sendMessage(m.chat, { text: '🚫 Commande réservée au propriétaire.', contextInfo }, { quoted: m });
        }

        const action = args[0]?.toLowerCase();
        if (!['on','off'].includes(action)) {
            return kaya.sendMessage(m.chat, { text: '❌ Utilisation : .recording on|off', contextInfo }, { quoted: m });
        }

        global.botModes.recording = action === 'on';
        saveBotModes(global.botModes);

        return kaya.sendMessage(m.chat, {
            text: global.botModes.recording
                ? '🎤 Mode "recording" activé ! Le bot simulera qu’il enregistre un audio.' 
                : '❌ Mode "recording" désactivé.',
            contextInfo
        }, { quoted: m });
    }
};