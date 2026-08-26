import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    Orígenes que `next dev` acepta además de `localhost`. Sin esto, abrir la app
    desde otra dirección —127.0.0.1, o el móvil por la IP de la red— sirve el
    HTML pero bloquea los recursos de desarrollo: React nunca hidrata y la sala
    se queda clavada en «Restaurando sesión...» para siempre.

    Solo afecta a `next dev`; en el build de producción no se usa. Si tu IP local
    cambia, el comodín de la subred la sigue cubriendo.
  */
  allowedDevOrigins: ["127.0.0.1", "192.168.0.209", "192.168.0.*"],
};

export default nextConfig;
