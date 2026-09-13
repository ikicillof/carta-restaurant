import { Logo } from "@/components/Logo";
import restaurant from "@/data/restaurant.json";

export function Footer() {
  const año = new Date().getFullYear();

  return (
    <footer className="border-t border-hueso/10 bg-carbon px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo variant="compact" className="h-7 w-auto text-hueso" />

          <div className="flex items-center gap-5 text-sm text-ceniza">
            <a
              href={restaurant.redes.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brasa"
            >
              Instagram
            </a>
            <a
              href={restaurant.redes.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brasa"
            >
              Facebook
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-hueso/10 pt-6 text-xs text-ceniza sm:flex-row sm:items-center sm:justify-between">
          <p>
            Sitio de demostración. Nombre, carta, reseñas e imágenes son
            ficticios y se usan solo con fines ilustrativos.
          </p>
          <p>
            © {año} {restaurant.nombre} · Sitio por{" "}
            {/* TODO: reemplazar por la URL real del portfolio/agencia al deployar */}
            <a
              href="#inicio"
              className="underline underline-offset-2 transition-colors hover:text-brasa"
            >
              Umbral
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
