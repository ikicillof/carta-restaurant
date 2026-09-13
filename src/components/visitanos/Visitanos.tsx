import Image from "next/image";
import restaurant from "@/data/restaurant.json";
import type { RestaurantData } from "@/data/types";
import { Horarios } from "@/components/visitanos/Horarios";

const data = restaurant as RestaurantData;

export function Visitanos() {
  return (
    <section
      id="visitanos"
      aria-labelledby="visitanos-titulo"
      className="bg-carbon px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="visitanos-titulo"
          className="font-display text-3xl text-hueso sm:text-4xl"
        >
          Visitanos
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="font-display text-xl text-hueso">Dirección</h3>
              <p className="mt-2 text-ceniza">
                {data.direccion.calle}, {data.direccion.barrio}
                <br />
                {data.direccion.ciudad}
              </p>
              <a
                href={data.direccion.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brasa px-5 py-2.5 text-sm font-medium text-carbon transition-opacity hover:opacity-90"
              >
                Cómo llegar
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M3 11L11 3M11 3H5M11 3V9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            <div>
              <h3 className="font-display text-xl text-hueso">Horarios</h3>
              <div className="mt-2">
                <Horarios horarios={data.horarios} />
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl text-hueso">Contacto</h3>
              <p className="mt-2 text-ceniza">
                <a
                  href={`tel:${data.telefono.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-brasa"
                >
                  {data.telefono}
                </a>
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-hueso/10 lg:aspect-square">
            <Image
              src="/images/mapa-palermo.svg"
              alt={`Mapa ilustrado de la ubicación de Rescoldo en ${data.direccion.barrio}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
