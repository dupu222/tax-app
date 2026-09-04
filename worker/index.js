import { isApiPath, proxyApiRequest, resolveUpstream } from './proxy.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (!isApiPath(pathname)) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      return await proxyApiRequest(request, resolveUpstream(env));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upstream request failed';
      return Response.json({ code: 502, message }, { status: 502 });
    }
  },
};
