import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { promisify } from 'util';
import stream from 'stream';
import vm from 'vm';
import path from 'path';

const pipeline = promisify(stream.pipeline);
const client = axios.create();

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://snaptik.app',
    'Referer': 'https://snaptik.app/en2',
    'X-Requested-With': 'XMLHttpRequest'
};

async function scrapeSnapTik(videoUrl) {
    try {
        const baseUrl = 'https://snaptik.app/en2';
        const pageResp = await client.get(baseUrl, { 
            headers: { ...headers, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8' }
        });
        
        const $ = cheerio.load(pageResp.data);
        const token = $('input[name="token"]').val();
        
        if (!token) throw new Error('Token not found');

        const buildUrl = 'https://snaptik.app/abc2.php'; 
        const params = new URLSearchParams();
        params.append('url', videoUrl);
        params.append('lang', 'en2');
        params.append('token', token);

        const postResp = await client.post(buildUrl, params, { headers });
        
        if (postResp.data.includes('eval(function(')) {
            try {
                const sandbox = { 
                    eval: (decoded) => { sandbox.decodedResult = decoded; },
                    console: console, Math: Math, String: String,
                    decodeURIComponent: decodeURIComponent, escape: escape,
                    window: {}, document: {},
                };
                
                vm.createContext(sandbox);
                vm.runInContext(postResp.data, sandbox);
                
                if (sandbox.decodedResult) {
                    let htmlContent = sandbox.decodedResult;
                    const innerHtmlMatch = sandbox.decodedResult.match(/innerHTML\s*=\s*"(.*?)";/s);
                    if (innerHtmlMatch) {
                        htmlContent = innerHtmlMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '');
                    }

                    const $d = cheerio.load(htmlContent);
                    const decodedLinks = [];
                    
                    $d('a').each((i, el) => {
                        let href = $d(el).attr('href');
                        if (href) {
                            if (href.startsWith('/')) {
                                href = 'https://snaptik.app' + href;
                            }
                            
                            if ($d(el).text().toLowerCase().includes('download') || 
                                $d(el).attr('class')?.includes('download') || 
                                $d(el).attr('class')?.includes('btn')) {
                                decodedLinks.push({
                                    url: href,
                                    text: $d(el).text().trim()
                                });
                            }
                        }
                    });

                    if (decodedLinks.length > 0) {
                        return {
                            success: true,
                            links: decodedLinks,
                            originalUrl: videoUrl
                        };
                    } else {
                         throw new Error('No download links found in decoded content');
                    }
                } else {
                    throw new Error('Eval failed to produce decoded content');
                }
            } catch (vmError) {
               throw new Error('VM Execution Error: ' + vmError.message);
            }
        } else {
             throw new Error('Invalid response format (not obfuscated JS)');
        }
    } catch (error) {
        throw error;
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`*❀ Ingrese el enlace de TikTok.*\n> Ejemplo: *${usedPrefix + command} https://vm.tiktok.com/xxxxxx*`);
    }

    const videoUrl = args[0];
    if (!videoUrl.match(/tiktok/gi)) {
          return m.reply(`> *❌ Enlace no válido. Asegúrese de que sea un enlace de TikTok.*`);
    }

    await m.react('🕐').catch(() => {});

    try {
        const result = await scrapeSnapTik(videoUrl);
        
        if (result && result.success && result.links.length > 0) {
            const targetLink = result.links[0].url;

            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
            
            const filename = `tiktok_${Date.now()}.mp4`;
            const filePath = path.join(tmpDir, filename);

            const writer = fs.createWriteStream(filePath);
            
            await new Promise(async (resolve, reject) => {
                 try {
                    const videoResp = await client.get(targetLink, { 
                        responseType: 'stream',
                        headers: { ...headers, 'Referer': 'https://snaptik.app/' }
                    });
                    
                    videoResp.data.pipe(writer);
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                 } catch (err) {
                     reject(err);
                 }
            });

            await conn.sendMessage(m.chat, {
                video: { url: filePath },
                caption: `*☁️ TikTok descargado*`
            }, { quoted: m });

            // Clean up
            fs.unlinkSync(filePath);
            await m.react('✅').catch(() => {});

        } else {
            throw new Error('No se encontraron enlaces de descarga.');
        }

    } catch (e) {
        console.error(e);
        await m.react('❌').catch(() => {});
        m.reply(`*❌ Error al descargar el video: ${e.message}*`);
    }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = ['tiktok', 'tt'];

export default handler;
