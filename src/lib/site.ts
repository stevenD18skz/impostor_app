/*
  De dónde cuelgan los enlaces absolutos de los metadatos.

  Open Graph no admite rutas relativas: si `og:image` no es una URL completa,
  WhatsApp no enseña nada. En Vercel la dirección la pone el entorno, así que no
  hay que tocar nada al desplegar; en local cae al puerto de `next dev`.

  Ojo: estas variables NO llevan `NEXT_PUBLIC_`, así que solo existen en el
  servidor. Este módulo se importa desde `generateMetadata` y desde la imagen de
  Open Graph, que son servidor. Importarlo en un componente cliente daría
  `undefined` y el enlace saldría apuntando a localhost.
*/
function resolveSiteUrl(): string {
  // Puesto a mano: manda sobre todo lo demás. Útil con dominio propio.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  // En producción se prefiere el dominio estable del proyecto antes que la URL
  // del despliegue, que cambia en cada deploy y afea el enlace compartido.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === 'production' && production) return `https://${production}`;

  // En preview, la del despliegue actual: es la única que existe de verdad.
  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const siteUrl = resolveSiteUrl();
