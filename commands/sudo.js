// ==================== sudo.js ====================
const config = require('../config');
const checkAdminOrOwner = require('../utils/checkAdmin'); 
const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 122
    }
};

module.exports = {
    name: 'sudo',
    description: '➕ Ajoute un nouvel owner (réservé au propriétaire principal)',
    category: 'Owner',

    run: async (kaya, m, msg, store, args) => {
        // ✅ Vérifie si le sender est owner
        const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
        if (!permissions.isOwner) {
            return kaya.sendMessage(
                m.chat,
                { text: '🚫 *Seul le propriétaire principal peut utiliser cette commande.*', contextInfo },
                { quoted: m }
            );
        }

        // Récupération du numéro cible
        let targetId;
        if (m.quoted?.sender) {
            targetId = m.quoted.sender.split('@')[0].replace(/\D/g, '').trim();
        } else if (args[0]) {
            targetId = args[0].replace(/\D/g, '').trim();
        } else {
            return kaya.sendMessage(
                m.chat,
                { text: '❌ *Fournis un numéro ou réponds à un message pour ajouter comme owner.*', contextInfo },
                { quoted: m }
            );
        }

        // Liste des owners actuels
        let owners = config.OWNER_NUMBER.split(',')
            .map(o => o.split('@')[0].replace(/\D/g, '').trim());

        // Vérifie si le numéro est déjà owner
        if (owners.includes(targetId)) {
            return kaya.sendMessage(
                m.chat,
                { 
                    text: `ℹ️ *@${targetId}* est déjà owner.`,
                    mentions: [targetId + '@s.whatsapp.net'],
                    contextInfo 
                },
                { quoted: m }
            );
        }

        // Ajoute le nouvel owner sans écraser les anciens
        owners.push(targetId);

        // Sauvegarde dans config.json et met à jour config.js
        config.saveConfig({ OWNER_NUMBER: owners.join(',') });

        await kaya.sendMessage(
            m.chat,
            {
                text: `╭━━〔 👑 AJOUT OWNER 〕━━⬣
├ 📲 Numéro : @${targetId}
├ ✅ Statut : *Ajouté comme OWNER avec succès !*
├ 🔐 Accès : *Total au bot KAYA-MD*
╰────────────────────⬣`,
                mentions: [targetId + '@s.whatsapp.net'],
                contextInfo
            },
            { quoted: m }
        );
    }
};