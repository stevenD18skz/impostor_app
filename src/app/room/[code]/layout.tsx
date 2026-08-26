import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { isValidCode, normalizeCode } from '@/lib/room';
import { siteUrl } from '@/lib/site';

/*
  La sala es una pantalla de cliente, así que los metadatos no pueden vivir en
  ella: `generateMetadata` solo corre en el servidor. Este layout existe para
  eso y para nada más — envuelve la página sin pintar nada.

  Sin esto, un enlace de sala pegado en WhatsApp sale con el título del sitio
  entero («Impostor-app») y sin contexto. Con esto sale el código de la sala y
  una invitación, que es lo que el que lo recibe necesita leer.
*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code: raw } = await params;
  const code = normalizeCode(raw);

  // Un código inválido igual se comparte alguna vez (un dedo torpe, un enlace
  // cortado): mejor un texto genérico que enseñar basura en la vista previa.
  const valid = isValidCode(code);

  const title = valid ? `Únete a la sala ${code}` : 'Únete a una sala';
  const description = valid
    ? `Te invitaron a jugar al Impostor. Entra con el código ${code}, escribe tu nombre y a descubrir quién miente.`
    : 'Entra, escribe tu nombre y descubre quién es el impostor.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // `images` no se declara a propósito: lo rellena `opengraph-image.tsx`.
      url: `${siteUrl}/room/${code}`,
      siteName: 'El Impostor',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function RoomLayout({ children }: { children: ReactNode }) {
  return children;
}
