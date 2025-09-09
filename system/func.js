const { extractMessageContent, getDevice, jidNormalizedUser, proto, delay, getContentType, areJidsSameUser, generateWAMessage } = require("@whiskeysockets/baileys")
const chalk = require('chalk')
const fs = require('fs')
const Crypto = require('crypto')
const axios = require('axios')
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const util = require('util')
const { read, MIME_JPEG } = require('jimp')

// =================== Fonctions utilitaires ===================
const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)
exports.unixTimestampSeconds = unixTimestampSeconds

exports.generateMessageTag = (epoch) => {
    let tag = exports.unixTimestampSeconds().toString()
    if (epoch) tag += '.--' + epoch
    return tag
}

exports.processTime = (timestamp, now) => moment.duration(now - moment(timestamp * 1000)).asSeconds()

exports.getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`

exports.checkBandwidth = async () => {
    let ind = 0, out = 0
    for (let i of await require("node-os-utils").netstat.stats()) {
        ind += parseInt(i.inputBytes)
        out += parseInt(i.outputBytes)
    }
    return { download: exports.bytesToSize(ind), upload: exports.bytesToSize(out) }
}

exports.getBuffer = async (url, options) => {
    try {
        const res = await axios({ method: "get", url, headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 }, ...options, responseType: 'arraybuffer' })
        return res.data
    } catch (err) { return err }
}

exports.formatSize = (bytes) => {
    const sizes = ['Bytes','KB','MB','GB','TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes)/Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

exports.fetchJson = async (url, options) => {
    try {
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, ...options })
        return res.data
    } catch (err) { return err }
}

exports.reSize = async (buffer, x, z) => {
    const img = await read(buffer)
    return await img.resize(x, z).getBufferAsync(MIME_JPEG)
}

exports.sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

exports.isUrl = (url) => url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))

exports.getGroupAdmins = (participants) => participants.filter(p => ['admin','superadmin',true].includes(p.admin)).map(p => p.id)

// =================== Serialize Message ===================
exports.smsg = (ask, m, store) => {
    if (!m) return m
    let M = proto.WebMessageInfo

    if (m.key) {
        m.id = m.key.id
        m.from = m.key.remoteJid.startsWith('status') ? jidNormalizedUser(m.key?.participant || m.participant) : jidNormalizedUser(m.key.remoteJid)
        m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = ask.decodeJid(m.fromMe && ask.user.id || m.participant || m.key.participant || m.chat || '')
        if (m.isGroup) m.participant = ask.decodeJid(m.key.participant) || ''
    }

    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype]?.message?.[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message?.conversation
                 || m.msg?.caption
                 || m.msg?.text
                 || ((m.mtype == 'listResponseMessage') && m.msg?.singleSelectReply?.selectedRowId)
                 || ((m.mtype == 'buttonsResponseMessage') && m.msg?.selectedButtonId)
                 || ((m.mtype == 'viewOnceMessage') && m.msg?.caption)
                 || m.text

        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage || null
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }

            m.quoted.key = {
                remoteJid: m.msg?.contextInfo?.remoteJid || m.from,
                participant: jidNormalizedUser(m.msg?.contextInfo?.participant),
                fromMe: areJidsSameUser(jidNormalizedUser(m.msg?.contextInfo?.participant), jidNormalizedUser(ask?.user?.id)),
                id: m.msg?.contextInfo?.stanzaId
            }

            m.quoted.mtype = type
            m.quoted.from = /g\.us|status/.test(m.msg?.contextInfo?.remoteJid) ? m.quoted.key.participant : m.quoted.key.remoteJid
            m.quoted.id = m.msg?.contextInfo?.stanzaId
            m.quoted.chat = m.msg?.contextInfo?.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
            m.quoted.sender = ask.decodeJid(m.msg?.contextInfo?.participant)
            m.quoted.fromMe = m.quoted.sender === (ask.user && ask.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, ask)
                return exports.smsg(ask, q, store)
            }

            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })

            m.quoted.delete = () => ask.sendMessage(m.quoted.chat, { delete: vM.key })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => ask.copyNForward(jid, vM, forceForward, options)
            m.quoted.download = () => ask.downloadMediaMessage(m.quoted)
        }
    }

    if (m.msg?.url) m.download = () => ask.downloadMediaMessage(m.msg)

    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || ''

    m.reply = (text, chatId = m.chat, options = {}) => {
        if (!ask.sendText) return
        return Buffer.isBuffer(text)
            ? ask.sendMedia(chatId, text, 'file', '', m, { ...options })
            : ask.sendText(chatId, text, m, { ...options })
    }

    m.copy = () => exports.smsg(ask, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => ask.copyNForward(jid, m, forceForward, options)

    return m
}

// Watch file for hot reload
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})