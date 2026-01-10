import { getDownloadLink } from '../Scrapers/Instagramdl.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `🎌 *Ingresa un enlace de Instagram*\n\n📌 Ejemplo: ${usedPrefix + command} https://www.instagram.com/reel/DQnRQuEkeAW/`
    
    // Reacción de búsqueda 🕐
    await conn.sendMessage(m.chat, { react: { text: "🕐", key: m.key } })
    
    try {
        const data = await getDownloadLink(args[0])
        
        if (data.error) throw data.message
        if (!data.best || !data.best.url) throw '❌ No se pudo obtener el video'
        
        const videoUrl = data.best.url
        
        // Enviar el video con caption simple
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `> *☁️ Aqui Tienes Tu Video*`
        }, { quoted: m })
        
        // Reacción de éxito ✅️
        await conn.sendMessage(m.chat, { react: { text: "✅️", key: m.key } })
        
    } catch (error) {
        console.error(error)
        // Reacción de error ❌️
        await conn.sendMessage(m.chat, { react: { text: "❌️", key: m.key } })
        await m.reply(`❌ *Error:* ${error}`)
    }
}

handler.help = ['instagram']
handler.tags = ['downloader']
handler.command = ['instagram', 'ig', 'igdl']

export default handler