import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'
import os from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { say } = cfonts
const rl = createInterface(process.stdin, process.stdout)

/* ===== LOGO FRIEREN  ===== */
say('Friren-MD', {
  font: 'chrome',
  align: 'center',
  gradient: ['cyanBright', 'blue']
})

/* ===== INFORMACIÓN DEL SISTEMA ===== */
const ramInGB = os.totalmem() / (1024 * 1024 * 1024)
const freeRamInGB = os.freemem() / (1024 * 1024 * 1024)
const currentTime = new Date().toLocaleString()

const info = `
╭─────────────────────────────◉
│ ${chalk.bgBlue.white.bold('        INFORMACIÓN DEL SISTEMA        ')}
│「 💻 」${chalk.cyanBright(`SO: ${os.type()}, ${os.release()} - ${os.arch()}`)}
│「 💾 」${chalk.white(`RAM Total: ${ramInGB.toFixed(2)} GB`)}
│「 💽 」${chalk.white(`RAM Libre: ${freeRamInGB.toFixed(2)} GB`)}
╰─────────────────────────────◉

╭─────────────────────────────◉
│ ${chalk.bgBlue.white.bold('        INFORMACIÓN DEL BOT        ')}
│「 🌸 」${chalk.cyanBright('Nombre » Frieren-MD')}
│「 💠 」${chalk.white('Versión » NewUpdate | V4')}
│「 📘 」${chalk.white('Descripción » WhatsApp Bot Multifuncional')}
│「 👨‍💻 」${chalk.cyanBright('Creador » FzTeis')}
│「 🎨 」${chalk.cyanBright('Adaptador » leoxitoDev.xyz')}
╰─────────────────────────────◉

╭─────────────────────────────◉
│ ${chalk.bgBlue.white.bold('        HORA ACTUAL        ')}
│「 🕒 」${chalk.cyanBright(currentTime)}
╰─────────────────────────────◉
`

console.log(info)
console.log(chalk.cyanBright('[🌸]'), chalk.white('Iniciando main.js...\n'))

/* ===== CLUSTER ===== */
let isRunning = false

async function start(files) {
  if (isRunning) return
  isRunning = true

  for (const file of files) {
    let args = [join(__dirname, file), ...process.argv.slice(2)]

    setupMaster({
      exec: args[0],
      args: args.slice(1)
    })

    let p = fork()

    p.on('message', data => {
      switch (data) {
        case 'reset':
          p.process.kill()
          isRunning = false
          start(files)
          break
        case 'uptime':
          p.send(process.uptime())
          break
      }
    })

    p.on('exit', (_, code) => {
      isRunning = false
      console.error(chalk.red('❌ Error inesperado:'), code)
      start(files)

      if (code === 0) return
      watchFile(args[0], () => {
        unwatchFile(args[0])
        start(files)
      })
    })

    let opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
    if (!opts['test'])
      if (!rl.listenerCount())
        rl.on('line', line => {
          p.emit('message', line.trim())
        })
  }
}

start(['./Friren-Up/main.js'])