import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { EmbersOverlay } from "@/components/EmbersOverlay";
import restaurant from "@/data/restaurant.json";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: `${restaurant.nombre} — ${restaurant.bajada}`,
  description: `${restaurant.nombre}, parrilla en ${restaurant.direccion.barrio}. ${restaurant.historia[0]}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-carbon text-hueso font-sans antialiased">
        {children}
        <EmbersOverlay />
      </body>
    </html>
  );
}
