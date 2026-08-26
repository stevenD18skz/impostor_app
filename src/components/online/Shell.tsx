import type { ReactNode } from 'react';

/* El marco arcade que comparten la pantalla de entrada y la sala. Estaba
   copiado en cada vista; acá vive una sola vez. */

const SHELL =
  'flex items-center justify-center w-full min-h-screen bg-slate-900 font-vt323 selection:bg-pink-600 selection:text-white p-4';

const GRID = {
  backgroundImage:
    'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
  backgroundSize: '32px 32px',
};

function Corners() {
  return (
    <>
      <div className="absolute top-2 left-2 w-4 h-4 bg-pink-600" />
      <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-400" />
      <div className="absolute bottom-2 left-2 w-4 h-4 bg-cyan-400" />
      <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-600" />
    </>
  );
}

export default function Shell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={SHELL} style={GRID}>
      <div
        className={`relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-8 w-full text-center z-10 ${
          wide ? 'max-w-5xl' : 'max-w-2xl'
        }`}
      >
        <Corners />
        <div className="absolute inset-4 border-2 border-slate-700/50 pointer-events-none" />
        <div className="relative z-10 pt-4">{children}</div>
      </div>
    </div>
  );
}

export function Loading({ message }: { message: string }) {
  return (
    <Shell>
      <div className="animate-spin h-16 w-16 border-4 border-b-transparent border-cyan-400 mx-auto mb-6 mt-4" />
      <p className="text-cyan-400 text-2xl font-press-start mb-4">{message}</p>
    </Shell>
  );
}

/** El aviso de que faltan las credenciales de Supabase, que si no falla en silencio. */
export function NotConfigured() {
  return (
    <Shell>
      <h2 className="text-3xl font-bold text-pink-500 mb-4">Modo online sin configurar</h2>
      <p className="text-(--color-detail) text-xl mb-4">
        Falta crear un archivo <code className="text-cyan-400">.env.local</code> con las credenciales
        de Supabase:
      </p>
      <pre className="text-left text-cyan-300 text-base bg-slate-900 p-4 overflow-x-auto border-2 border-slate-700">
        {'NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key'}
      </pre>
      <p className="text-(--color-detail) text-lg mt-4">
        Están en Supabase → Settings → API. Después hay que reiniciar <code>pnpm dev</code>.
      </p>
    </Shell>
  );
}
