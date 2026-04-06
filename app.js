const express = require('express');
const { Readable } = require('stream');
const Tiktok = require('@tobyg74/tiktok-api-dl');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function normalizeFilename(name) {
  const base = (name || 'tiktok_video')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/[\r\n]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);

  return base || 'tiktok_video';
}

function buildContentDisposition(filename) {
  const fallbackName = normalizeFilename(filename.replace(/\.mp4$/i, '')) + '.mp4';
  const encodedName = encodeURIComponent(filename).replace(/['()*]/g, (ch) => {
    return `%${ch.charCodeAt(0).toString(16).toUpperCase()}`;
  });

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}

async function getTikTokContent(url) {
  const response = await Tiktok.Downloader(url, { version: 'v1' });

  if (response.status !== 'success' || !response.result) {
    throw new Error(response.message || 'No se pudo procesar la URL de TikTok.');
  }

  const { result } = response;
  if (result.type !== 'video') {
    throw new Error('Solo se admite la descarga de videos de TikTok.');
  }

  const downloadUrl =
    result.video?.downloadAddr?.[0] ||
    result.video?.playAddr?.[0] ||
    result.videoHD ||
    result.videoSD ||
    result.direct;

  if (!downloadUrl) {
    throw new Error('No se encontro enlace de descarga para este video.');
  }

  return {
    title: result.desc || 'Video de TikTok',
    duration: result.video?.duration || result.music?.duration || null,
    views: result.statistics?.playCount || null,
    uploader: result.author?.nickname || '',
    cover:
      result.video?.originCover?.[0] ||
      result.video?.cover?.[0] ||
      result.video?.dynamicCover?.[0] ||
      result.author?.avatar ||
      null,
    downloadUrl,
  };
}

// ── Rutas ────────────────────────────────────────────────────────────────────

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Info del video
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    const info = await getTikTokContent(url);
    res.json({
      title: info.title,
      duration: info.duration,
      views: info.views,
      uploader: info.uploader,
      cover: info.cover,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'No se pudo obtener la informacion del video.' });
  }
});

// Descarga del video
app.get('/api/download', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    const info = await getTikTokContent(url);
    const filename = `${normalizeFilename(info.title)}.mp4`;

    const remote = await fetch(info.downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://www.tiktok.com/',
      },
      redirect: 'follow',
    });

    if (!remote.ok || !remote.body) {
      throw new Error('TikTok rechazo la descarga del archivo.');
    }

    res.setHeader('Content-Disposition', buildContentDisposition(filename));
    res.setHeader('Content-Type', remote.headers.get('content-type') || 'video/mp4');

    Readable.fromWeb(remote.body).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message || 'No se pudo descargar el video.' });
  }
});

// Health check (útil para Docker)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Servidor corriendo`);
});