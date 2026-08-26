import { ImageResponse } from 'next/og';

import { isValidCode, normalizeCode } from '@/lib/room';

/*
  La estampa que se ve en WhatsApp al pegar el enlace. Se dibuja por sala para
  que el código salga en la propia imagen: quien la recibe entiende de qué va
  antes de tocar nada, y si el enlace se rompe al reenviarlo todavía puede
  teclear el código a mano.

  Se pinta con estilos en línea porque esto no lo renderiza el navegador sino
  Satori, que no sabe de Tailwind ni de las variables CSS del tema. De ahí que
  los colores estén repetidos aquí en hexadecimal en vez de salir de globals.css.
*/

export const alt = 'Invitación a una sala de El Impostor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CYAN = '#22d3ee';
const PINK = '#db2777';
const ORANGE = '#f5a524';

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = normalizeCode(raw);
  const valid = isValidCode(code);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          padding: 48,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b',
            border: `8px solid #155e75`,
          }}
        >
          {/* Las cuatro esquinas del marco arcade, igual que en la app. */}
          <div style={{ position: 'absolute', top: 16, left: 16, width: 28, height: 28, backgroundColor: PINK }} />
          <div style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, backgroundColor: CYAN }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, width: 28, height: 28, backgroundColor: CYAN }} />
          <div style={{ position: 'absolute', bottom: 16, right: 16, width: 28, height: 28, backgroundColor: PINK }} />

          <div style={{ display: 'flex', fontSize: 30, color: '#cbd5e1', letterSpacing: 2 }}>
            TE INVITARON A JUGAR
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 84,
              fontWeight: 700,
              color: ORANGE,
              letterSpacing: 4,
              marginTop: 12,
            }}
          >
            EL IMPOSTOR
          </div>

          {valid ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 44,
              }}
            >
              <div style={{ display: 'flex', fontSize: 28, color: '#94a3b8', letterSpacing: 2 }}>
                SALA
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 108,
                  fontWeight: 700,
                  color: CYAN,
                  letterSpacing: 16,
                  marginTop: 4,
                }}
              >
                {code}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', fontSize: 34, color: '#94a3b8', marginTop: 44 }}>
              Entra y descubre quién miente
            </div>
          )}

          <div style={{ display: 'flex', fontSize: 28, color: '#cbd5e1', marginTop: 40 }}>
            Toca el enlace, escribe tu nombre y a jugar
          </div>
        </div>
      </div>
    ),
    size,
  );
}
