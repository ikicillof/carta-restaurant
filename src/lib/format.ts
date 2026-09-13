import type { DiaSemana } from "@/data/types";

const formateadorARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrecio(precio: number): string {
  return formateadorARS.format(precio);
}

export const ORDEN_DIAS: { key: DiaSemana; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

/** getDay() de JS empieza en domingo (0); reordenamos a nuestro array lunes-domingo */
export function getDiaActual(fecha: Date = new Date()): DiaSemana {
  const indiceJs = fecha.getDay();
  const indice = indiceJs === 0 ? 6 : indiceJs - 1;
  return ORDEN_DIAS[indice].key;
}

export function formatFranjas(
  franjas: { desde: string; hasta: string }[]
): string {
  if (franjas.length === 0) return "Cerrado";
  return franjas.map((f) => `${f.desde} a ${f.hasta}`).join(" y ");
}

export function getWhatsappUrl(whatsapp: string, mensaje?: string): string {
  const numero = whatsapp.replace(/\D/g, "");
  const query = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${numero}${query}`;
}

const UN_DIA_MS = 1000 * 60 * 60 * 24;

export function formatFechaRelativa(
  fechaIso: string,
  ahora: Date = new Date()
): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  const dias = Math.round((ahora.getTime() - fecha.getTime()) / UN_DIA_MS);

  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Hace 1 día";
  if (dias < 30) return `Hace ${dias} días`;

  const meses = Math.round(dias / 30);
  if (meses <= 1) return "Hace 1 mes";
  if (meses < 12) return `Hace ${meses} meses`;

  const años = Math.round(meses / 12);
  return años <= 1 ? "Hace 1 año" : `Hace ${años} años`;
}
