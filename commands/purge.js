const config = require('../system/config');

const contextInfo = {
  mentionedJid: [],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 143
  }
};

module.exports = {
  name: 'purge',
  description: 'Expulse tous les membres du groupe sauf le bot et l’owner',
  category: 'groupe',

  run: async (kaya, m, msg, store, args) => {
    if (!m.isGroup) {
      return m.reply('❌ Cette commande fonctionne uniquement dans un groupe.');
    }

    const sender = m.sender.replace(/\D/g, '');
    if (!config.owner.includes(sender)) {
      return m.reply('🚫 Seul le *propriétaire de KAYA-MD* peut utiliser cette commande.');
    }

    const metadata = await kaya.groupMetadata(m.chat);
    const participants = metadata.participants;
    const botId = kaya.user.id.split(':')[0] + '@s.whatsapp.net';

    const toKick = participants
      .map(p => p.id)
      .filter(id => id !== m.sender && id !== botId);

    if (toKick.length === 0) {
      return m.reply('⚠️ Aucun membre à expulser.');
    }

    global.isPurging = true;

    await kaya.sendMessage(m.chat, {
      text:
`☠️ *MODE DÉMONIAQUE ACTIVÉ...*
🔒 *Verrouillage de toutes les issues...*
🔪 *Analyse des proies en cours...*

╭━━〔 💀 KAYA-MD PURGE 〕━━⬣
├ 🎯 Cibles localisées : *${toKick.length} âmes*
├ 🤖 Bot et propriétaire épargnés
├ 🔥 Opération : *EXTERMINATION INITIÉE*
╰────────────────────────⬣`,
      mentions: toKick,
      contextInfo
    });

    for (const id of toKick) {
      try {
        await kaya.groupParticipantsUpdate(m.chat, [id], 'remove');
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.log(`❌ Erreur d’expulsion pour ${id}`);
      }
    }

    global.isPurging = false;

    await kaya.sendMessage(m.chat, {
      text:
`💀 *PURGE TERMINÉE*
📛 *Tous les intrus ont été bannis du royaume.*
🛡️ *Seuls les élus demeurent...*

╭━━〔 ✅ KAYA-MD PURGE COMPLÈTE 〕━━⬣
├ 💥 Statut : *Nettoyage achevé*
├ 👤 Survivants : *Admins* & *KAYA-MD*
╰────────────────────────⬣`,
      contextInfo
    });
  }
};