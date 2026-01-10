import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import { smsg } from './simple.js';
import fs from 'fs';
import path from 'path';

if (!global.subBots) global.subBots = [];

const MAX_SUB_BOTS = 50;

export async function createSubBot(phone) {
  if (global.subBots.length >= MAX_SUB_BOTS) throw new Error('Máximo 50 sub-bots alcanzado.');

  const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const botPath = `./sessions/sub-bots/${botId}`;

  if (!fs.existsSync(botPath)) {
    fs.mkdirSync(botPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(botPath);
  const { version } = await fetchLatestBaileysVersion();

  const bot = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, { info: () => {}, warn: () => {}, error: () => {} }),
    },
    version,
    printQRInTerminal: false,
  });

  bot.botId = botId;
  bot.saveCreds = saveCreds;

  bot.onConnectionUpdate = ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(`Sub-bot conectado: ${bot.user?.id}`);
      if (!global.subBots.find(b => b.botId === botId)) {
        global.subBots.push(bot);
      }
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log(`Sub-bot desconectado permanentemente: ${botId}`);
        removeSubBot(botId);
      } else {
        setTimeout(() => reconnectSubBot(botId), 10000);
      }
    }
  };

  bot.onMessagesUpsert = async ({ messages }) => {
    for (let msg of messages) {
      if (!msg.message) continue;
      const m = await smsg(bot, msg);
      try {
        await global.reloadHandler(bot, m, messages);
      } catch (e) {
        console.error('Error en sub-bot:', e);
      }
    }
  };

  bot.ev.on('creds.update', bot.saveCreds);
  bot.ev.on('connection.update', bot.onConnectionUpdate);
  bot.ev.on('messages.upsert', bot.onMessagesUpsert);

  if (phone) {
    const pairingCode = await bot.requestPairingCode(phone);
    return { code: pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode, botId };
  }

  return bot;
}

export function listSubBots() {
  const botsPath = './sessions/sub-bots';
  if (!fs.existsSync(botsPath)) return [];
  return fs.readdirSync(botsPath).filter(dir => fs.existsSync(path.join(botsPath, dir, 'creds.json')));
}

export function removeSubBot(botId) {
  const botPath = `./sessions/sub-bots/${botId}`;
  if (fs.existsSync(botPath)) {
    fs.rmSync(botPath, { recursive: true, force: true });
    global.subBots = global.subBots.filter(b => b.botId !== botId);
    return true;
  }
  return false;
}

export async function reconnectSubBot(botId) {
  const botPath = `./sessions/sub-bots/${botId}`;
  if (!fs.existsSync(botPath)) return;

  const { state, saveCreds } = await useMultiFileAuthState(botPath);
  const { version } = await fetchLatestBaileysVersion();

  const bot = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, { info: () => {}, warn: () => {}, error: () => {} }),
    },
    version,
    printQRInTerminal: false,
  });

  bot.botId = botId;
  bot.saveCreds = saveCreds;

  bot.ev.on('creds.update', bot.saveCreds);
  bot.ev.on('connection.update', bot.onConnectionUpdate);
  bot.ev.on('messages.upsert', bot.onMessagesUpsert);

  global.subBots.push(bot);
}