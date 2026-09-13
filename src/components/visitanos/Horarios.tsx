"use client";

import { useEffect, useState } from "react";
import type { RestaurantData, DiaSemana } from "@/data/types";
import { ORDEN_DIAS, formatFranjas, getDiaActual } from "@/lib/format";

interface HorariosProps {
  horarios: RestaurantData["horarios"];
}

export function Horarios({ horarios }: HorariosProps) {
  const [diaActual, setDiaActual] = useState<DiaSemana | null>(null);

  useEffect(() => {
    // El día "actual" depende del reloj del visitante, no del build estático:
    // se resuelve post-mount a propósito para no romper la hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDiaActual(getDiaActual());
  }, []);

  return (
    <ul className="flex flex-col divide-y divide-hueso/10">
      {ORDEN_DIAS.map(({ key, label }) => {
        const horario = horarios[key];
        const esHoy = key === diaActual;
        return (
          <li
            key={key}
            className={`flex items-center justify-between gap-4 py-2.5 text-sm ${
              esHoy ? "text-hueso" : "text-ceniza"
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              {label}
              {esHoy && (
                <span className="rounded-full bg-brasa px-2 py-0.5 text-[10px] font-medium text-carbon">
                  Hoy
                </span>
              )}
            </span>
            <span className={esHoy ? "font-medium" : ""}>
              {horario.abierto ? formatFranjas(horario.franjas) : "Cerrado"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
