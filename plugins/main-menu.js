import { promises } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import { generateWAMessageFromContent, proto, generateWAMessageContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

async function makeFkontak() {
  try {
    const res = await fetch('https://cdn.russellxz.click/64bba973.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { 
        locationMessage: { 
          name: '🌳 𝗠𝗲𝗻𝘂 𝗙𝗶𝗲𝗿𝗲𝗻-𝗠𝗗 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 ✅️', 
          jpegThumbnail: thumb2 
        } 
      },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: "☁️", key: m.key } })

    let _package = {}
    try {
      _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')))
    } catch {
      _package = { name: 'Bot', version: '1.0.0' }
    }

    let { exp, limit, level } = global.db.data.users[m.sender] || { exp: 0, limit: 0, level: 0 }
    let { min, xp, max } = xpRange(level, global.multiplier || 1)
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users || {}).length

    // Obtener plugins con sus comandos REALES
    let plugins = Object.values(global.plugins || []).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        command: plugin.command,
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
        help: plugin.help
      }
    })

    // Saludo según hora de México (Zona Centro)
    const now = new Date()
    const utcHour = now.getUTCHours()
    const mexicanHour = (utcHour - 6 + 24) % 24 // Hora Central de México
    
    let hour
    switch(mexicanHour){
      case 0: hour = 'una linda noche 🌙'; break;
      case 1: hour = 'una linda noche 💤'; break;
      case 2: hour = 'una linda noche 🦉'; break;
      case 3: hour = 'una linda mañana ✨'; break;
      case 4: hour = 'una linda mañana 💫'; break;
      case 5: hour = 'una linda mañana 🌅'; break;
      case 6: hour = 'una linda mañana 🌄'; break;
      case 7: hour = 'una linda mañana 🌅'; break;
      case 8: hour = 'una linda mañana 💫'; break;
      case 9: hour = 'una linda mañana ✨'; break;
      case 10: hour = 'un lindo dia 🌞'; break;
      case 11: hour = 'un lindo dia 🌨'; break;
      case 12: hour = 'un lindo dia ❄'; break;
      case 13: hour = 'un lindo dia 🌤'; break;
      case 14: hour = 'una linda tarde 🌇'; break;
      case 15: hour = 'una linda tarde 🥀'; break;
      case 16: hour = 'una linda tarde 🌹'; break;
      case 17: hour = 'una linda tarde 🌆'; break;
      case 18: hour = 'una linda noche 🌙'; break;
      case 19: hour = 'una linda noche 🌃'; break;
      case 20: hour = 'una linda noche 🌌'; break;
      case 21: hour = 'una linda noche 🌃'; break;
      case 22: hour = 'una linda noche 🌙'; break;
      case 23: hour = 'una linda noche 🌃'; break;
    }
    let greeting = "Que Tengas" + hour

    // Construir el texto del menú
    let menuText = `
╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
│✐ *¡Hola* ${name}
│✿ *Estado* : ${conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Sub-Bot ꕥ'}
│✐ *Usuarios* : ${totalreg}
│✦ *Versión* : ${_package.version || '1.0.0'}
│✦ *Uptime* : ${uptime}
│✐ *RAM* : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB
│❀ *${greeting}* 
╰ׅ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

`

    // Decoración para cada categoría
    const categoryDecorations = {
      'main': '𓂂𓏸 𐅹੭੭ *`𝐈𝐍𝐅𝐎`* ⭐️ ᦡᦡ',
      'search': '𓂂𓏸 𐅹੭੭ *`𝐒𝐄𝐀𝐑𝐂𝐇`* 🔍 ᦡᦡ',
      'downloader': '𓂂𓏸 𐅹੭੭ *`𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒`* 🌿 ᦡᦡ',
      'tools': '𓂂𓏸 𐅹੭੭ *`𝐓𝐎𝐎𝐋𝐒`* 🛠️ ᦡᦡ',
      'sticker': '𓂂𓏸 𐅹੭੭ *`𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒`* 🎴 ᦡᦡ',
      'owner': '𓂂𓏸 𐅹੭੭ *`𝐂𝐑𝐄𝐀𝐃𝐎𝐑`* 👑 ᦡᦡ'
    }

    // Orden de las categorías
    const categoryOrder = ['main', 'search', 'downloader', 'tools', 'sticker', 'owner']

    // Añadir cada categoría con su decoración - EVITAR DUPLICADOS
    let addedCommands = new Set()

    for (let category of categoryOrder) {
      let categoryPlugins = plugins.filter(plugin => 
        plugin && plugin.tags && plugin.command && plugin.tags.includes(category)
      )

      if (categoryPlugins.length > 0) {
        menuText += `\n${categoryDecorations[category] || '𓂂𓏸 𐅹੭੭ *`' + category.toUpperCase() + '`* ᦡᦡ'}\n`

        for (let plugin of categoryPlugins) {
          if (!plugin.command) continue

          let commandArray = Array.isArray(plugin.command) ? plugin.command : [plugin.command]

          for (let cmdObj of commandArray) {
            if (!cmdObj) continue

            let cmdBase
            if (typeof cmdObj === 'string') {
              cmdBase = cmdObj.trim()
            } else if (cmdObj && typeof cmdObj === 'object') {
              cmdBase = cmdObj.pattern || cmdObj.text || cmdObj.command || ''
            } else {
              continue
            }

            if (!cmdBase) continue

            if (addedCommands.has(cmdBase.toLowerCase())) continue
            addedCommands.add(cmdBase.toLowerCase())

            let cmd = plugin.prefix ? cmdBase : _p + cmdBase
            menuText += `ര 🌱 ׅ *_${cmd}_*\n`
          }
        }
      }
    }

    // Añadir información final
    menuText += `\n▸ *Usa ${_p}menu para ver este menú*`

    // IMAGEN
    let imageUrl = 'https://cdn.russellxz.click/fec84dad.jpg'

    // BOTONES: SOLO Canal Oficial
    const nativeButtons = [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: "✎ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐎𝐟𝐢𝐜𝐢𝐚𝐥",
          url: 'https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N' 
        })
      }
    ]

    let header
    const media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer })
    header = proto.Message.InteractiveMessage.Header.fromObject({
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    })

    // Crear mensaje interactivo
    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: menuText }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: '' }),
      header,
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: nativeButtons
      })
    })

    const fkontak = await makeFkontak()
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { 
      userJid: conn.user.jid, 
      quoted: fkontak 
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (e) {
    console.error('Error en menú:', e)
    m.reply(`❌ *Error en el menú:*\n${e.message || 'Error desconocido'}`)
  }
}

handler.command = ['menu']
handler.tags = ['main']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}