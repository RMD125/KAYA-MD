const moment = require('moment');
moment.locale('fr');

module.exports = {
    name: "tagall",
    alias: ["mention", "everyone"],
    description: "📢 Mentionne tous les membres du groupe avec un message personnalisé et élégant.",
    category: "groupe",
    group: true,
    admin: false, // 🔓 accessible à tout le monde

    run: async (kaya, m, msg, store, args) => {
        try {
            if (!m.isGroup) {
                return kaya.sendMessage(m.chat, {
                    text: "⛔ Cette commande est uniquement disponible dans les groupes.",
                }, { quoted: m });
            }

            const metadata = await kaya.groupMetadata(m.chat);
            const participants = metadata.participants.map(p => p.id);

            const date = moment().format('dddd D MMMM YYYY');
            const time = moment().format('HH:mm:ss');

            // 📌 Extraire uniquement les numéros pour affichage
            const numbers = participants.map(p => p.split('@')[0]);

            // 🌍 Nombre de pays distincts (on prend les 3 premiers chiffres du numéro)
            const countryCodes = [...new Set(numbers.map(num => num.slice(0, 3)))];
            const totalCountries = countryCodes.length;

            const mentionList = numbers.map(num => `👤 @${num}`).join('\n');

            const fullMessage =
`╔════════════════╗
║   KAYA MD     TAG ALL 
╚════════════════╝

📅 Date: ${date}
⏰ Heure: ${time}
👥 Membres: ${participants.length}
🌍 ${totalCountries} pays dans ce groupe 

👥 Membres :
${mentionList}`;

            await kaya.sendMessage(m.chat, {
                text: fullMessage,
                mentions: participants, // ✅ JID complet pour les mentions
            }, { quoted: m });

        } catch (error) {
            console.error("Erreur dans la commande tagall :", error);
            m.reply("❌ Une erreur est survenue lors de la mention.");
        }
    }
};