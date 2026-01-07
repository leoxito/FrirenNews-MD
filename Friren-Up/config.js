import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"


//INFO: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
// global.botNumber = SIN NUMERO //Ejemplo: 513218138672

global.owner = ['51900373696','595974154768', '51921826291']
global.suittag = [] 
global.prems = []
global.libreria = "Baileys Multi Device"
global.vs = "^1.8.2|Latest"
global.sessions = "Sessions/Principal"
global.botname = "Oguri-Cap"
global.textbot = "Oguri, made with love by MELODIA"
global.dev = "© Powered by MELODIA"
global.author = "© Made with love by MELODIA"
global.etiqueta = "MELODIA"
global.currency = "¥enes"
global.group = "https://chat.whatsapp.com/EYi0JuSqDj3LYJ83ohRdMm"
global.community = "https://chat.whatsapp.com/HY3r3RwkOOKCs6OxCzsEFW"
global.channel = "https://whatsapp.com/channel/0029VbBZ4YX4inoqvA74nA20"
global.github = "https://github.com/melodiabl/OguriCap-Bot.git"
global.gmail = "melodiayaoivv@gmail.com"
global.ch = {
ch1: "120363404287449613@newsletter"
}


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})