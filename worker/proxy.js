const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

export const DEFAULT_API_UPSTREAM = 'http://api.ump45.top:19011';

export function resolveUpstream(env) {
  const value = typeof env?.API_UPSTREAM === 'string' ? env.API_UPSTREAM.trim() : '';
  if (!value) {
    return DEFAULT_API_UPSTREAM;
  }
  return value.replace(/\/+$/, '');
}

export function isApiPath(pathname) {
  return pathname === '/api' || pathname.startsWith('/api/');
}

export function buildUpstreamUrl(requestUrl, upstream) {
  const url = requestUrl instanceof URL ? requestUrl : new URL(requestUrl);
  const rest = url.pathname.replace(/^\/api/, '') || '/';
  const target = new URL(rest, `${upstream.replace(/\/+$/, '')}/`);
  target.search = url.search;
  return target;
}

export function filterRequestHeaders(headers) {
  const next = new Headers();
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      next.append(key, value);
    }
  });
  return next;
}

export function proxyApiRequest(request, upstream) {
  const target = buildUpstreamUrl(request.url, upstream);
  const init = {
    method: request.method,
    headers: filterRequestHeaders(request.headers),
    redirect: 'follow',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  return fetch(target, init);
}
