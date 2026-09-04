import { handleApiRequest } from './app.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    if (url.pathname === '/admin' && env.ASSETS) {
      return Response.redirect(new URL('/admin/', url), 301);
    }
    return new Response('Not Found', { status: 404 });
  },
};
