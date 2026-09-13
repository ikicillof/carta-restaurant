import restaurant from "@/data/restaurant.json";

export function About() {
  return (
    <section
      id="sobre-nosotros"
      aria-labelledby="sobre-nosotros-titulo"
      className="bg-carbon px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-2xl">
        <h2
          id="sobre-nosotros-titulo"
          className="font-display text-3xl text-hueso sm:text-4xl"
        >
          Fuego lento
        </h2>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-ceniza sm:text-lg">
          {restaurant.historia.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
