import type { Review } from "@/data/types";
import { Avatar } from "@/components/reviews/Avatar";
import { Stars } from "@/components/reviews/Stars";
import { formatFechaRelativa } from "@/lib/format";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="flex h-full flex-col gap-3 border border-hueso/10 bg-grafito p-5">
      <div className="flex items-center gap-3">
        <Avatar iniciales={review.iniciales} color={review.colorAvatar} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-hueso">
            {review.autor}
          </p>
          <p className="text-xs text-ceniza">
            {review.resenasDelAutor}{" "}
            {review.resenasDelAutor === 1 ? "reseña" : "reseñas"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Stars calificacion={review.calificacion} />
        <span className="text-xs text-ceniza">
          {formatFechaRelativa(review.fecha)}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-hueso/85">{review.texto}</p>

      {review.plato && (
        <span className="mt-auto inline-flex w-fit items-center rounded-[2px] border border-ceniza/30 px-2.5 py-1 text-xs text-ceniza">
          {review.plato}
        </span>
      )}
    </article>
  );
}
