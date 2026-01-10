let handler = async (m, { conn, args }) => {
  const subcommand = args[0]?.toLowerCase();

  if (subcommand === 'crear' || !subcommand) {
    const phone = args[1] || m.sender.split('@')[0];
    if (!phone.match(/^\d+$/)) return m.reply('Número inválido. Usa: /subbot crear [numero]');

    try {
      const { code, sessionId } = await crearSubBot(phone);
      m.reply(`Código de emparejamiento: ${code}\nSesión ID: ${sessionId}\n\nInstrucciones: Ve a WhatsApp > Dispositivos vinculados > Vincular dispositivo > Ingresa el código.`);
    } catch (e) {
      m.reply('Error: ' + e.message);
    }
  } else if (subcommand === 'listar') {
    const subs = listarSubBots();
    m.reply(`Sub-bots activos: ${subs.length}/50\n${subs.map(s => `- ${s}`).join('\n')}`);
  } else if (subcommand === 'eliminar') {
    const sessionId = args[1];
    if (!sessionId) return m.reply('Especifica el ID de sesión. Usa: /subbot eliminar [sessionId]');
    if (eliminarSubBot(sessionId)) {
      m.reply('Sub-bot eliminado.');
    } else {
      m.reply('Sub-bot no encontrado.');
    }
  } else {
    m.reply('Uso:\n/subbot crear [numero] - Crear sub-bot\n/subbot listar - Ver sub-bots activos\n/subbot eliminar [sessionId] - Eliminar sub-bot');
  }
};

handler.command = ['subbot'];
handler.desc = 'Sistema de sub-bots personalizado con límite de 50';
handler.group = true;

export default handler;