const encoder = new TextEncoder();

export function resolveTokenSecret(env) {
  return env?.TOKEN_SECRET || env?.ADMIN_KEY || '';
}

export async function hashPassword(password) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(String(password || '')));
  return bytesToHex(new Uint8Array(digest));
}

export function readHeader(request, name) {
  return request.headers.get(name) || request.headers.get(name.toLowerCase()) || '';
}

export function readAdminKey(request) {
  const header = readHeader(request, 'X-Admin-Key').trim();
  if (header) {
    return header;
  }
  const auth = readHeader(request, 'Authorization');
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export async function isAdminRequest(request, env) {
  const expected = typeof env?.ADMIN_KEY === 'string' ? env.ADMIN_KEY : '';
  if (!expected) {
    return false;
  }
  return timingSafeEqual(readAdminKey(request), expected);
}

export async function signUserToken(payload, secret) {
  const body = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = toBase64Url(JSON.stringify(body));
  const signature = await sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export async function verifyUserToken(token, secret) {
  if (!token || !secret || !token.includes('.')) {
    return null;
  }
  const [encoded, signature] = token.split('.');
  const expected = await sign(encoded, secret);
  if (!timingSafeEqual(signature, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(fromBase64Url(encoded));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function readAccessUser(request, env) {
  const token = readHeader(request, 'X-Access-Token').trim();
  if (!token) {
    return null;
  }
  return verifyUserToken(token, resolveTokenSecret(env));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(signature);
}

function timingSafeEqual(left, right) {
  const a = encoder.encode(String(left || ''));
  const b = encoder.encode(String(right || ''));
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toBase64Url(value) {
  const text =
    typeof value === 'string'
      ? btoa(unescape(encodeURIComponent(value)))
      : btoa(String.fromCharCode(...new Uint8Array(value)));
  return text.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  return decodeURIComponent(escape(atob(padded)));
}
