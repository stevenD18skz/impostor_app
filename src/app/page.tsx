'use client';

import { useRouter } from 'next/navigation';

import MainMenu from '@/components/MainMenu';

export default function Home() {
  const router = useRouter();

  return (
    <MainMenu
      onLocalPlay={() => router.push('/local')}
      onOnlinePlay={() => router.push('/online')}
    />
  );
}
