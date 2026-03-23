import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const DIST_DIR = resolve(process.cwd(), 'dist');
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function isImmutableAsset(pathname) {
  return pathname.startsWith('/assets/');
}

function isNoCacheAsset(pathname) {
  return (
    pathname === '/' ||
    pathname.endsWith('/index.html') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname === '/registerSW.js' ||
    /\/workbox-[^/]+\.js$/.test(pathname)
  );
}

function getCacheControl(pathname) {
  if (isNoCacheAsset(pathname)) {
    return 'no-cache, no-store, must-revalidate';
  }

  if (isImmutableAsset(pathname)) {
    return 'public, max-age=31536000, immutable';
  }

  return 'public, max-age=86400';
}

function getSafePathname(rawPathname) {
  const decodedPathname = decodeURIComponent(rawPathname);
  const normalizedPathname = normalize(decodedPathname).replace(/^(\.\.(\/|\\|$))+/, '');

  return normalizedPathname.startsWith('/') ? normalizedPathname : `/${normalizedPathname}`;
}

function resolveFilePath(pathname) {
  const relativePath = pathname === '/' ? '/index.html' : pathname;
  const absolutePath = resolve(join(DIST_DIR, `.${relativePath}`));

  if (!absolutePath.startsWith(DIST_DIR)) {
    return null;
  }

  return absolutePath;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sendFile(response, pathname, filePath, method) {
  const fileStats = await stat(filePath);
  const extension = extname(filePath).toLowerCase();

  response.statusCode = 200;
  response.setHeader('Content-Length', fileStats.size);
  response.setHeader('Content-Type', MIME_TYPES[extension] || 'application/octet-stream');
  response.setHeader('Cache-Control', getCacheControl(pathname));
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (pathname === '/sw.js') {
    response.setHeader('Service-Worker-Allowed', '/');
  }

  if (method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

function sendText(response, statusCode, message) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.end(message);
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';

  if (method !== 'GET' && method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendText(response, 405, 'Method Not Allowed');
    return;
  }

  try {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const safePathname = getSafePathname(requestUrl.pathname);
    const requestedFilePath = resolveFilePath(safePathname);

    if (!requestedFilePath) {
      sendText(response, 403, 'Forbidden');
      return;
    }

    if (await fileExists(requestedFilePath)) {
      await sendFile(response, safePathname, requestedFilePath, method);
      return;
    }

    const isHtmlNavigation =
      extname(safePathname) === '' &&
      (request.headers.accept || '').includes('text/html');

    if (safePathname === '/' || isHtmlNavigation) {
      const indexPath = resolveFilePath('/index.html');

      if (!indexPath) {
        sendText(response, 500, 'Missing index.html');
        return;
      }

      await sendFile(response, '/index.html', indexPath, method);
      return;
    }

    sendText(response, 404, 'Not Found');
  } catch (error) {
    console.error(error);
    sendText(response, 500, 'Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`CuadraFoto serving dist on http://${HOST}:${PORT}`);
});
