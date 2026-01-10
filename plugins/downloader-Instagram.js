import { getDownloadLink } from '../Scrapers/Instagramdl.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `*❀ Ingrese el enlace de Instagram.*\n> Ejemplo: *${usedPrefix + command} https://www.instagram.com/reel/xxxxxx`
    
    await conn.sendMessage(m.chat, { react: { text: "🕐", key: m.key } })
    
    try {
        const data = await getDownloadLink(args[0])
        
        if (data.error) throw data.error
        if (!data.best || !data.best.url) throw '*❌ No se pudo obtener el video*'
        
        await conn.sendMessage(m.chat, {
            video: { url: data.best.url },
            caption: `> *☁️ Aqui Tienes Tu Video*`
        }, { quoted: m })
        
        await conn.sendMessage(m.chat, { react: { text: "✅️", key: m.key } })
        
    } catch (error) {
        await conn.sendMessage(m.chat, { react: { text: "❌️", key: m.key } })
        await m.reply(`❌ *Error:* ${error}`)
    }
}

handler.help = ['instagram']
handler.tags = ['downloader']
handler.command = ['instagram', 'ig', 'igdl']


export default handler