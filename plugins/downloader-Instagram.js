import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `*❀ Ingrese el enlace de Instagram.*\n> Ejemplo: *${usedPrefix + command} https://www.instagram.com/reel/xxxxxx`

    await conn.sendMessage(m.chat, { react: { text: "🕐", key: m.key } })

    try {
        const url = encodeURIComponent(args[0])
        const apiUrl = `https://sylphy.xyz/download/instagram?url=${url}&api_key=${global.apikey}`

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (!data.status || data.status !== 200) {
            throw data.message || 'Error en la API'
        }

        if (!data.result || data.result.length === 0) {
            throw '*❌ No se encontró contenido descargable*'
        }

        let videoUrl = data.result[1]

        if (!videoUrl && data.result[0]) {
            videoUrl = data.result[0]
        }

        if (!videoUrl || !videoUrl.startsWith('http')) {
            throw '*❌ No se pudo obtener el video*'
        }

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `> *☁️ Aqui Tienes Tu Video*`
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: "✅️", key: m.key } })

    } catch (error) {
        console.error('Error Instagram:', error)
        await conn.sendMessage(m.chat, { react: { text: "❌️", key: m.key } })
        await m.reply(`❌ *Error:* ${error}`)
    }
}

handler.help = ['instagram']
handler.tags = ['downloader']
handler.command = ['instagram', 'ig', 'igdl']

export default handler