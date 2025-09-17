// ==================== checkAdmin.js ====================
import decodeJid from './decodeJid.js';
import config from '../config.js';

export default async function checkAdminOrOwner(Kaya, chatId, sender, participants = [], metadata = null) {
    const isGroup = chatId.endsWith('@g.us');
    const senderNumber = decodeJid(sender).split('@')[0];
    const botOwners = config.OWNER_NUMBER.split(',').map(o => o.trim());
    const isBotOwner = botOwners.includes(senderNumber);

    // Hors groupe → seul le bot owner compte
    if (!isGroup) {
        return {
            isAdmin: false,
            isOwner: isBotOwner,
            isAdminOrOwner: isBotOwner,
            participant: null
        };
    }

    // Récupère metadata si nécessaire
    try {
        if (!metadata) metadata = await Kaya.groupMetadata(chatId);
        if (!participants || participants.length === 0) participants = metadata.participants || [];
    } catch (e) {
        console.error('❌ Impossible de récupérer groupMetadata:', e);
        return {
            isAdmin: false,
            isOwner: isBotOwner,
            isAdminOrOwner: isBotOwner,
            participant: null
        };
    }

    // Cherche le participant correspondant au sender
    const participant = participants.find(p => {
        const jidToCheck = decodeJid(p.jid || p.id || '');
        return jidToCheck === decodeJid(sender);
    }) || null;

    // Vérifie si admin
    const isAdmin = !!participant && (
        participant.admin === 'admin' ||
        participant.admin === 'superadmin' ||
        participant.role === 'admin' ||
        participant.role === 'superadmin' ||
        participant.isAdmin === true ||
        participant.isSuperAdmin === true
    );

    // Vérifie si créateur du groupe
    const isGroupOwner = metadata.owner && decodeJid(metadata.owner) === decodeJid(sender);

    // Final : owner = bot owner OU créateur du groupe
    const isOwner = isBotOwner || isGroupOwner;

    return {
        isAdmin,
        isOwner,
        isAdminOrOwner: isAdmin || isOwner,
        participant
    };
}