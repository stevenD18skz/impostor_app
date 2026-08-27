# Cómo funciona la sala online

> Para poner a andar el modo online, ver [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).
> Este documento explica el diseño, no la instalación.

## Cero consultas a la base de datos

No hay tablas. La sala es un canal de Supabase Realtime llamado
`impostor:<CÓDIGO>`, y todo pasa por ahí:

| Pieza         | Para qué                                                              |
| ------------- | --------------------------------------------------------------------- |
| **Presence**  | Quién está conectado. Una sala existe mientras haya alguien dentro.    |
| **Broadcast** | El estado del juego, ya resuelto, repartido por el anfitrión.          |

La versión anterior sí usaba tablas: cada cambio disparaba un evento de
`postgres_changes` y **cada** cliente respondía pidiendo la sala completa por
HTTP. Con 8 jugadores, iniciar la partida costaba ~150 consultas. Ahora cuesta
un mensaje.

## Quién manda

El anfitrión es el único que modifica el estado. Los demás le mandan
**intenciones** (`start`, `ready`, `settings`, `end`, `reset`) y él devuelve el
estado ya resuelto. Así no hay dos clientes decidiendo cosas distintas.

Quién es el anfitrión sale de Presence, no de un campo guardado: quien crea la
sala se declara `isHost`, y si cierra la pestaña el relevo lo toma el id más
bajo de los que quedan. Como todos ven la misma lista, todos llegan al mismo
nombre sin negociar.

## Los eventos

| Evento   | Dirección        | Qué dice                                    |
| -------- | ---------------- | ------------------------------------------- |
| `state`  | anfitrión → todos | El estado completo. Repetirlo no rompe nada. |
| `hello`  | recién llegado → anfitrión | «mándame el estado»                |
| `intent` | cualquiera → anfitrión | «quiero hacer esto»                    |

## Las rutas

| Ruta            | Qué hace                                                        |
| --------------- | --------------------------------------------------------------- |
| `/`             | Menú principal.                                                  |
| `/local`        | Partida local, en un solo dispositivo.                           |
| `/online`       | Nombre + crear o entrar. **No abre ningún canal.**               |
| `/room/[code]`  | La sala. Es la única pantalla que se conecta.                    |

Que el código esté en la URL es lo que hace la sala compartible: mandar
`/room/ABC123` es mandar la sala, y un F5 cae donde estaba en vez de rebotar al
menú. Quien abre el enlace sin haber pasado por el menú solo tiene que poner su
nombre.

## Una trampa que costó cara

`supabase.channel(topic)` **no** crea un canal nuevo si ya hay uno registrado con
ese topic: devuelve el que estaba e **ignora la configuración** que se le pase. Y
`removeChannel()` no lo saca de la lista al instante — lo hace cuando el servidor
confirma la salida. En el medio queda un canal en estado `leaving`, y
`subscribe()` sobre un canal que no está `closed` **no hace nada**: ni se une, ni
llama al callback, ni devuelve error.

Con eso la sala moría en silencio: React monta el efecto, lo desmonta y lo vuelve
a montar (StrictMode en desarrollo), o se venía de sondear ese mismo código antes
de entrar. El segundo `supabase.channel()` devolvía el cadáver del primero, y la
pantalla se quedaba en «Entrando a la sala...» para siempre — sin Presence y por
lo tanto sin nadie declarado anfitrión.

Por eso `releaseTopic()` en `src/lib/room.ts` espera a que el topic quede
realmente libre antes de volver a abrirlo, y por eso `/online` ya no sondea nada.

## Presence es caro; Broadcast no

No son dos sabores de lo mismo. Medido contra el proyecto real:

| Envío                              | Resultado                              |
| ---------------------------------- | -------------------------------------- |
| 80 `broadcast` en el mismo instante | ni se inmuta                           |
| 5 `track()` de Presence seguidos    | `Client presence rate limit exceeded` y **el servidor cierra el canal** |
| 6 `track()` separados 2 segundos    | lo mismo: no es un límite por segundo, es casi una cuota |

Y cuando el servidor cierra el canal, `realtime-js` lo marca `closed`, lo saca
del socket y **no lo reintenta nunca**; aunque lo reintentara, no vuelve a mandar
el `track()`, así que quedarías dentro del canal pero invisible en Presence.

De ahí salen dos reglas:

1. En Presence solo va la **identidad** (`id`, `name`, `isHost`) y se compara
   antes de mandar: repetir lo mismo no dice nada nuevo y cuesta el canal. Todo
   lo que cambia durante la partida viaja por Broadcast, que es barato.
2. `CLOSED` **no** es benigno. Es como avisa el servidor de que te echó, así que
   se rehace el canal entero (`relink` en `useOnlineGame`) con espera creciente.

Así se caía la sala antes: el anfitrión republicaba su Presence en cada cambio
de estado, cinco toques rápidos al ajuste de una sala bastaban para pasarse, y el
que se pasaba se quedaba con la lista de jugadores congelada dentro de una sala
donde ya nadie lo veía — mientras los demás coronaban anfitrión al siguiente.

## Qué NO es privado

El estado viaja completo a todos los que estén en el canal: quien abra las
herramientas de desarrollo puede ver la palabra y quién es el impostor. Taparlo
de verdad pide que el reparto lo haga un servidor y que cada jugador solo pueda
leer su propia carta.
