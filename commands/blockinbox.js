const fs = require('fs');
const path = require('path');
const config = require('../config');
const checkAdminOrOwner = require('../utils/checkAdmin'); // ton fichier utilitaire

const configPath = path.join(__dirname, '../data/config.json');

module.exports = {
    name: 'blockinbox',
    description: 'Bloque ou débloque les messages privés du bot',
    category: 'Owner',

    run: async (Kaya, m, msg, store, args) => {
        // ✅ Vérifie si l'utilisateur est owner
        const permissions = await checkAdminOrOwner(Kaya, m.chat, m.sender);
        permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

        if (!permissions.isOwner) {
            return Kaya.sendMessage(
                m.chat,
                { text: '🚫 Cette commande est réservée au propriétaire du bot.' },
                { quoted: m }
            );
        }

        if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
            return Kaya.sendMessage(
                m.chat,
                { text: '❌ Utilisation :\n.blockinbox on\n.blockinbox off' },
                { quoted: m }
            );
        }

        const action = args[0].toLowerCase();

        // Initialise global si nécessaire
        if (!global.blockInbox) global.blockInbox = new Set();

        // Charge config existante
        let userConfig = fs.existsSync(configPath)
            ? JSON.parse(fs.readFileSync(configPath))
            : {};

        if (action === 'on') {
            global.blockInbox.add('enabled');
            userConfig.blockInbox = true;
            await Kaya.sendMessage(
                m.chat,
                { text: '✅ Le bot ne répondra plus en privé aux utilisateurs. Il reste actif dans les groupes.' },
                { quoted: m }
            );
        } else {
            global.blockInbox.delete('enabled');
            userConfig.blockInbox = false;
            await Kaya.sendMessage(
                m.chat,
                { text: '✅ Le bot peut à nouveau répondre en privé aux utilisateurs.' },
                { quoted: m }
            );
        }

        // Sauvegarde config
        fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));
        if (config.saveConfig) config.saveConfig(userConfig);
    }
};