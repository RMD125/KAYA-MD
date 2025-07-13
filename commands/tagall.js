const moment = require('moment');
moment.locale('fr');

module.exports = {
    name: "tagall",
    alias: ["mention", "everyone"],
    description: "📢 Mentionne tous les membres du groupe avec un message personnalisé et élégant.",
    category: "groupe",
    group: true,
    admin: true,

    run: async (kaya, m, msg, store, args) => {
        try {
            if (!m.isGroup) {
                return kaya.sendMessage(m.chat, {
                    text: "⛔ Cette commande est uniquement disponible dans les groupes.",
                }, { quoted: m });
            }

            const groupMetadata = await kaya.groupMetadata(m.chat);
            const participants = groupMetadata.participants.map(p => p.id);
            const senderTag = m.sender.split('@')[0];
            const date = moment().format('dddd D MMMM YYYY');
            const time = moment().format('HH:mm:ss');

            const mentionList = participants.map(p => `👤 @${p.split('@')[0]}`).join('\n');

            const header = "╔════════════════╗\n" +
                           "║      🤖 𝗞𝗔𝗬𝗔 𝗠𝗗 🤖        ║\n" +
                           "║      🔔 *TAG ALL* 🔔        ║\n" +
                           "╚════════════════╝";

            const info = `📅 *Date:* ${date}\n` +
                         `⏰ *Heure:* ${time}\n` +
                         `👥 *Membres mentionnés:* ${participants.length}\n\n`;

            const messageBody = args.length > 0 
                ? args.join(" ") 
                : "_Aucun message personnalisé fourni._";

            const footer = `\n⚠️ Merci de respecter les règles du groupe !\n` +
                           `📢 Envoyé par : @${senderTag}`;

            const fullMessage = `${header}\n\n${info}📣 *Message de l'admin :*\n${messageBody}\n\n👥 *Membres :*\n${mentionList}${footer}`;

            await kaya.sendMessage(m.chat, {
                text: fullMessage,
                mentions: participants,
            }, { quoted: m });

        } catch (error) {
            console.error("Erreur dans la commande tagall :", error);
            m.reply("❌ Une erreur est survenue lors de la mention.");
        }
    }
};