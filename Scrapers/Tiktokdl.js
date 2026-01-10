import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { promisify } from 'util';
import stream from 'stream';
import vm from 'vm';

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
        
        if (!token) return;

        const buildUrl = 'https://snaptik.app/abc2.php'; 
        const params = new URLSearchParams();
        params.append('url', videoUrl);
        params.append('lang', 'en2');
        params.append('token', token);

        const postResp = await client.post(buildUrl, params, { headers });
        const $res = cheerio.load(postResp.data);
        
        if (postResp.data.includes('eval(function(')) {
            try {
                const sandbox = { 
                    eval: (decoded) => { sandbox.decodedResult = decoded; },
                    console: console, Math: Math, String: String,
                    decodeURIComponent: decodeURIComponent, escape: escape,
                    window: {}, document: {}
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
                        const href = $d(el).attr('href');
                        if (href && (href.startsWith('https://') || href.startsWith('/'))) {
                            if ($d(el).text().toLowerCase().includes('download') || $d(el).attr('class')?.includes('download') || $d(el).attr('class')?.includes('btn')) {
                                decodedLinks.push(href);
                            }
                        }
                    });

                    if (decodedLinks.length > 0) {
                        const targetLink = decodedLinks[0];
                        try {
                            const videoResp = await client.get(targetLink, { 
                                responseType: 'stream',
                                headers: { ...headers, 'Referer': 'https://snaptik.app/' }
                            });
                            
                            const filename = `snaptik_video_${Date.now()}.mp4`;
                            const writer = fs.createWriteStream(filename);
                            await pipeline(videoResp.data, writer);
                            console.log(`✅ Video saved to ${filename}`);
                        } catch (dErr) {
                            console.error('Download failed:', dErr.message);
                        }
                    }
                }
            } catch (vmError) {
                console.error(vmError.message);
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

const TIKTOK_URL = 'https://www.tiktok.com/@philandmore/video/6805867805452324102'; 
scrapeSnapTik(TIKTOK_URL);