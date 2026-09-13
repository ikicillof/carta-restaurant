import type { Review } from "@/data/types";
import reviewsData from "@/data/reviews.json";

/**
 * Adaptador de reseñas. Hoy lee el JSON local de la demo.
 *
 * Para conectar la Google Places API el día que el cliente tenga ficha,
 * este es el único archivo que hay que tocar: reemplazar el cuerpo por el
 * fetch a la API y mapear su respuesta a `Review[]`.
 *
 * Dos restricciones de esa API a tener en cuenta antes de migrar:
 * - Devuelve como máximo 5 reseñas por lugar, elegidas por Google (no las
 *   más recientes ni las mejores necesariamente), sin control nuestro.
 * - Sus términos de servicio no permiten cachear ni persistir esas reseñas:
 *   hay que pedirlas en cada carga, lo que descarta pre-renderizarlas en
 *   una exportación estática como esta.
 */
export async function getReviews(): Promise<Review[]> {
  return reviewsData as Review[];
}

export interface DistribucionEstrellas {
  calificacion: 1 | 2 | 3 | 4 | 5;
  cantidad: number;
}

export function calcularPromedio(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const suma = reviews.reduce((acc, r) => acc + r.calificacion, 0);
  return suma / reviews.length;
}

export function calcularDistribucion(reviews: Review[]): DistribucionEstrellas[] {
  const conteo: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    conteo[r.calificacion] += 1;
  }
  return [5, 4, 3, 2, 1].map((calificacion) => ({
    calificacion: calificacion as 1 | 2 | 3 | 4 | 5,
    cantidad: conteo[calificacion],
  }));
}
