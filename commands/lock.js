module.exports = {
  name: 'lock',
  description: 'Ferme le groupe (seuls les admins peuvent écrire).',
  group: true,         // à utiliser uniquement en groupe
  admin: true,         // l’utilisateur doit être admin
  botAdmin: true,      // le bot doit être admin pour modifier le groupe

  run: async (kaya, m, msg, store, args) => {
    const contextInfo = {
      mentionedJid: [m.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402565816662@newsletter',
        newsletterName: 'KAYA MD',
        serverMessageId: 143
      }
    };

    try {
      // Passe le groupe en mode annonce = seuls les admins peuvent écrire
      await kaya.groupSettingUpdate(m.chat, 'announcement');

      const text = `
╭━━〔🔒GROUPE FERMÉ〕━━⬣
┃ 📛 Les membres ne peuvent plus envoyer de messages.
┃ ✅ Utilise *.unlock* pour rouvrir le groupe.
╰━━━━━━━━━━━━━━━━━━━━⬣
      `.trim();

      // Envoie le message avec la chaîne et mention de l’admin
      await kaya.sendMessage(m.chat, {
        text,
        mentions: [m.sender],
        contextInfo
      }, { quoted: m });

    } catch (error) {
      await kaya.sendMessage(m.chat, {
        text: '❌ Impossible de fermer le groupe. Assure-toi que je suis admin.',
        contextInfo
      }, { quoted: m });
    }
  }
};