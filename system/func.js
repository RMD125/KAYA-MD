// func.js
import fs from "fs";
import chalk from "chalk";
import crypto from "crypto";
import axios from "axios";
import moment from "moment-timezone";
import { sizeFormatter } from "human-readable";
import util from "util";
import * as Jimp from "jimp";

import {
  extractMessageContent,
  getDevice,
  jidNormalizedUser,
  proto,
  delay,
  getContentType,
  areJidsSameUser,
  generateWAMessage,
  generateWAMessageFromContent
} from "@whiskeysockets/baileys";

// =================== Fonctions utilitaires ===================
export const unixTimestampSeconds = (date = new Date()) =>
  Math.floor(date.getTime() / 1000);

export const generateMessageTag = (epoch) => {
  let tag = unixTimestampSeconds().toString();
  if (epoch) tag += ".--" + epoch;
  return tag;
};

export const processTime = (timestamp, now) =>
  moment.duration(now - moment(timestamp * 1000)).asSeconds();

export const getRandom = (ext) =>
  `${Math.floor(Math.random() * 10000)}${ext}`;

export const getBuffer = async (url, options) => {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: { DNT: 1, "Upgrade-Insecure-Request": 1 },
      ...options,
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

export const reSize = async (buffer, x, z) => {
  const img = await Jimp.read(buffer);
  return await img.resize(x, z).getBufferAsync(Jimp.MIME_JPEG);
};

export const sleep = async (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isUrl = (url) =>
  url.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi
  );

export const getGroupAdmins = (participants) =>
  participants
    .filter((p) => ["admin", "superadmin", true].includes(p.admin))
    .map((p) => p.id);

// =================== Serialize Message ===================
export const smsg = (ask, m, store) => {
  if (!m) return m;
  let M = proto.WebMessageInfo;

  if (m.key) {
    m.id = m.key.id;
    m.from = m.key.remoteJid.startsWith("status")
      ? jidNormalizedUser(m.key?.participant || m.participant)
      : jidNormalizedUser(m.key.remoteJid);
    m.isBaileys = m.id?.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = ask.decodeJid(
      (m.fromMe && ask.user.id) ||
        m.participant ||
        m.key.participant ||
        m.chat ||
        ""
    );
    if (m.isGroup) m.participant = ask.decodeJid(m.key.participant) || "";
  }

  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg =
      m.mtype == "viewOnceMessage"
        ? m.message[m.mtype]?.message?.[
            getContentType(m.message[m.mtype].message)
          ]
        : m.message[m.mtype];
    m.body =
      m.message?.conversation ||
      m.msg?.caption ||
      m.msg?.text ||
      (m.mtype == "listResponseMessage" &&
        m.msg?.singleSelectReply?.selectedRowId) ||
      (m.mtype == "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
      (m.mtype == "viewOnceMessage" && m.msg?.caption) ||
      m.text;

    let quoted = (m.quoted = m.msg?.contextInfo?.quotedMessage || null);
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid || [];

    if (m.quoted) {
      let type = getContentType(quoted);
      m.quoted = m.quoted[type];
      if (["productMessage"].includes(type)) {
        type = getContentType(m.quoted);
        m.quoted = m.quoted[type];
      }
      if (typeof m.quoted === "string") m.quoted = { text: m.quoted };

      m.quoted.key = {
        remoteJid: m.msg?.contextInfo?.remoteJid || m.from,
        participant: jidNormalizedUser(m.msg?.contextInfo?.participant),
        fromMe: areJidsSameUser(
          jidNormalizedUser(m.msg?.contextInfo?.participant),
          jidNormalizedUser(ask?.user?.id)
        ),
        id: m.msg?.contextInfo?.stanzaId,
      };

      m.quoted.mtype = type;
      m.quoted.from = /g\.us|status/.test(m.msg?.contextInfo?.remoteJid)
        ? m.quoted.key.participant
        : m.quoted.key.remoteJid;
      m.quoted.id = m.msg?.contextInfo?.stanzaId;
      m.quoted.chat = m.msg?.contextInfo?.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id
        ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16
        : false;
      m.quoted.sender = ask.decodeJid(m.msg?.contextInfo?.participant);
      m.quoted.fromMe = m.quoted.sender === (ask.user && ask.user.id);
      m.quoted.text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.conversation ||
        m.quoted.contentText ||
        m.quoted.selectedDisplayText ||
        m.quoted.title ||
        "";
      m.quoted.mentionedJid = m.msg?.contextInfo?.mentionedJid || [];

      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        let q = await store.loadMessage(m.chat, m.quoted.id, ask);
        return smsg(ask, q, store);
      };

      // ✅ Remplacement de M.fromObject par generateWAMessageFromContent
      const vM = (m.quoted.fakeObj = generateWAMessageFromContent(
        m.chat,
        m.msg,
        { userJid: m.quoted.sender }
      ));

      m.quoted.delete = () => ask.sendMessage(m.quoted.chat, { delete: vM.key });
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
        ask.copyNForward(jid, vM, forceForward, options);
      m.quoted.download = () => ask.downloadMediaMessage(m.quoted);
    }
  }

  if (m.msg?.url) m.download = () => ask.downloadMediaMessage(m.msg);

  m.text =
    m.msg?.text ||
    m.msg?.caption ||
    m.message?.conversation ||
    m.msg?.contentText ||
    m.msg?.selectedDisplayText ||
    m.msg?.title ||
    "";

  m.reply = (text, chatId = m.chat, options = {}) => {
    if (!ask.sendText) return;
    return Buffer.isBuffer(text)
      ? ask.sendMedia(chatId, text, "file", "", m, { ...options })
      : ask.sendText(chatId, text, m, { ...options });
  };

  m.copy = () => smsg(ask, m, store);
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
    ask.copyNForward(jid, m, forceForward, options);

  return m;
};

// =================== Hot reload ===================
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);

fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(chalk.redBright(`Update ${__filename}`));
  import(`${path.resolve(__filename)}?update=${Date.now()}`);
});