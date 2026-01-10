import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'
import os from 'os'
import { spawn } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { say } = cfonts
const rl = createInterface(process.stdin, process.stdout)

/* ===== LOGO FRIEREN  ===== */
say('Friren-MD', {
  font: 'chrome',
  align: 'center',
  gradient: ['white', 'blue']
})

/* ===== INFORMACIÓN DEL SISTEMA ===== */
const ramInGB = os.totalmem() / (1024 * 1024 * 1024)
const freeRamInGB = os.freemem() / (1024 * 1024 * 1024)
const currentTime = new Date().toLocaleString()

const info = `
╭─────────────────────────────◉
│ ${chalk.bgBlue.white.bold('      ✐  INFORMACIÓN DEL SISTEMA        ')}
│「 💻 」${chalk.cyanBright(`SO: ${os.type()}, ${os.release()} - ${os.arch()}`)}
│「 💾 」${chalk.white(`RAM Total: ${ramInGB.toFixed(2)} GB`)}
│「 💽 」${chalk.white(`RAM Libre: ${freeRamInGB.toFixed(2)} GB`)}
╰─────────────────────────────◉

╭─────────────────────────────◉
│ ${chalk.bgBlue.white.bold('      ✐  INFORMACIÓN DEL BOT        ')}
│「 🌸 」${chalk.cyanBright('Nombre » Frieren-MD')}
│「 💠 」${chalk.white('Versión » ^NewUpdate | V1')}
│「 📘 」${chalk.white('Descripción » WhatsApp Bot Multifuncional')}
│「 👑 」${chalk.cyanBright('Creador » leoxitoDev.xyz')}
│「 📌 」${chalk.cyanBright('Adaptador » leoxitoDev.xyz')}
╰─────────────────────────────◉

╭─────────────────────────────◉
│ ${chalk.bgBlue.white.bold('      ✐  HORA ACTUAL        ')}
│「 🕒 」${chalk.cyanBright(currentTime)}
╰─────────────────────────────◉
`

console.log(info)
console.log(chalk.cyanBright('[🤍]'), chalk.white('Iniciando Friren-MD...\n'))

/* ===== PROCESO SIMPLE ===== */
let isRunning = false
let childProcess = null

async function start(file) {
  if (isRunning) return
  isRunning = true

  const args = [join(__dirname, file), ...process.argv.slice(2)]
  
  childProcess = spawn('node', args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })

  childProcess.on('message', data => {
    switch (data) {
      case 'reset':
        childProcess.kill()
        isRunning = false
        start(file)
        break
      case 'uptime':
        childProcess.send(process.uptime())
        break
    }
  })

  childProcess.on('exit', (code) => {
    isRunning = false
    console.error(chalk.red('❌ Error inesperado:'), code)
    
    if (code === 0) return
    watchFile(args[0], () => {
      unwatchFile(args[0])
      start(file)
    })
    
    setTimeout(() => start(file), 5000)
  })

  let opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
  if (!opts['test'])
    if (!rl.listenerCount())
      rl.on('line', line => {
        childProcess.emit('message', line.trim())
      })
}

start('./Friren-Up/main.js')