import { crearSubBot, listarSubBots, eliminarSubBot } from '../lib/subs.js';

let handler = async (m, { conn, args }) => {
  const subcommand = args[0]?.toLowerCase();

  if (subcommand === 'crear' || !args[0]) {
    const phone = args[1] || m.sender.split('@')[0];
    if (!phone.match(/^\d+$/)) return m.reply('Número inválido. Usa: /subbot crear [numero]');

    try {
      const { code, sessionId } = await crearSubBot(phone);
      m.reply(`Código: ${code}\nID: ${sessionId}`);
    } catch (e) {
      m.reply('Error: ' + e.message);
    }
  } else if (subcommand === 'listar') {
    const subs = listarSubBots();
    m.reply(`Activos: ${subs.length}/50\n${subs.join('\n')}`);
  } else if (subcommand === 'eliminar') {
    const sessionId = args[1];
    if (!sessionId) return m.reply('Usa: /subbot eliminar [id]');
    if (eliminarSubBot(sessionId)) {
      m.reply('Eliminado.');
    } else {
      m.reply('No encontrado.');
    }
  } else {
    m.reply('Uso: /subbot crear/listar/eliminar');
  }
};

handler.command = ['subbot'];
handler.desc = 'Sistema de sub-bots personalizado con límite de 50';
handler.group = true;

export default handler;