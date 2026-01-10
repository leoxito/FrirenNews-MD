import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { smsg } from './simple.js';
import fs from 'fs';
import path from 'path';

if (!global.conns) global.conns = [];
const MAX_SUBBOTS = 50;

export async function crearSubBot(phoneNumber) {
  const subs = listarSubBots();
  if (subs.length >= MAX_SUBBOTS) throw new Error('Límite de 50 sub-bots alcanzado.');

  const sessionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const sessionPath = `./sessions/subs/${sessionId}`;

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: 'silent' });
  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger,
  });

  sock.sessionId = sessionId;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(`Sub-bot conectado: ${sock.user?.id}`);
      if (!global.conns.find(c => c.sessionId === sessionId)) {
        global.conns.push(sock);
      }
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log(`Sub-bot desconectado permanentemente: ${sessionId}`);
        eliminarSubBot(sessionId);
      } else {
        console.log(`Reintentando conexión para ${sessionId}`);
        setTimeout(() => reconectarSubBot(sessionId), 10000);
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

  try {
    const code = await sock.requestPairingCode(phoneNumber);
    return { code: code?.match(/.{1,4}/g)?.join('-') || code, sessionId };
  } catch (e) {
    throw new Error('Error generando código: ' + e.message);
  }
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

export async function reconectarSubBot(sessionId) {
  const sessionPath = `./sessions/subs/${sessionId}`;
  if (!fs.existsSync(sessionPath)) return;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const logger = pino({ level: 'silent' });
    const sock = makeWASocket({
      auth: state,
      version,
      printQRInTerminal: false,
      logger,
    });

    sock.sessionId = sessionId;
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', ({ connection }) => {
      if (connection === 'open') {
        if (!global.conns.find(c => c.sessionId === sessionId)) {
          global.conns.push(sock);
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
  } catch (e) {
    console.error(`Error reconectando ${sessionId}:`, e);
  }
}