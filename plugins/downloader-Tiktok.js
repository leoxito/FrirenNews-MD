// Importar desde Scrapers (ruta correcta)
import { getDownloadLink } from './Scrapers/Tiktokdl.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `> ❀ *Pasa el link de TikTok…*\n> *https://vm.tiktok.com/××××××*`

    await m.react('🕐')
    try {
        const links = await getDownloadLink(args[0]);
        if (links.length === 0) throw 'No se encontraron enlaces de descarga.';

        // Send the first link found (usually the video)
        await conn.sendMessage(m.chat, { 
            video: { url: links[0] }, 
            caption: '*Aqui Tienes Tu Video De TikTok ฅ^•ﻌ•^ฅ*' 
        }, { quoted: m });
        
        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('Ocurrió un error al descargar el video.')
    }
}

handler.help = ['Tiktok « link »']
handler.tags = ['downloader']
handler.command = ['tt']

export default handler