const config = require('../system/config');

module.exports = {
  name: 'tag',
  description: 'Mentionne tous les membres avec un message',
  category: 'groupe',

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) {
      return m.reply('❌ Cette commande fonctionne uniquement dans un groupe.');
    }

    const metadata = await kaya.groupMetadata(m.chat).catch(() => null);
    if (!metadata) return m.reply('❌ Impossible de récupérer les informations du groupe.');

    const senderId = m.sender.split('@')[0];
    const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;
    const isOwner = config.owner.includes(senderId);

    if (!isAdmin && !isOwner) {
      return kaya.sendMessage(m.chat, {
        text: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ 🚫 *Accès refusé*
├ Vous devez être *Administrateur* ou *Propriétaire* du bot pour utiliser cette commande.
╰────────────────────⬣`
      }, { quoted: m });
    }

    const members = metadata.participants.map(p => p.id);

    let message;

    if (m.quoted && m.quoted.text) {
      message = m.quoted.text;
    } else if (args.length > 0) {
      message = args.join(' ');
    } else {
      return kaya.sendMessage(m.chat, {
        text: `╭━━〔 𝗞𝗔𝗬𝗔-𝗠𝗗 〕━━⬣
├ ❌ Veuillez répondre à un message ou écrire un texte à taguer.
╰────────────────────⬣`
      }, { quoted: m });
    }

    await kaya.sendMessage(m.chat, {
      text: message,
      mentions: members
    });
  }
};