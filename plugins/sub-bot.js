import { iniciarSubBot, listarSubBots, eliminarSubBot } from '../lib/subs.js';

export default {
  command: ['subbot', 'code'],
  desc: 'Sistema de sub-bots personalizado',
  run: async (m, { conn, args }) => {
    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'crear') {
      const phone = args[1] || m.sender.split('@')[0];
      if (!phone.match(/^\d+$/)) return m.reply('Número inválido.');

      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      try {
        const code = await iniciarSubBot(phone, sessionId);
        m.reply(`Código generado: ${code}\nSesión ID: ${sessionId}`);
      } catch (e) {
        m.reply('Error generando código: ' + e.message);
      }
    } else if (subcommand === 'listar') {
      const subs = listarSubBots();
      m.reply(`Sub-bots activos: ${subs.length}\n${subs.join('\n')}`);
    } else if (subcommand === 'eliminar') {
      const sessionId = args[1];
      if (eliminarSubBot(sessionId)) {
        m.reply('Sub-bot eliminado.');
      } else {
        m.reply('Sub-bot no encontrado.');
      }
    } else {
      m.reply('Uso: /subbot crear [numero] | listar | eliminar [sessionId]');
    }
  },
};