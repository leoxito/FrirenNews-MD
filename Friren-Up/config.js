import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

globalThis.owner = [ ['', '-', true], [''] ]
globalThis.mods = []
globalThis.prems = []
   

globalThis.packname = ``
globalThis.author = ''
globalThis.botname = 'Sylpha - Bot'

globalThis.name_canal = '-'
globalThis.id_canal = '120363274577422945@newsletter'
globalThis.canal = 'https://whatsapp.com/channel/0029VaeQcFXEFeXtNMHk0D0n'

globalThis.multiplier = 69 
globalThis.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
