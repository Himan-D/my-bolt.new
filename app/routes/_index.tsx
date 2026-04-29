import { json, type MetaFunction } from '@remix-run/node';
import { ClientOnly } from 'remix-utils/client-only';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header.client';

export const meta: MetaFunction = () => {
  return [
    { title: 'Hima — AI-Powered Full-Stack Builder' },
    { name: 'description', content: 'Build production-ready apps with AI.' },
  ];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden">
      <ClientOnly fallback={<div className="h-14 shrink-0 bg-black" />}>{() => <Header />}</ClientOnly>
      <main className="flex-1 overflow-hidden">
        <ClientOnly
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-zinc-500">Loading...</div>
            </div>
          }
        >
          {() => <Chat />}
        </ClientOnly>
      </main>
    </div>
  );
}
