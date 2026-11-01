/* Speichert verschlüsselte Blöcke. Der Inhalt ist hier nicht lesbar: Schlüssel und Klartext
   verlassen die Geräte nie. Die Version verhindert, dass ein Gerät ein anderes überschreibt. */
const MAX_BYTES = 1_900_000;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'If-Match, If-None-Match, Content-Type',
  'Access-Control-Expose-Headers': 'ETag',
  'Access-Control-Max-Age': '86400',
};
const reply = (status, body = null, headers = {}) => new Response(body, { status, headers: { ...CORS, ...headers } });

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return reply(204);
    const id = new URL(request.url).pathname.match(/^\/v1\/([a-f0-9]{32})$/)?.[1];
    if (!id) return reply(404);

    if (request.method === 'GET') {
      const known = request.headers.get('If-None-Match');
      const row = await env.DB.prepare('SELECT version FROM blobs WHERE id = ?').bind(id).first();
      if (!row) return reply(404);
      if (known === String(row.version)) return reply(304, null, { ETag: String(row.version) });
      const full = await env.DB.prepare('SELECT version, data FROM blobs WHERE id = ?').bind(id).first();
      return reply(200, new Uint8Array(full.data), { ETag: String(full.version), 'Content-Type': 'application/octet-stream', 'Cache-Control': 'no-store' });
    }

    if (request.method === 'PUT') {
      const expected = Number(request.headers.get('If-Match'));
      if (!Number.isInteger(expected) || expected < 0) return reply(400);
      const data = new Uint8Array(await request.arrayBuffer());
      if (!data.length) return reply(400);
      if (data.length > MAX_BYTES) return reply(413);
      const now = Date.now(), next = expected + 1;
      const result = expected === 0
        ? await env.DB.prepare('INSERT INTO blobs (id, version, data, updated) VALUES (?, 1, ?, ?) ON CONFLICT(id) DO NOTHING').bind(id, data, now).run()
        : await env.DB.prepare('UPDATE blobs SET version = ?, data = ?, updated = ? WHERE id = ? AND version = ?').bind(next, data, now, id, expected).run();
      if (!result.meta.changes) return reply(412);
      return reply(200, null, { ETag: String(next) });
    }
    return reply(405);
  },
};
