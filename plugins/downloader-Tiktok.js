import { getDownloadLink } from '../Scrapers/Tiktokdl.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `> ❀ *Pasa el link de TikTok…*\n> *https://vm.tiktok.com/××××××*`

    await m.react('🕐')
    try {
        const links = await getDownloadLink(args[0]);
        if (!links || links.length === 0) throw 'Error';

        await conn.sendMessage(m.chat, { 
            video: { url: links[0] }, 
            caption: '*Aquí tienes tu video de TikTok ฅ^•ﻌ•^ฅ*' 
        }, { quoted: m });
        
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        m.reply('> ❀ *Ocurrió un error al descargar el video.*')
    }
}

handler.help = ['tiktok']
handler.tags = ['downloader']
handler.command = ['tt', 'tiktok']

export default handler