// ================= commands/menu.js =================
import fs from 'fs';
import path from 'path';
import { contextInfo } from '../utils/contextInfo.js';

const botImagePath = path.join(process.cwd(), 'data/botImage.json');

export const name = 'menu';
export const description = 'Affiche le menu interactif Kaya-MD';

export async function run(kaya, m, msg, store, args) {
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Nombre total de commandes
  let totalCmds = 0;
  try {
    const commandFiles = fs.readdirSync(path.join(process.cwd(), 'commands')).filter(file => file.endsWith('.js'));
    totalCmds = commandFiles.length;
  } catch {
    totalCmds = 'Erreur';
  }

  // Image du bot
  let botImageUrl = 'https://files.catbox.moe/k06gcy.jpg';
  try {
    if (fs.existsSync(botImagePath)) {
      const data = JSON.parse(fs.readFileSync(botImagePath, 'utf-8'));
      if (data.botImage) botImageUrl = data.botImage;
    }
  } catch (e) {
    console.error('Erreur chargement image bot:', e);
  }

  const menuText = `
╭────KAYA-MD MENU───╮
│ 🕒 *Heure* : ${time}
│ 📂 *Commandes* : ${totalCmds}
│
│ 🔹 1. Groupe menu
│ 🔹 2. Owner menu
│ 🔹 3. Stickers menu
│ 🔹 4. Divers menu
│ 🔹 5. Téléchargements menu
│ 🔹 6. IA & Outils menu
│ 🔹 7. Tous les menus
│      
╰──────────────────╯
 Réponds au menu avec un chiffre (1 à 7) ou tape : .groupemenu | .stickermenu | .iamenu
    `.trim();
    
  await kaya.sendMessage(
    m.chat,
    {
      image: { url: botImageUrl },
      caption: menuText,
      contextInfo: { ...contextInfo, mentionedJid: [m.sender] }
    },
    { quoted: m }
  );

  // Activer le menu pour l'utilisateur
  global.menuState = global.menuState || {};
  global.menuState[m.sender] = true;
}