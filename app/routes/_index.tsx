import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header.client';

export const meta: MetaFunction = () => {
  return [
    { title: 'Hima — Build apps with AI' },
    {
      name: 'description',
      content: 'Describe your idea and Hima will scaffold, code, and run it — right in your browser.',
    },
  ];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <ClientOnly fallback={<div className="h-[var(--header-height)]" />}>{() => <Header />}</ClientOnly>
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
