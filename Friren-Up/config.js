import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"


//INFO: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
// global.botNumber = SIN NUMERO //Ejemplo: 513218138672

global.owner = ['51918755472'/*,'owner 2', 'owner 3']*/
global.suittag = [] 
global.prems = []
global.libreria = "Baileys Multi Device-MD"
global.vs = "^NewUpdate | V1"
global.sessions = "Sessions/Principal"
global.botname = "Oguri-Cap"
global.textbot = "Oguri, made with love by MELODIA"
global.dev = "© Powered by MELODIA"
global.author = "© Made with love by MELODIA"
global.etiqueta = "MELODIA"
global.currency = "¥enes"
global.packname = ``
global.author = ''
global.group = "https://chat.whatsapp.com/EYi0JuSqDj3LYJ83ohRdMm"
global.community = "https://chat.whatsapp.com/HY3r3RwkOOKCs6OxCzsEFW"
global.channel = "https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N"
global.github = "https://github.com/leoxito/FrirenNews-MD"
global.gmail = "leo.xzy01@gmail.com"
global.multiplier = 69 
global.maxwarn = '2'
global.ch = {
ch1: "120363404287449613@newsletter"
}


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'config.js"))
import(`${file}?update=${Date.now()}`)
})