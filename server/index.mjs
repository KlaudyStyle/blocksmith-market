import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getProduct, InvalidProductQuery, listProducts } from './products.mjs';

const frontendDirectory = fileURLToPath(new URL('../client/dist/', import.meta.url));
const mediaTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function sendNotFound(response, message = 'Страница не найдена.') {
  sendJson(response, 404, { message });
}

function handleProducts(request, response, url) {
  const route = /^\/(?:api\/)?products(?:\/([^/]+))?\/?$/.exec(url.pathname);
  if (!route) return sendNotFound(response);

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { message: 'Для этого ресурса доступен метод GET.' });
  }

  const slug = route[1];
  if (!slug) return sendJson(response, 200, listProducts(url.search));

  const product = getProduct(decodeURIComponent(slug));
  if (!product) return sendNotFound(response, 'Плагин не найден.');
  sendJson(response, 200, product);
}

async function serveFrontend(request, response, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return sendJson(response, 405, { message: 'Для этой страницы доступны методы GET и HEAD.' });
  }

  const pathname = decodeURIComponent(url.pathname);
  const isAsset = pathname.startsWith('/assets/');
  const extension = extname(pathname);
  const isFile = isAsset || Boolean(extension);
  const type = mediaTypes.get(isFile ? extension.toLowerCase() : '.html');
  if (!type || pathname.includes('\\') || pathname.includes('\0')) return sendNotFound(response);

  const file = resolve(frontendDirectory, isFile ? `.${pathname}` : 'index.html');
  const localPath = relative(frontendDirectory, file);
  if (isAbsolute(localPath) || localPath === '..' || localPath.startsWith(`..${sep}`)) {
    return sendNotFound(response);
  }

  let body;
  try {
    body = await readFile(file);
  } catch (error) {
    if (!['ENOENT', 'EISDIR', 'ENOTDIR'].includes(error.code)) throw error;
    return sendNotFound(response);
  }

  response.writeHead(200, { 'Content-Type': type, 'Content-Length': body.byteLength });
  response.end(request.method === 'HEAD' ? undefined : body);
}

export function createAppServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');

      if (/^\/(?:api(?:\/|$)|products(?:\/|$))/.test(url.pathname)) {
        handleProducts(request, response, url);
        return;
      }

      await serveFrontend(request, response, url);
    } catch (error) {
      if (error instanceof InvalidProductQuery || error instanceof URIError || error.code === 'ERR_INVALID_URL') {
        sendJson(response, 400, { message: error instanceof InvalidProductQuery ? error.message : 'Некорректный URL запроса.' });
        return;
      }

      console.error(error);
      sendJson(response, 500, { message: 'Внутренняя ошибка сервера.' });
    }
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT должен быть целым числом от 1 до 65535.');
  }

  createAppServer().listen(port, '127.0.0.1', () => {
    console.log(`Blocksmith Market: http://127.0.0.1:${port}`);
  });
}
