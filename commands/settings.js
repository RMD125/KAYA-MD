const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../system/config.js');
let config = require(configPath);

module.exports = {
  name: 'settings',
  description: 'Modifie la configuration du bot (Owner uniquement)',

  run: async (kaya, m, msg, store, args) => {
    const sender = m.sender.split('@')[0];

    if (!config.owner.includes(sender)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Seul le propriétaire peut accéder aux paramètres.'
      }, { quoted: m });
    }

    if (!args[0]) {
      const settingsText = `
╭───〔 ⚙️ PARAMÈTRES - 𝗞𝗔𝗬𝗔-𝗠𝗗 〕───⬣
│ Prefix : ${config.prefix}
│ Packname : ${config.packname}
│ Owner(s) : ${config.owner.join(', ')}
│ AutoRead : ${config.autoRead ? '✅ on' : '❌ off'}
│ Restrict : ${config.restrict ? '✅ on' : '❌ off'}
│ Mode : ${config.publicBot ? '🌍 public' : '🔒 private'}
╰────────────────────────────⬣

🔧 Modifier un paramètre :
.prefix !
.sudo 243xxxxxx
.delsudo 243xxxxxx
.botmode public|private
.autoread on|off
.restrict on|off
.packname NomDuPack

╰─────────── 𝗞𝗔𝗬𝗔-𝗠𝗗 ──────────╯`.trim();

      return kaya.sendMessage(m.chat, { text: settingsText }, { quoted: m });
    }

    const key = args[0].toLowerCase();
    const value = args.slice(1).join(' ').trim();

    const saveConfig = () => {
      const content = `module.exports = ${JSON.stringify(config, null, 2)};`;
      fs.writeFileSync(configPath, content);
      delete require.cache[require.resolve(configPath)];
      config = require(configPath);
    };

    switch (key) {
      case 'prefix':
        if (!value) return kaya.sendMessage(m.chat, { text: '❌ Donne un préfixe.' }, { quoted: m });
        config.prefix = value;
        saveConfig();
        return kaya.sendMessage(m.chat, { text: `✅ Préfixe mis à jour : ${value}` }, { quoted: m });

      case 'packname':
        if (!value) return kaya.sendMessage(m.chat, { text: '❌ Donne un nom de pack.' }, { quoted: m });
        config.packname = value;
        saveConfig();
        return kaya.sendMessage(m.chat, { text: `✅ Packname mis à jour : ${value}` }, { quoted: m });

      case 'autoread':
      case 'restrict':
        if (!['on', 'off'].includes(value.toLowerCase())) {
          return kaya.sendMessage(m.chat, { text: '❌ Utilise on ou off.' }, { quoted: m });
        }
        config[key] = value.toLowerCase() === 'on';
        saveConfig();
        return kaya.sendMessage(m.chat, { text: `✅ ${key} ${config[key] ? 'activé' : 'désactivé'}` }, { quoted: m });

      case 'botmode':
        if (!['public', 'private'].includes(value.toLowerCase())) {
          return kaya.sendMessage(m.chat, { text: '❌ Utilise public ou private.' }, { quoted: m });
        }
        config.publicBot = value.toLowerCase() === 'public';
        saveConfig();
        return kaya.sendMessage(m.chat, { text: `✅ Mode : ${value}` }, { quoted: m });

      case 'sudo':
        const num = value.replace(/\D/g, '');
        if (!num) return kaya.sendMessage(m.chat, { text: '❌ Donne un numéro.' }, { quoted: m });
        if (!config.owner.includes(num)) {
          config.owner.push(num);
          saveConfig();
          return kaya.sendMessage(m.chat, { text: `✅ ${num} ajouté comme sudo.` }, { quoted: m });
        } else {
          return kaya.sendMessage(m.chat, { text: '⚠️ Ce numéro est déjà sudo.' }, { quoted: m });
        }

      case 'delsudo':
        const removeNum = value.replace(/\D/g, '');
        if (!config.owner.includes(removeNum)) {
          return kaya.sendMessage(m.chat, { text: '⚠️ Ce numéro n’est pas sudo.' }, { quoted: m });
        }
        config.owner = config.owner.filter(o => o !== removeNum);
        saveConfig();
        return kaya.sendMessage(m.chat, { text: `✅ ${removeNum} retiré des sudos.` }, { quoted: m });

      default:
        return kaya.sendMessage(m.chat, {
          text: '❌ Paramètre invalide. Tape .settings pour voir les options.'
        }, { quoted: m });
    }
  }
};