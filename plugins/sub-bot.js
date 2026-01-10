let commandFlags = {}

export default {
  command: ['code'],
  category: 'socket',
  run: async (client, m, args, command) => {
    let time = global.db.data.users[m.sender]?.Subs + 120000 || ''
    if (new Date() - global.db.data.users[m.sender]?.Subs < 120000) {
      return client.reply(
        m.chat,
        `🌽 Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`,
        m,
      )
    }

    const subsPath = './sessions/subs'
    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).length
      : 0

    const maxSubs = 20
    if (subsCount >= maxSubs) {
      return client.reply(
        m.chat,
        '🍒 No se han encontrado espacios disponibles para registrar un `Sub-Bot`.',
        m,
      )
    }

    commandFlags[m.sender] = true

    const rtx = '`✤` Vincula tu *cuenta* usando el *codigo.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*\n\nꕤ *`Importante`*\n> ₊·( 🜸 ) ➭ Este *Código* solo funciona en el *número que lo solicito*'

    const isCode = /^(code)$/.test(command)
    const isCommand = isCode ? true : false
    const caption = rtx
    const phone = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0]

    await startSubBot(m, client, caption, isCode, phone, m.chat, commandFlags, isCommand)
  }
}