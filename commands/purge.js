import { contextInfo } from '../utils/contextInfo.js';

export default {
    name: "purge",
    description: "Expulse tous les membres du groupe",
    category: "Groupe",
    group: true,
    admin: false,

    run: async (kaya, m, msg, store, args) => {
        const chatId = m.chat;

        try {
            // Obtenir les métadonnées du groupe
            const groupMetadata = await kaya.groupMetadata(chatId);
            const botNumber = kaya.user.id.split(':')[0] + '@s.whatsapp.net';

            // Filtrer tous les membres sauf le bot
            const allMembers = groupMetadata.participants
                .filter(p => p.id !== botNumber)
                .map(p => p.id);

            if (allMembers.length === 0) {
                return kaya.sendMessage(
                    chatId,
                    { text: "🔍 Aucun membre à expulser.", contextInfo },
                    { quoted: m }
                );
            }

            // Message de début
            await kaya.sendMessage(
                chatId,
                { text: `⚡ Début de la purge de *${allMembers.length} membres*...`, contextInfo },
                { quoted: m }
            );

            let successCount = 0;
            let failCount = 0;

            // Expulser les membres par lots pour éviter les erreurs
            for (const user of allMembers) {
                try {
                    const result = await kaya.groupParticipantsUpdate(chatId, [user], "remove");
                    if (result) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                    await new Promise(r => setTimeout(r, 500)); // Délai entre chaque expulsion
                } catch (error) {
                    console.error(`Erreur avec ${user}:`, error);
                    failCount++;
                    // Continuer malgré les erreurs
                }
            }

            // Message de résultat final
            let resultMessage = `🎯 Purge terminée !\n`;
            resultMessage += `✅ ${successCount} membres expulsés\n`;

            if (failCount > 0) {
                resultMessage += `❌ ${failCount} échecs (membres déjà partis ou protections)\n`;
            }

            resultMessage += `\n👑 Le bot reste dans le groupe.`;

            return kaya.sendMessage(
                chatId,
                { text: resultMessage, contextInfo },
                { quoted: m }
            );

        } catch (err) {
            console.error("Erreur générale:", err);
            return kaya.sendMessage(
                chatId,
                { text: "❌ Une erreur s'est produite lors de la purge.", contextInfo },
                { quoted: m }
            );
        }
    }
};