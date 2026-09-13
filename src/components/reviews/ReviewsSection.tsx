import { getReviews, calcularPromedio, calcularDistribucion } from "@/lib/reviews";
import { Stars } from "@/components/reviews/Stars";
import { ReviewCard } from "@/components/reviews/ReviewCard";

export async function ReviewsSection() {
  const reviews = await getReviews();
  const promedio = calcularPromedio(reviews);
  const distribucion = calcularDistribucion(reviews);
  const total = reviews.length;

  return (
    <section
      id="resenas"
      aria-labelledby="resenas-titulo"
      className="bg-carbon px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="resenas-titulo"
          className="font-display text-3xl text-hueso sm:text-4xl"
        >
          Lo que dicen
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-4 rounded-2xl border border-hueso/10 bg-grafito p-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl text-hueso">
                {promedio.toFixed(1)}
              </span>
              <div>
                <Stars calificacion={promedio} tamano={18} />
                <p className="mt-1 text-xs text-ceniza">
                  {total} {total === 1 ? "reseña" : "reseñas"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {distribucion.map((d) => {
                const porcentaje = total > 0 ? (d.cantidad / total) * 100 : 0;
                return (
                  <div key={d.calificacion} className="flex items-center gap-2 text-xs text-ceniza">
                    <span className="w-3 text-right">{d.calificacion}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-carbon">
                      <div
                        className="h-full rounded-full bg-brasa"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <span className="w-4 text-left">{d.cantidad}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
