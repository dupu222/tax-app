import { createMemoryBucket } from './bucket.js';
import { handleApiRequest } from './app.js';

function nodeHeaders(raw) {
  const headers = new Headers();
  Object.entries(raw || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
      return;
    }
    if (value != null) {
      headers.set(key, String(value));
    }
  });
  return headers;
}

function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export function createLocalTaxApiPlugin(options = {}) {
  const env = {
    TAX_DATA: options.bucket || createMemoryBucket(),
    ADMIN_KEY: options.adminKey || process.env.ADMIN_KEY || 'dev-admin-key',
    TOKEN_SECRET: options.tokenSecret || process.env.TOKEN_SECRET || 'dev-token-secret',
  };

  function attach(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url === '/admin/') {
        req.url = '/admin/index.html';
      }
      next();
    });
    server.middlewares.use(async (req, res, next) => {
      if (!req.url || !(req.url === '/api' || req.url.startsWith('/api/'))) {
        next();
        return;
      }
      try {
        const body = await readBody(req);
        const request = new Request(`http://127.0.0.1${req.url}`, {
          method: req.method,
          headers: nodeHeaders(req.headers),
          body,
          duplex: body ? 'half' : undefined,
        });
        const response = await handleApiRequest(request, env);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        res.end(buffer);
      } catch (error) {
        next(error);
      }
    });
  }

  return {
    name: 'local-tax-api',
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
