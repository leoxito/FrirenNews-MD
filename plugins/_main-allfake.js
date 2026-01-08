import pkg from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

// Definir iconos globales
global.iconos = [
  'https://cdn.russellxz.click/eb2b74a8.jpg',
  
]

var handler = m => m
handler.all = async function (m) { 
  global.canalIdM = ["120363404434164076@newsletter"]
  global.canalNombreM = ["⋆˚𝜗𝜚˚⋆❀ 𝐅𝐫𝐢𝐞𝐫𝐞𝐧-𝐌𝐃 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐎𝐟𝐢𝐜𝐢𝐚𝐥 ❀⋆˚𝜗𝜚˚⋆"]
  global.channelRD = await getRandomChannel()

  global.d = new Date(new Date + 3600000)
  global.locale = 'es'
  global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
  global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

  var canal = 'https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N'
  var git = 'https://github.com/leoxito'
  var github = 'https://github.com/leoxito/FrirenNews-MD' 
  var correo = 'leo.xzy01@gmail.com'
  global.redes = [canal, git, github, correo].getRandom()

  global.nombre = m.pushName || 'Anónimo'

  global.fkontak = { 
    key: { 
      participants: "0@s.whatsapp.net", 
      "remoteJid": "status@broadcast", 
      "fromMe": false, 
      "id": "Halo" 
    }, 
    "message": { 
      "contactMessage": { 
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    "participant": "0@s.whatsapp.net" 
  }
  
  global.rcanal = { 
    contextInfo: { 
      isForwarded: true, 
      forwardedNewsletterMessageInfo: { 
        newsletterJid: channelRD.id, 
        serverMessageId: '', 
        newsletterName: channelRD.name 
      }, 
      externalAdReply: { 
        title: botname, 
        body: dev, 
        mediaUrl: null, 
        description: null, 
        previewType: "PHOTO", 
        thumbnail: await (await fetch(pickRandom(iconos))).buffer(), 
        sourceUrl: redes, 
        mediaType: 1, 
        renderLargerThumbnail: false 
      }, 
      mentionedJid: null 
    }
  }
}

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * canalIdM.length)
  let id = canalIdM[randomIndex]
  let name = canalNombreM[randomIndex]
  return { id, name }
}