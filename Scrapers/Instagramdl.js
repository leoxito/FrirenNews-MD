// Hecho por Ado :D
import axios from 'axios'
import * as cheerio from 'cheerio'

const IG_URL = 'https://www.instagram.com/reel/DQnRQuEkeAW/?igsh=MTBpNjNkd3F4ejAxYw=='
const LOCALE = 'es'

function normalizeIgUrl(u = '') {
  const s = String(u || '').trim()
  if (!s) return ''
  const url = new URL(s)
  url.hash = ''
  return url.toString()
}

function extractShortcode(u = '') {
  const url = new URL(u)
  const parts = url.pathname.split('/').filter(Boolean)
  const i = parts.findIndex(p => p === 'reel' || p === 'p' || p === 'tv')
  return i >= 0 ? (parts[i + 1] || '') : ''
}

function buildPostUrl(igUrl) {
  const u = new URL(igUrl)
  const shortcode = extractShortcode(igUrl)
  if (!shortcode) throw new Error('No pude sacar el shortcode del link')
  const igsh = u.searchParams.get('igsh')
  const base = `https://reelsvideo.io/${LOCALE}/${(u.pathname.includes('/p/') ? 'p' : u.pathname.includes('/tv/') ? 'tv' : 'reel')}/${shortcode}/`
  return igsh ? `${base}?igsh=${encodeURIComponent(igsh)}` : base
}

function guessTT() {
  return Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32)
}

function firstHttpUrl(s = '') {
  const m = String(s || '').match(/https?:\/\/[^\s"'<>]+/i)
  return m ? m[0] : ''
}

async function main() {
  const igUrl = normalizeIgUrl(IG_URL)
  const postUrl = buildPostUrl(igUrl)

  const body = new URLSearchParams({
    id: igUrl,
    locale: LOCALE,
    tt: guessTT(),
    ts: String(Math.floor(Date.now() / 1000))
  }).toString()

  const headers = {
    'HX-Request': 'true',
    'HX-Trigger': 'main-form',
    'HX-Target': 'target',
    'HX-Current-URL': `https://reelsvideo.io/${LOCALE}`,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    Accept: 'text/html, */*;q=0.9'
  }

  const res = await axios.post(postUrl, body, {
    headers,
    timeout: 30000,
    responseType: 'text',
    validateStatus: s => s >= 200 && s < 300
  })

  const html = String(res.data || '')
  const $ = cheerio.load(html)

  const links = $('a.download_link, a.type_videos, a[href*="ssscdn.io/reelsvideo/"]')
    .map((_, el) => ({
      url: ($(el).attr('href') || '').trim(),
      label: ($(el).text() || '').replace(/\s+/g, ' ').trim()
    }))
    .get()
    .filter(x => x.url)

  const best =
    links.find(x => /descargar\s*video/i.test(x.label)) ||
    links.find(x => /video/i.test(x.label)) ||
    links[0] ||
    null

  const thumb =
    firstHttpUrl($('[data-bg]').first().attr('data-bg') || '') ||
    firstHttpUrl($('.bg-cover').first().attr('style') || '') ||
    ''

  const username = $('.text-400-16-18').first().text().trim() || ''

  const out = {
    ok: Boolean(best?.url),
    creator: "Ado",
    best: best ? { url: best.url, label: best.label || 'video' } : null,
    links,
    meta: {
      username: username || null,
      thumb: thumb || null
    }
  }

  process.stdout.write(JSON.stringify(out, null, 2))
}

main().catch(e => {
  const err = e?.response?.data
  const detail = typeof err === 'string' ? err.slice(0, 1200) : err
  process.stdout.write(JSON.stringify({ error: e?.message || String(e), detail }, null, 2))
  process.exit(1)
})