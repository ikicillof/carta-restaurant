"use client";

import { useEffect, useRef, useState } from "react";
import type { Categoria } from "@/data/types";

interface CategoryNavProps {
  categorias: Categoria[];
}

export function CategoryNav({ categorias }: CategoryNavProps) {
  const [activa, setActiva] = useState<string>(categorias[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const secciones = categorias
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    if (secciones.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries.filter((e) => e.isIntersecting);
        if (visibles.length === 0) return;
        const primera = visibles.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiva(primera.target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    secciones.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categorias]);

  useEffect(() => {
    const contenedor = navRef.current;
    const boton = contenedor?.querySelector<HTMLAnchorElement>(
      `a[href="#${activa}"]`
    );
    if (!contenedor || !boton) return;

    // Desplazamos solo el scroll horizontal del propio contenedor: nunca
    // Element.scrollIntoView(), que puede arrastrar el scroll vertical de
    // toda la página si el nav está fuera del viewport al montar.
    const destino =
      boton.offsetLeft - (contenedor.clientWidth - boton.clientWidth) / 2;
    contenedor.scrollTo({ left: Math.max(destino, 0), behavior: "smooth" });
  }, [activa]);

  return (
    <div className="sticky top-16 z-30 -mx-6 border-b border-hueso/10 bg-carbon/95 px-6 backdrop-blur">
      <nav
        ref={navRef}
        aria-label="Categorías de la carta"
        className="mx-auto flex max-w-6xl gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categorias.map((cat) => {
          const esActiva = cat.id === activa;
          return (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              aria-current={esActiva ? "true" : undefined}
              className={`shrink-0 whitespace-nowrap border-b-2 py-3 text-sm transition-colors ${
                esActiva
                  ? "border-brasa text-hueso"
                  : "border-transparent text-ceniza hover:text-hueso"
              }`}
            >
              {cat.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
