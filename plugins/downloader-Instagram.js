import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `*❀ Ingrese el enlace de Instagram.*\n> Ejemplo: *${usedPrefix + command} https://www.instagram.com/reel/xxxxxx`
    
    // Reacción de búsqueda 🕐
    await conn.sendMessage(m.chat, { react: { text: "🕐", key: m.key } })
    
    try {
        const url = encodeURIComponent(args[0])
        const apiUrl = `https://sylphy.xyz/download/instagram?url=${url}&api_key=${global.apikey}`
        
        const response = await fetch(apiUrl)
        const data = await response.json()
        
        if (!data.status || data.status !== 200) {
            throw data.message || 'Error en la API'
        }
        
        // Buscar el mejor video (calidad HD si existe)
        let videoUrl = data.result[0]?.url || data.result[0]?.downloadUrl
        
        // Si hay múltiples resultados, buscar el de mejor calidad
        if (data.result && data.result.length > 1) {
            const hdVideo = data.result.find(v => 
                v.quality?.includes('HD') || 
                v.quality?.includes('720') || 
                v.quality?.includes('1080') ||
                v.type === 'video'
            )
            if (hdVideo) videoUrl = hdVideo.url || hdVideo.downloadUrl
        }
        
        if (!videoUrl) throw '*❌ No se pudo obtener el video*'
        
        // Enviar el video con caption simple
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `> *☁️ Aqui Tienes Tu Video*`
        }, { quoted: m })
        
        // Reacción de éxito ✅️
        await conn.sendMessage(m.chat, { react: { text: "✅️", key: m.key } })
        
    } catch (error) {
        console.error('Error Instagram:', error)
        // Reacción de error ❌️
        await conn.sendMessage(m.chat, { react: { text: "❌️", key: m.key } })
        await m.reply(`❌ *Error:* ${error}`)
    }
}

handler.help = ['instagram']
handler.tags = ['downloader']
handler.command = ['instagram', 'ig', 'igdl']


export default handler