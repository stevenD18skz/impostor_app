import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footes";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Base de la que cuelgan las URLs relativas de Open Graph. Sin esto Next
  // avisa por consola y las vistas previas se quedan sin imagen.
  metadataBase: new URL(siteUrl),
  title: {
    default: "El Impostor",
    // Cada sala pone su propio título y esto le añade el nombre del juego.
    template: "%s · El Impostor",
  },
  description:
    "Uno de ustedes no conoce la palabra secreta. Hablen, sospechen y descúbranlo.",
  openGraph: {
    siteName: "El Impostor",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${vt323.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
