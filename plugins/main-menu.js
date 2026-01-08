import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import { generateWAMessageFromContent, proto, generateWAMessageContent } from '@whiskeysockets/baileys'

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

    // Manejar el error de JSON.parse
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

    let help = Object.values(global.plugins || []).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })

    // Construir el texto del menú
    let bodyText = `
╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
│✨️ *¡Hola* ${name}
│🔰 *Estado* : ${conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Sub-Bot ꕥ'}
│📌 *Usuarios* : ${totalreg}
│📩 *Versión* : ${_package.version || '1.0.0'}
│⏳️ *Uptime* : ${uptime}
│💾 *RAM* : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB
│ *${greeting}* 
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
      let categoryPlugins = help.filter(plugin => 
        plugin && plugin.tags && plugin.help && plugin.tags.includes(category)
      )

      if (categoryPlugins.length > 0) {
        bodyText += `\n${categoryDecorations[category] || '𓂂𓏸 𐅹੭੭ *`' + category.toUpperCase() + '`* ᦡᦡ'}\n`

        for (let plugin of categoryPlugins) {
          if (!plugin.help) continue

          let helpArray = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
          for (let helpCmd of helpArray) {
            if (!helpCmd) continue

            // Extraer el comando base (sin prefijo)
            let cmdBase = typeof helpCmd === 'string' ? helpCmd.split(' ')[0] : helpCmd.text || ''
            if (!cmdBase) continue

            // Evitar duplicados
            if (addedCommands.has(cmdBase.toLowerCase())) continue
            addedCommands.add(cmdBase.toLowerCase())

            let cmd = plugin.prefix ? cmdBase : _p + cmdBase

            // Emoji fijo para todos los comandos
            bodyText += `ര 🌱 ׅ ${cmd}\n`
          }
        }
      }
    }

    // Añadir información final
    bodyText += `\n▸ *Usa ${_p}menu para ver este menú*`

    let fkontak = await makeFkontak()
    
    // LA CLAVE: Enviar como documento GIF (no como video)
    const buttons = [
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "✎ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐎𝐟𝐢𝐜𝐢𝐚𝐥",
          url: "https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N"
        })
      }
    ]

    // Crear mensaje con GIF como documento
    const message = {
      document: { url: 'https://cdn.russellxz.click/e11c2a14.mp4' },
      mimetype: 'video/mp4',
      fileName: 'menu.gif',
      caption: bodyText.trim(),
      mentions: [m.sender],
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: '🌳 𝗠𝗲𝗻𝘂 𝗙𝗶𝗲𝗿𝗲𝗻-𝗠𝗗 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 ✅️',
          body: 'Toca para ver el canal',
          thumbnail: fkontak ? fkontak.message.locationMessage.jpegThumbnail : null,
          sourceUrl: 'https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    // Enviar mensaje con proto
    let msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { 
              text: " " 
            },
            footer: { 
              text: bodyText 
            },
            header: {
              hasMediaAttachment: true,
              documentMessage: {
                url: 'https://cdn.russellxz.click/e11c2a14.mp4',
                mimetype: 'video/mp4',
                fileName: 'menu_animation.gif',
                fileLength: '8000000',
                pageCount: 0
              }
            },
            nativeFlowMessage: {
              buttons: buttons
            },
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardingScore: 999,
              externalAdReply: fkontak ? {
                title: fkontak.message.locationMessage.name,
                body: 'Fieren-MD Bot Oficial',
                thumbnail: fkontak.message.locationMessage.jpegThumbnail,
                sourceUrl: 'https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N',
                mediaType: 1
              } : {}
            }
          })
        }
      }
    }, { quoted: fkontak || m })

    // Intentar forzar el GIF playback en el documento
    if (msg.message.viewOnceMessage.message.interactiveMessage.header.documentMessage) {
      msg.message.viewOnceMessage.message.interactiveMessage.header.documentMessage.gifAttribution = 0
      msg.message.viewOnceMessage.message.interactiveMessage.header.documentMessage.fileName = 'menu_animation.GIF'
    }

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    
    // También enviar como mensaje normal con gifPlayback por si acaso
    await conn.sendMessage(m.chat, {
      video: { 
        url: 'https://cdn.russellxz.click/e11c2a14.mp4'
      },
      gifPlayback: true,
      caption: '🌳 Menú Fieren-MD',
      mentions: [m.sender]
    }, { quoted: fkontak || m })
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (e) {
    console.error('Error en menú:', e)
    
    // Último intento: enviar GIF simple
    try {
      let simpleText = `
╭─「 🌳 MENÚ FIEREN-MD 」
│✨️ ¡Hola ${name}
│📌 Usuarios: ${totalreg}
│⏳️ Uptime: ${uptime}
│ *${greeting}* 
╰─────────────

*Canal oficial:*
https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N
      `.trim()

      await conn.sendMessage(m.chat, {
        video: { 
          url: 'https://cdn.russellxz.click/e11c2a14.mp4'
        },
        gifPlayback: true,
        caption: simpleText,
        mentions: [m.sender]
      }, { quoted: fkontak || m })
      
      await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } })
    } catch (err) {
      m.reply(`❌ *Error en el menú:*\n${e.message || 'Error desconocido'}`)
    }
  }
}

handler.command = ['menu', 'menú', 'comandos']
handler.tags = ['main']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

var ase = new Date();
var hour = ase.getHours();
switch(hour){
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
var greeting = "Que Tengas " + hour;