# Configurar el modo online

El modo online **no usa base de datos**. No hay tablas, ni RLS, ni SQL que
ejecutar. La sala entera vive en un canal de Supabase Realtime:

- **Presence** dice quién está en la sala. Una sala existe mientras haya alguien
  dentro; quien cierra la pestaña desaparece solo.
- **Broadcast** reparte el estado del juego. El anfitrión es el único que lo
  modifica; los demás le mandan intenciones y él devuelve el resultado.

Por eso alcanza con dos variables de entorno.

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) y crea un
   proyecto (el plan gratuito sirve de sobra).
2. Ve a **Settings** (⚙️) → **API** y copia:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon public** key

## 2. Crear `.env.local`

En la raíz del proyecto, junto a `package.json`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Hay una plantilla en `.env.example`. El archivo está en `.gitignore`: no se sube
al repositorio.

> ⚠️ Sin este archivo la app avisa en pantalla («Modo online sin configurar») en
> vez de quedarse cargando para siempre. El modo local funciona igual.

## 3. Reiniciar el servidor

Next.js lee las variables `NEXT_PUBLIC_*` al arrancar:

```bash
pnpm dev
```

## 4. Probarlo

1. Abre `http://localhost:3000` → **ONLINE** → escribe tu nombre → **Crear Sala**.
2. Caes en `/room/ABC123`. Deberías verte en la lista con la etiqueta **HOST**.
3. Copia el enlace con el botón **Copiar enlace** y ábrelo en otra ventana (o en
   el teléfono, usando la IP de tu máquina en vez de `localhost`). Solo hay que
   poner un nombre.
4. Con 3 jugadores, el anfitrión puede iniciar la partida.

## Al desplegar (Vercel)

Las mismas dos variables hay que cargarlas en **Project → Settings →
Environment Variables**, y volver a desplegar para que el build las tome.

## Sobre la privacidad

El estado viaja completo a todos los que estén en el canal: quien abra las
herramientas de desarrollo puede ver la palabra y quién es el impostor. Para
taparlo de verdad haría falta que el reparto lo hiciera un servidor y que cada
jugador solo pudiera leer su propia carta. Se puede montar después sin tocar
nada de lo que hay hoy.
