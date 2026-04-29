import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node';
import { useStore } from '@nanostores/react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { initializeProvidersFromEnv } from './lib/stores/providers';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export const loader = async ({ context }: LoaderFunctionArgs) => {
  return json({
    ENV: {
      OPENAI_API_KEY: (context as any)?.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
      GOOGLE_API_KEY: (context as any)?.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
      SUPABASE_URL: (context as any)?.SUPABASE_URL || process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: (context as any)?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    },
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  const theme = useStore(themeStore);

  useEffect(() => {
    if (data?.ENV) {
      (window as any).ENV = data.ENV;
      initializeProvidersFromEnv();
    }
  }, [data]);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <Outlet />
      <ScrollRestoration />
      <Scripts />
    </>
  );
}
