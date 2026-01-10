import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { smsg } from './simple.js';
import fs from 'fs';
import path from 'path';

if (!global.conns) global.conns = [];

export async function iniciarSubBot(phoneNumber, sessionId) {
  const sessionPath = `./sessions/subs/${sessionId}`;

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger: { level: 'silent' },
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(`Sub-bot conectado: ${sock.user?.id}`);
      if (!global.conns.find(c => c.user?.id === sock.user?.id)) {
        global.conns.push(sock);
      }
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log(`Sub-bot desconectado: ${sessionId}`);
        fs.rmSync(sessionPath, { recursive: true, force: true });
      } else {
        setTimeout(() => iniciarSubBot(phoneNumber, sessionId), 5000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
      if (!msg.message) continue;
      const m = await smsg(sock, msg);
      try {
        await global.reloadHandler(sock, m, messages);
      } catch (e) {
        console.error('Error en sub-bot:', e);
      }
    }
  });

  if (phoneNumber) {
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      return code?.match(/.{1,4}/g)?.join('-') || code;
    } catch (e) {
      throw new Error('Error generando código: ' + e.message);
    }
  }

  return sock;
}

export function listarSubBots() {
  const subsPath = './sessions/subs';
  if (!fs.existsSync(subsPath)) return [];
  return fs.readdirSync(subsPath).filter(dir => fs.existsSync(path.join(subsPath, dir, 'creds.json')));
}

export function eliminarSubBot(sessionId) {
  const sessionPath = `./sessions/subs/${sessionId}`;
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    global.conns = global.conns.filter(c => c.sessionId !== sessionId);
    return true;
  }
  return false;
}