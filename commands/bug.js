module.exports = {
  name: 'bug',
  description: 'Envoie un bug glitché dans l\'inbox d\'une personne (usage abusif peut causer blocage)',
  category: 'fun',
  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isPrivate) return m.reply('❌ Cette commande fonctionne uniquement en message privé.');

      // Message glitché avec emojis, caractères invisibles et répétition
      const glitch1 = '🔥'.repeat(5000) + '💥'.repeat(5000);
      const invisible = '\u200E'.repeat(10000);

      const glitchMsg = glitch1 + invisible;

      // Envoie 5 messages glitchés avec un petit délai entre chaque
      for (let i = 0; i < 5; i++) {
        await kaya.sendMessage(m.chat, { text: glitchMsg });
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Envoie un message final super glitché (répète le glitch 10 fois)
      const megaGlitch = glitchMsg.repeat(10);
      await kaya.sendMessage(m.chat, { text: megaGlitch });

    } catch (err) {
      console.error('Erreur dans la commande bug:', err);
      m.reply('❌ Une erreur est survenue lors de l\'envoi du bug.');
    }
  }
};