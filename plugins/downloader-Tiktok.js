import { getDownloadLink } from '../Scrapers/Tiktokdl.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `> ❀ *Pasa el link de TikTok…*\n> *Ejemplo: ${usedPrefix + command} https://vm.tiktok.com/xyz*`

    await m.react('🕐')
    try {
        // Ejecutamos la función que está en la ruta Scrapers/Tiktokdl.js
        const links = await getDownloadLink(args[0]);

        if (links.length === 0) throw 'No se encontraron enlaces de descarga.';

        // Enviamos el video obtenido por el scraper
        await conn.sendMessage(m.chat, { 
            video: { url: links[0] }, 
            caption: '*Aquí tienes tu video de TikTok ฅ^•ﻌ•^ฅ*' 
        }, { quoted: m });

        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('> ❀ *Ocurrió un error al descargar el video. Inténtalo de nuevo más tarde.*')
    }
}

handler.help = ['tiktok «link»']
handler.tags = ['downloader']
handler.command = ['tt', 'tiktok', 'tiktokdl']

export default handler