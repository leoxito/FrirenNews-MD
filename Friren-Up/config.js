import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

//INFO: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
// global.botNumber = SIN NUMERO //Ejemplo: 513218138672

global.owner = ['51918755472'] /*,'owner 2', 'owner 3']*/
global.libreria = "Baileys Multi Device-MD"
global.vs = "^NewUpdate | V1"
global.sessions = "Sessions"
global.botname = "❀ 𝐅𝐫𝐢𝐞𝐫𝐞𝐧-𝐁𝐨𝐭"
global.textbot = "✿ 𝗙𝗿𝗶𝗲𝗿𝗲𝗻-𝗠𝗗 𝘅 𝗹𝗲𝗼𝘅𝗶𝘁𝗼𝗗𝗲𝘃.𝘅𝘆𝘇"
global.dev = "✐ 𝐏𝐨𝐰𝐨𝐫𝐞𝐝 𝐛𝐲 𝐥𝐞𝐨𝐱𝐢𝐭𝐨𝐃𝐞𝐯.𝐱𝐲𝐳"
global.author = "❀ 𝙀𝙘𝙝𝙤 𝙮 𝘿𝙚𝙫𝙡𝙤𝙥𝙖𝙙𝙤 𝙥𝙤𝙧 𝙡𝙚𝙤𝙭𝙞𝙩𝙤𝘿𝙚𝙫.𝙭𝙮𝙯"
global.etiqueta = "leoxitoDev.xyz"
global.currency = "¥enes"
global.packname = ``
global.author = ''
global.apikey = 'Frieren'
global.group = "https://chat.whatsapp.com/DTy5WmWeyHp4oOzFlydUhN"
global.community = "https://chat.whatsapp.com/L3Kruk5HQCX0SHe4nzPOGX"
global.channel = "https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N"
global.github = "https://github.com/leoxito/FrirenNews-MD"
global.gmail = "leo.xzy01@gmail.com"
global.multiplier = 69 
global.maxwarn = '2'
global.ch = {
ch1: "120363404434164076@newsletter"
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'config.js"))
import(`${file}?update=${Date.now()}`)
})