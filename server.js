import { config as dotenvConfig } from 'dotenv';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';

dotenvConfig({ path: './.env.local', override: true });
const envParsed = parse(readFileSync('./.env.local'));
const OPENAI_API_KEY = envParsed.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const GOOGLE_API_KEY = envParsed.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
const SUPABASE_URL = envParsed.SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = envParsed.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Loaded API key:', OPENAI_API_KEY ? 'yes' : 'no');
console.log('Loaded Google key:', GOOGLE_API_KEY ? 'yes' : 'no');
console.log('Loaded Supabase:', SUPABASE_URL ? 'yes' : 'no');

import { createRequestHandler } from '@remix-run/express';
import { installGlobals } from '@remix-run/node';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

installGlobals();

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();

app.use(compression());
app.disable('x-powered-by');

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }));
}

app.use(express.static('build/client', { maxAge: '1h' }));
app.use(morgan('tiny'));

app.all(
  '*',
  createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
      : await import('./build/server/index.js'),
    getLoadContext: () => ({
      OPENAI_API_KEY,
      GOOGLE_API_KEY,
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    }),
  }),
);

const port = process.env.PORT || 5173;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Express server listening on http://${host}:${port}`);
});
