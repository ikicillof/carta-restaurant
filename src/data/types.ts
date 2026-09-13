export type CategoriaId =
  | "entradas"
  | "principales"
  | "guarniciones"
  | "postres";

export type TagPlato =
  | "vegetariano"
  | "sin-tacc"
  | "picante"
  | "para-compartir"
  | "destacado";

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaId;
  tags: TagPlato[];
  imagen: string;
  modelo: string | null;
}

export interface Categoria {
  id: CategoriaId;
  label: string;
}

export interface MenuData {
  categorias: Categoria[];
  platos: Plato[];
}

export interface FranjaHoraria {
  desde: string;
  hasta: string;
}

export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export interface HorarioDia {
  abierto: boolean;
  franjas: FranjaHoraria[];
}

export interface Direccion {
  calle: string;
  barrio: string;
  ciudad: string;
  mapsUrl: string;
}

export interface RestaurantData {
  nombre: string;
  bajada: string;
  historia: string[];
  direccion: Direccion;
  horarios: Record<DiaSemana, HorarioDia>;
  telefono: string;
  whatsapp: string;
  redes: {
    instagram: string;
    facebook: string;
  };
}

export interface Review {
  id: string;
  autor: string;
  iniciales: string;
  colorAvatar: "cobre" | "brasa" | "ceniza";
  calificacion: 1 | 2 | 3 | 4 | 5;
  texto: string;
  fecha: string;
  resenasDelAutor: number;
  plato?: string;
}
