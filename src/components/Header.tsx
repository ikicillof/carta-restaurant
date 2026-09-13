"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { getWhatsappUrl } from "@/lib/format";
import restaurant from "@/data/restaurant.json";

const LINKS = [
  { href: "#carta", label: "Carta" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#visitanos", label: "Visitanos" },
];

export function Header() {
  const [visible, setVisible] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const mostrarMenu = menuAbierto && visible;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-16 border-b border-hueso/10 bg-carbon/90 backdrop-blur transition-all duration-300 motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#inicio"
          className="shrink-0 text-hueso transition-colors hover:text-brasa"
        >
          <Logo variant="compact" className="h-7 w-auto sm:h-8" />
        </a>

        <nav
          aria-label="Secciones principales"
          className="hidden items-center gap-6 text-sm text-hueso/90 sm:flex"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brasa"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={getWhatsappUrl(
              restaurant.whatsapp,
              "Hola, quiero hacer una reserva en Rescoldo"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brasa px-3.5 py-2 text-xs font-medium text-carbon transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
          >
            WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={mostrarMenu}
            aria-controls="menu-mobile"
            aria-label={mostrarMenu ? "Cerrar menú" : "Abrir menú"}
            className="rounded-md p-2 text-hueso transition-colors hover:text-brasa sm:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {mostrarMenu ? (
                <path
                  d="M4 4L16 16M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 5H17M3 10H17M3 15H17"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mostrarMenu && (
        <nav
          id="menu-mobile"
          aria-label="Secciones principales"
          className="border-t border-hueso/10 bg-carbon px-4 py-3 sm:hidden"
        >
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block rounded-md px-2 py-2.5 text-base text-hueso/90 transition-colors hover:text-brasa"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
