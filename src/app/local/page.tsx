'use client';

import LocalGame from '@/app/local/components/LocalGame';
import { useRouter } from 'next/navigation';

export default function LocalGamePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
        <LocalGame onBack={() => router.back()} />
      </div>
    </div>
  );
}