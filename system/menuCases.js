// ==================== menuCases.js ====================  
import { contextInfo } from '../utils/contextInfo.js'; // centralisé  

export default {

  // ─── MENU GROUPE ───
  '1': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 MENU GROUPE 〕━━⬣
├ .tagall
├ .tag
├ .antitag
├ .lock
├ .unlock
├ .link
├ .antilink on/off
├ .antispam on/off
├ .promote
├ .revoque
├ .purge
├ .kick
├ .add
├ .delete ou del
├ .antipromote on/off
├ .antirevoque on/off
├ .welcome on
├ .bye on
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  // ─── MENU OWNER ───
  '2': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 MENU OWNER 〕━━⬣
├ .owner
├ .setting
├ allprefix
├ .recording on/off
├ .typing on/off
├ .blockinbox
├ .block
├ .unblock
├ .sudo
├ .unsudo
├ .sudolist
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  // ─── MENU STICKERS ───
  '3': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 STICKERS MENU 〕━━⬣
├ .sticker
├ .take
├ .photo
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  // ─── MENU DIVERS ───
  '4': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 DIVERS MENU 〕━━⬣
├ .alive
├ .ping
├ .calendrier
├ .info
├ .repo
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  // ─── MENU TÉLÉCHARGEMENTS ───
  '5': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 TELECHARGEMENTS 〕━━⬣
├ .song
├ .play
├ .tiktok
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  // ─── MENU IA & OUTILS ───
  '6': async (kaya, m) => {
    return kaya.sendMessage(m.chat, {
      text: `
╭━━〔 IA & OUTILS 〕━━⬣
├ .ai
├ .voix
╰────────────────────⬣`,
      contextInfo
    }, { quoted: m });
  },

  // ─── TOUS LES MENUS ───
  '7': async (kaya, m) => {
    const allMenus = `
╭━━〔 TOUS LES MENUS 〕━━⬣

GROUPE
├ .tagall
├ .tag
├ .lock
├ .unlock
├ .link
├ .delete ou del
├ .antilink on
├ .antilink off
├ .promote
├ .revoque
├ .antipromote on/off
├ .antirevoque on/off
├ .welcome on
├ .bye on
├ .purge
├ .kick
├ .add

OWNER
├ .owner
├ .settings
├ .recording on
├ .recording off
├ .typing on
├ .typing off
├ .blockinbox
├ .block
├ .unblock
├ .sudo
├ .unsudo
├ .sudolist

STICKERS
├ .sticker
├ .take
├ .photo

DIVERS
├ .alive
├ .ping
├ .calendrier
├ .info
├ .repo

TELECHARGEMENTS
├ .song
├ .play
├ .tiktok

IA & OUTILS
├ .ai
├ .voix

╰─────────────────────────⬣`;

    await kaya.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/k06gcy.jpg' },
      caption: allMenus,
      contextInfo
    }, { quoted: m });
  },

  // ─── DEFAULT ───
  'default': async (kaya, m) => {
    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').trim();
    if (/^\d+$/.test(text)) {
      return kaya.sendMessage(m.chat, {
        text: '❌ Option invalide. Veuillez répondre par un chiffre (1 à 7).',
        contextInfo
      }, { quoted: m });
    }
    return;
  }

};