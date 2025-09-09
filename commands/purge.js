const checkAdminOrOwner = require("../utils/checkAdmin");
const { contextInfo } = require('../utils/contextInfo'); // import centralisé

module.exports = {
    name: "purge",
    description: "Expulse tous les membres du groupe sauf les admins et le bot",
    category: "Groupe",
    group: true,
    admin: true,

    run: async (kaya, m, msg, store, args) => {
        const chatId = m.chat;

        // Vérifie si l’utilisateur est admin ou owner
        const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
        if (!permissions.isAdminOrOwner) {
            return kaya.sendMessage(
                chatId,
                { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent utiliser `.kickall`.", contextInfo },
                { quoted: m }
            );
        }

        try {
            const groupMetadata = await kaya.groupMetadata(chatId);
            const botNumber = await kaya.decodeJid(kaya.user.id);

            // Identifier les membres à expulser
            const toKick = groupMetadata.participants
                .filter(p => !p.admin && p.id !== botNumber) // exclure admins + bot
                .map(p => p.id);

            if (toKick.length === 0) {
                return kaya.sendMessage(
                    chatId,
                    { text: "✅ Aucun membre à expulser (seulement admins et bot dans ce groupe).", contextInfo },
                    { quoted: m }
                );
            }

            // Expulsion par lot (éviter les erreurs de flood)
            for (const user of toKick) {
                await kaya.groupParticipantsUpdate(chatId, [user], "remove");
                await new Promise(r => setTimeout(r, 1000)); // pause 1s entre chaque kick
            }

            return kaya.sendMessage(
                chatId,
                { text: `🚷 *${toKick.length} membres* ont été expulsés du groupe.`, contextInfo },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Erreur commande purge:", err);
            kaya.sendMessage(chatId, { text: "⚠️ Impossible d’expulser tous les membres.", contextInfo }, { quoted: m });
        }
    }
};