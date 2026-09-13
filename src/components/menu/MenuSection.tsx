import menu from "@/data/menu.json";
import type { MenuData } from "@/data/types";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { DishCard } from "@/components/menu/DishCard";

const data = menu as MenuData;

export function MenuSection() {
  return (
    <section
      id="carta"
      aria-labelledby="carta-titulo"
      className="bg-carbon px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="carta-titulo"
          className="font-display text-3xl text-hueso sm:text-4xl"
        >
          La carta
        </h2>
      </div>

      <div className="mt-8">
        <CategoryNav categorias={data.categorias} />
      </div>

      <div className="mx-auto max-w-6xl">
        {data.categorias.map((categoria) => {
          const platos = data.platos.filter(
            (p) => p.categoria === categoria.id
          );
          return (
            <div
              key={categoria.id}
              id={categoria.id}
              className="scroll-mt-32 pt-12 first:pt-10"
            >
              <h3 className="font-display text-2xl text-hueso">
                {categoria.label}
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {platos.map((plato) => (
                  <DishCard key={plato.id} plato={plato} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
