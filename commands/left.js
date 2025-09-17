// ================= commands/left.js =================
import config from '../config.js';

export const name = 'left';
export const description = 'Le bot quitte le groupe (owner uniquement)';
export const category = 'Owner';

export async function run(kaya, m) {
  const senderNumber = m.sender.split('@')[0];
  const owners = config.OWNER_NUMBER.split(',').map(o => o.trim());

  // ✅ Vérifie que seul le propriétaire peut utiliser
  if (!owners.includes(senderNumber)) {
    return kaya.sendMessage(
      m.chat,
      { text: '🚫 Cette commande est réservée au propriétaire du bot.' },
      { quoted: m }
    );
  }

  // ✅ Vérifie que c'est un groupe
  if (!m.isGroup) {
    return kaya.sendMessage(
      m.chat,
      { text: '❗ Cette commande doit être utilisée dans un groupe.' },
      { quoted: m }
    );
  }

  try {
    // Le bot quitte silencieusement le groupe
    await kaya.groupLeave(m.chat);
  } catch (e) {
    console.error('❌ Erreur leave:', e);
    return kaya.sendMessage(
      m.chat,
      { text: '⚠️ Impossible de quitter le groupe.' },
      { quoted: m }
    );
  }
}