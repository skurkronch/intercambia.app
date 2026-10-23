// Seed data for development and the pre-launch preview.
// Replace with Supabase queries in phase 2; nothing here is real user content.

import type { Conversation, Listing, Review, Sponsor, TradeStats, User } from "@/lib/types";

export const CURRENT_USER_ID = "cesar_trux";
/** Approximate point for distances (Condesa, CDMX). Phase 2 takes it from the profile. */
export const CURRENT_USER_LOCATION = { lat: 19.4111, lng: -99.1733 };
/** What the signed-in person is looking for (PRD wishlist). */
export const CURRENT_USER_WISHLIST = ["Vinilos", "Sintetizador", "Cámara analógica"];

type U = Omit<User, "memberSince"> & { memberSince?: string };
const u = (x: U): User => ({ memberSince: "2026-03-01", ...x });

export const USERS: User[] = [
  u({ id: "cesar_trux", username: "cesar_trux", displayName: "César R.", citySlug: "cdmx", neighborhood: "Condesa", bio: "Me gustan los trueques justos y rápidos. Sin dramas.", rating: 4.9, reviewsCount: 7, exchanges: 7, avgResponseMinutes: 38, verified: false, memberSince: "2026-01-15" }),
  u({ id: "carlos_mx", username: "carlos_mx", displayName: "Carlos M.", citySlug: "cdmx", neighborhood: "Condesa", bio: "Músico de fin de semana.", rating: 4.9, reviewsCount: 11, exchanges: 12, avgResponseMinutes: 25, verified: true }),
  u({ id: "ana_records", username: "ana_records", displayName: "Ana R.", citySlug: "cdmx", neighborhood: "Roma Norte", bio: "Vinilos, casetes y todo lo que suene a 1985.", rating: 5.0, reviewsCount: 30, exchanges: 34, avgResponseMinutes: 15, verified: true }),
  u({ id: "bike_trader", username: "bike_trader", displayName: "Beto T.", citySlug: "cdmx", neighborhood: "Polanco", bio: "Todo lo que tenga ruedas.", rating: 4.7, reviewsCount: 8, exchanges: 8, avgResponseMinutes: 70, verified: false }),
  u({ id: "gamer_mty", username: "gamer_mty", displayName: "Gael M.", citySlug: "monterrey", neighborhood: "Centro", bio: "Coleccionista de consolas.", rating: 4.8, reviewsCount: 5, exchanges: 5, avgResponseMinutes: 45, verified: true }),
  u({ id: "futbol_fan", username: "futbol_fan", displayName: "Fer F.", citySlug: "guadalajara", neighborhood: "Americana", bio: "Si es de futbol, me interesa.", rating: 4.6, reviewsCount: 17, exchanges: 19, avgResponseMinutes: 90, verified: false }),
  u({ id: "techseller_mx", username: "techseller_mx", displayName: "Tania S.", citySlug: "cdmx", neighborhood: "Santa Fe", bio: "Cambio tecnología, siempre con factura.", rating: 4.9, reviewsCount: 25, exchanges: 27, avgResponseMinutes: 20, verified: true }),
  u({ id: "cafe_lover", username: "cafe_lover", displayName: "Caro L.", citySlug: "cdmx", neighborhood: "Nápoles", bio: "Café de especialidad y cocina.", rating: 4.5, reviewsCount: 3, exchanges: 3, avgResponseMinutes: 120, verified: false }),
  u({ id: "otaku_mx", username: "otaku_mx", displayName: "Óscar M.", citySlug: "cdmx", neighborhood: "Coyoacán", bio: "Manga, anime y figuras.", rating: 5.0, reviewsCount: 38, exchanges: 41, avgResponseMinutes: 30, verified: true }),
  u({ id: "surf_mx", username: "surf_mx", displayName: "Santi M.", citySlug: "puerto-escondido", neighborhood: "Zicatela", bio: "Mar todos los días.", rating: 4.8, reviewsCount: 6, exchanges: 6, avgResponseMinutes: 180, verified: false }),
  u({ id: "foto_pro", username: "foto_pro", displayName: "Fabi P.", citySlug: "cdmx", neighborhood: "Juárez", bio: "Fotógrafa de producto.", rating: 4.7, reviewsCount: 14, exchanges: 15, avgResponseMinutes: 50, verified: true }),
  u({ id: "vintage_moda", username: "vintage_moda", displayName: "Vale M.", citySlug: "cdmx", neighborhood: "Hipódromo", bio: "Ropa vintage curada a mano.", rating: 4.9, reviewsCount: 48, exchanges: 52, avgResponseMinutes: 35, verified: true }),
  u({ id: "teacher_mx", username: "teacher_mx", displayName: "Tere L.", citySlug: "cdmx", neighborhood: "En línea", bio: "Maestra de inglés certificada.", rating: 5.0, reviewsCount: 16, exchanges: 18, avgResponseMinutes: 40, verified: true }),
  u({ id: "tech_la", username: "tech_la", displayName: "Tony L.", citySlug: "los-angeles", neighborhood: "Echo Park", bio: "Developer. Trades in LA and CDMX.", rating: 4.8, reviewsCount: 9, exchanges: 9, avgResponseMinutes: 60, verified: true }),
  u({ id: "sneaker_tx", username: "sneaker_tx", displayName: "Sam T.", citySlug: "houston", neighborhood: "Montrose", bio: "Sneakers only.", rating: 4.6, reviewsCount: 21, exchanges: 23, avgResponseMinutes: 55, verified: false }),
  u({ id: "green_soul", username: "green_soul", displayName: "Gaby S.", citySlug: "cdmx", neighborhood: "Xochimilco", bio: "Vivero en casa.", rating: 5.0, reviewsCount: 7, exchanges: 7, avgResponseMinutes: 95, verified: false }),
  u({ id: "casa_gamer", username: "casa_gamer", displayName: "Chuy G.", citySlug: "estado-de-mexico", neighborhood: "Naucalpan", bio: "Juegos de mesa y de sala.", rating: 4.4, reviewsCount: 2, exchanges: 2, avgResponseMinutes: 240, verified: false }),
  u({ id: "artista_mx", username: "artista_mx", displayName: "Alma M.", citySlug: "cdmx", neighborhood: "San Ángel", bio: "Pinto al óleo los domingos.", rating: 4.9, reviewsCount: 10, exchanges: 11, avgResponseMinutes: 65, verified: true }),
  u({ id: "dev_mx", username: "dev_mx", displayName: "Diego M.", citySlug: "estado-de-mexico", neighborhood: "Satélite", bio: "Escritorios bonitos, teclados ruidosos.", rating: 4.7, reviewsCount: 13, exchanges: 14, avgResponseMinutes: 28, verified: true }),
  u({ id: "aventurero", username: "aventurero", displayName: "Andrés V.", citySlug: "puebla", neighborhood: "Centro", bio: "Montaña cada mes.", rating: 4.6, reviewsCount: 8, exchanges: 8, avgResponseMinutes: 110, verified: false }),
  u({ id: "collector_mx", username: "collector_mx", displayName: "Cris O.", citySlug: "cdmx", neighborhood: "Tlalpan", bio: "Figuras, LEGO y Hot Wheels.", rating: 4.8, reviewsCount: 29, exchanges: 31, avgResponseMinutes: 33, verified: true }),
];

type L = Omit<Listing, "slug" | "openToAnything" | "acceptsCash" | "hasVideo" | "status" | "photos"> &
  Partial<Pick<Listing, "openToAnything" | "acceptsCash" | "hasVideo" | "status" | "photos">>;

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const l = (x: L): Listing => ({
  photos: [],
  openToAnything: false,
  acceptsCash: false,
  hasVideo: false,
  status: "activo",
  ...x,
  slug: `${slugify(x.title)}-${x.id}`,
});

export const LISTINGS: Listing[] = [
  l({ id: "l1", title: "Guitarra Fender Stratocaster", category: "instrumentos", condition: "buen-estado", value: 8500, currency: "MXN", wants: ["Sintetizador", "Teclado MIDI", "Bajo eléctrico"], ownerId: "carlos_mx", citySlug: "cdmx", neighborhood: "Condesa", location: { lat: 19.4122, lng: -99.1745 }, hasVideo: true, createdAt: "2026-10-20",
    description: "Stratocaster mexicana de 2019, cuerpo sunburst y mástil de maple. Tiene un par de marcas de uso en la parte trasera, nada que afecte el sonido.\n\nIncluye funda acolchada y correa. La calibré hace un mes: cuerdas nuevas y acción baja." }),
  l({ id: "l2", title: "Colección de vinilos de los 80", category: "libros-coleccionables", condition: "buen-estado", value: 2200, currency: "MXN", wants: ["Tornamesa", "Amplificador", "Casetes"], ownerId: "ana_records", citySlug: "cdmx", neighborhood: "Roma Norte", location: { lat: 19.4194, lng: -99.1617 }, createdAt: "2026-10-19",
    description: "Lote de 18 discos: synth pop, new wave y rock en español. Portadas con desgaste normal; los discos suenan limpios.\n\nTe paso la lista completa por chat antes de cerrar." }),
  l({ id: "l3", title: "Bicicleta de montaña Trek Marlin 5", category: "deportes", condition: "buen-estado", value: 6000, currency: "MXN", wants: ["Patines", "Longboard", "Casco"], ownerId: "bike_trader", citySlug: "cdmx", neighborhood: "Polanco", location: { lat: 19.4330, lng: -99.1915 }, createdAt: "2026-10-18",
    description: "Rodada 29, talla M. Frenos de disco mecánicos y suspensión delantera recién servida.\n\nLa usé en ciudad y algunas salidas al Ajusco." }),
  l({ id: "l4", title: "PlayStation 5 con 3 juegos", category: "videojuegos", condition: "como-nuevo", value: 14000, currency: "MXN", wants: ["Xbox Series X", "Nintendo Switch", "PC gaming"], ownerId: "gamer_mty", citySlug: "monterrey", neighborhood: "Centro", location: { lat: 25.6714, lng: -100.3090 }, hasVideo: true, createdAt: "2026-10-17",
    description: "Versión con lector de discos, un control y caja original. Incluye Spider-Man 2, Gran Turismo 7 y FC 26.\n\nPrefiero entregar en mano en Monterrey." }),
  l({ id: "l5", title: "Álbum Mundial 2026 completo", category: "libros-coleccionables", condition: "como-nuevo", value: 1500, currency: "MXN", wants: ["Camiseta de la selección", "Memorabilia", "Estampas raras"], ownerId: "futbol_fan", citySlug: "guadalajara", neighborhood: "Americana", location: { lat: 20.6720, lng: -103.3690 }, createdAt: "2026-10-16",
    description: "Completo, con todas las estampas pegadas y las brillantes. Pasta dura, sin dobleces.\n\nSe entrega en bolsa protectora." }),
  l({ id: "l6", title: "iPhone 14 Pro de 256 GB", category: "electronica", condition: "como-nuevo", value: 12000, currency: "MXN", wants: ["Samsung S24", "iPad", "MacBook Air"], ownerId: "techseller_mx", citySlug: "cdmx", neighborhood: "Santa Fe", location: { lat: 19.3590, lng: -99.2600 }, createdAt: "2026-10-21",
    description: "Morado oscuro, batería al 89 %. Siempre con funda y mica; sin rayones.\n\nLiberado de fábrica. Incluye caja y cable." }),
  l({ id: "l7", title: "Cafetera Nespresso Vertuo", category: "hogar", condition: "buen-estado", value: 3500, currency: "MXN", wants: ["Licuadora Vitamix", "Freidora de aire", "Batidora KitchenAid"], ownerId: "cafe_lover", citySlug: "cdmx", neighborhood: "Nápoles", location: { lat: 19.3930, lng: -99.1770 }, acceptsCash: true, createdAt: "2026-10-15",
    description: "Funciona perfecto; la descalcifiqué la semana pasada. Incluye 10 cápsulas de regalo.\n\nLa cambio porque me pasé al café de filtro." }),
  l({ id: "l8", title: "Manga One Piece, tomos 1 al 50", category: "libros-coleccionables", condition: "buen-estado", value: 4000, currency: "MXN", wants: ["Figuras coleccionables", "Otros mangas", "Merch de anime"], ownerId: "otaku_mx", citySlug: "cdmx", neighborhood: "Coyoacán", location: { lat: 19.3500, lng: -99.1620 }, createdAt: "2026-10-14",
    description: "Edición de Panini México. Lomos en buen estado, sin páginas sueltas.\n\nSe entregan en dos cajas." }),
  l({ id: "l9", title: "Tabla de surf 6'2\"", category: "deportes", condition: "usado", value: 7500, currency: "MXN", wants: ["Kayak", "Tabla de paddle", "Equipo de buceo"], ownerId: "surf_mx", citySlug: "puerto-escondido", neighborhood: "Zicatela", location: { lat: 15.8620, lng: -97.0730 }, createdAt: "2026-10-13",
    description: "Shortboard para olas medianas, con quillas y leash. Tiene dos reparaciones bien hechas.\n\nIdeal para pasar de la tabla de espuma a algo más rápido." }),
  l({ id: "l10", title: "Cámara Sony Alpha A6000", category: "electronica", condition: "buen-estado", value: 9000, currency: "MXN", wants: ["Drone", "GoPro", "Lentes"], ownerId: "foto_pro", citySlug: "cdmx", neighborhood: "Juárez", location: { lat: 19.4270, lng: -99.1600 }, hasVideo: true, createdAt: "2026-10-12",
    description: "Con lente kit 16-50 mm, dos baterías y cargador. Obturador con unas 12 000 fotos.\n\nPerfecta para empezar en fotografía o video." }),
  l({ id: "l11", title: "Colección de Levi's 501 vintage", category: "ropa", condition: "buen-estado", value: 3200, currency: "MXN", wants: ["Chamarras vintage", "Tenis retro", "Accesorios de los 90"], ownerId: "vintage_moda", citySlug: "cdmx", neighborhood: "Hipódromo", location: { lat: 19.4100, lng: -99.1700 }, createdAt: "2026-10-11",
    description: "Tres pantalones hechos en EE. UU., tallas 30, 31 y 32. Lavados y revisados.\n\nSe pueden cambiar por separado." }),
  l({ id: "l12", title: "Clases de inglés, 10 sesiones", category: "servicios", condition: "nuevo", value: 2000, currency: "MXN", wants: ["Clases de diseño", "Clases de programación", "Coaching"], ownerId: "teacher_mx", citySlug: "cdmx", neighborhood: "En línea", location: null, openToAnything: false, createdAt: "2026-10-10",
    description: "Sesiones de 50 minutos por videollamada, nivel intermedio o avanzado. Enfoque en conversación y entrevistas de trabajo.\n\nHorarios entre semana por la tarde." }),
  l({ id: "l13", title: "MacBook Pro M1 2021", category: "electronica", condition: "como-nuevo", value: 25000, currency: "MXN", wants: ["iPad Pro", "Monitor 4K", "Teclado mecánico"], ownerId: "tech_la", citySlug: "los-angeles", neighborhood: "Echo Park", location: { lat: 34.0782, lng: -118.2606 }, createdAt: "2026-10-09",
    description: "14 pulgadas, 16 GB de RAM y 512 GB. Ciclos de batería: 210.\n\nViajo a CDMX cada mes; podemos cerrar allá." }),
  l({ id: "l14", title: "Jordan 1 Retro High OG, talla 10", category: "ropa", condition: "como-nuevo", value: 280, currency: "USD", wants: ["Air Force 1", "Yeezy", "New Balance 990"], ownerId: "sneaker_tx", citySlug: "houston", neighborhood: "Montrose", location: { lat: 29.7449, lng: -95.3906 }, createdAt: "2026-10-08",
    description: "Colorway Chicago, usados dos veces. Con caja y agujetas extra.\n\nAutenticidad verificada." }),
  l({ id: "l15", title: "Monstera deliciosa grande", category: "plantas", condition: "nuevo", value: 800, currency: "MXN", wants: ["Suculentas raras", "Orquídeas", "Cactus"], ownerId: "green_soul", citySlug: "cdmx", neighborhood: "Xochimilco", location: { lat: 19.2570, lng: -99.1030 }, createdAt: "2026-10-07",
    description: "Mide 1.2 m con maceta de barro. Hojas grandes y fenestradas, sin plagas.\n\nNecesita luz indirecta." }),
  l({ id: "l16", title: "Mesa de billar plegable", category: "hogar", condition: "usado", value: 5500, currency: "MXN", wants: ["Futbolito", "Mesa de ping pong", "Consola retro"], ownerId: "casa_gamer", citySlug: "estado-de-mexico", neighborhood: "Naucalpan", location: { lat: 19.4785, lng: -99.2396 }, createdAt: "2026-10-06",
    description: "Mesa de 1.80 m con tacos, bolas y triángulo. El paño tiene una pequeña marca en una esquina.\n\nSe pliega para guardar." }),
  l({ id: "l17", title: "Set de óleos y lienzos", category: "arte", condition: "como-nuevo", value: 2800, currency: "MXN", wants: ["Tableta Wacom", "Cámara", "Curso de arte digital"], ownerId: "artista_mx", citySlug: "cdmx", neighborhood: "San Ángel", location: { lat: 19.3460, lng: -99.1900 }, createdAt: "2026-10-05",
    description: "24 tubos Winsor & Newton, pinceles y 6 lienzos de 40 × 50 cm.\n\nMe paso al dibujo digital." }),
  l({ id: "l18", title: "Teclado mecánico Keychron K2", category: "electronica", condition: "buen-estado", value: 4500, currency: "MXN", wants: ["Monitor gaming", "Mouse ergonómico", "Webcam 4K"], ownerId: "dev_mx", citySlug: "estado-de-mexico", neighborhood: "Satélite", location: { lat: 19.5100, lng: -99.2350 }, createdAt: "2026-10-04",
    description: "Switches café, retroiluminación blanca, Bluetooth y cable. Distribución en inglés.\n\nIncluye keycaps extra para Mac." }),
  l({ id: "l19", title: "Mochila The North Face de 40 L", category: "deportes", condition: "buen-estado", value: 2200, currency: "MXN", wants: ["Sleeping bag", "Casa de campaña", "Botas de senderismo"], ownerId: "aventurero", citySlug: "puebla", neighborhood: "Centro", location: { lat: 19.0414, lng: -98.2063 }, createdAt: "2026-10-03",
    description: "Modelo Terra 40, con cubierta para lluvia. Cierres y costuras en buen estado.\n\nAguantó el Iztaccíhuatl y la Malinche." }),
  l({ id: "l20", title: "Colección Funko Pop Marvel, 12 piezas", category: "libros-coleccionables", condition: "nuevo", value: 3600, currency: "MXN", wants: ["Figuras de anime", "Sets de LEGO", "Hot Wheels de edición especial"], ownerId: "collector_mx", citySlug: "cdmx", neighborhood: "Tlalpan", location: { lat: 19.2900, lng: -99.1700 }, createdAt: "2026-10-02",
    description: "Todas en caja, sin abrir. Incluye dos exclusivas de convención.\n\nNo se separan." }),

  // The signed-in person's own listings.
  l({ id: "m1", title: "Guitarra eléctrica Squier", category: "instrumentos", condition: "buen-estado", value: 4500, currency: "MXN", wants: ["Vinilos", "Sintetizador", "Cámara analógica"], ownerId: "cesar_trux", citySlug: "cdmx", neighborhood: "Condesa", location: { lat: 19.4111, lng: -99.1733 }, createdAt: "2026-09-28",
    description: "Squier Affinity Strat, negra. Ideal para empezar.\n\nIncluye cable y correa." }),
  l({ id: "m2", title: "Álbum Mundial 2026 incompleto", category: "libros-coleccionables", condition: "usado", value: 600, currency: "MXN", wants: ["Vinilos", "Cámara analógica"], ownerId: "cesar_trux", citySlug: "cdmx", neighborhood: "Condesa", location: { lat: 19.4111, lng: -99.1733 }, createdAt: "2026-09-20",
    description: "Le faltan 40 estampas. Incluye 60 repetidas para cambiar.\n\nBuen estado general." }),
  l({ id: "m3", title: "Bicicleta urbana Mercier", category: "deportes", condition: "buen-estado", value: 3200, currency: "MXN", wants: ["Cámara analógica"], ownerId: "cesar_trux", citySlug: "cdmx", neighborhood: "Condesa", location: { lat: 19.4111, lng: -99.1733 }, status: "en-negociacion", createdAt: "2026-09-10",
    description: "Rodada 28, una velocidad. Llantas nuevas.\n\nPerfecta para la ciudad." }),
];

export const SPONSORS: Sponsor[] = [
  { id: "s1", brand: "Bicis del Barrio", title: "Afinación completa a mitad de precio", body: "Para la bici que acabas de intercambiar.", url: "https://truxange.com/anunciate", cta: "Conoce más", category: "deportes" },
  { id: "s2", brand: "Café Tlaloc", title: "Tu primer kilo de grano con 20 % menos", body: "Tostado en la Roma cada semana.", url: "https://truxange.com/anunciate", cta: "Conoce más", category: "hogar" },
];

export const REVIEWS: Review[] = [
  { id: "r1", authorId: "ana_records", targetId: "cesar_trux", stars: 5, text: "Puntual y honesto. El objeto, tal cual las fotos.", createdAt: "2026-10-20" },
  { id: "r2", authorId: "bike_trader", targetId: "cesar_trux", stars: 5, text: "Todo salió perfecto. Volvería a cambiar con él sin pensarlo.", createdAt: "2026-10-14" },
  { id: "r3", authorId: "futbol_fan", targetId: "cesar_trux", stars: 4, text: "Buen trato; llegó unos minutos tarde al punto de encuentro.", createdAt: "2026-10-06" },
];

export const CURRENT_USER_STATS: TradeStats = {
  exchanges: 7,
  rating: 4.9,
  reviewsCount: 7,
  avgResponseMinutes: 38,
  countries: ["MX"],
  byCategory: { instrumentos: 3, deportes: 2, "libros-coleccionables": 1, electronica: 1 },
  verified: false,
};

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "c-ana", otherUserId: "ana_records", theirListingId: "l2", myListingId: "m2", unread: 2, trade: "negociando",
    messages: [
      { id: "1", from: "system", text: "¡Hay trueque! Ya pueden negociar los detalles.", at: "2026-10-22T11:02:00" },
      { id: "2", from: "them", text: "¡Hola! Me interesa tu álbum. ¿Cuántas estampas le faltan?", at: "2026-10-22T11:10:00" },
      { id: "3", from: "me", text: "Le faltan 40, pero van 60 repetidas para que lo completes. ¿Los vinilos son originales?", at: "2026-10-22T11:14:00" },
      { id: "4", from: "them", text: "Todos originales. ¿Cuándo nos vemos?", at: "2026-10-22T12:34:00" },
    ],
  },
  {
    id: "c-gamer", otherUserId: "gamer_mty", theirListingId: "l4", myListingId: "m1", unread: 0, trade: "negociando",
    messages: [
      { id: "1", from: "system", text: "¡Hay trueque! Ya pueden negociar los detalles.", at: "2026-10-21T18:00:00" },
      { id: "2", from: "me", text: "Va mi Squier más una diferencia en efectivo por la PS5, ¿te late?", at: "2026-10-21T18:05:00" },
      { id: "3", from: "them", text: "Me late. Voy a CDMX el sábado, nos vemos en el Parque México.", at: "2026-10-21T19:20:00" },
    ],
  },
  {
    id: "c-bike", otherUserId: "bike_trader", theirListingId: "l3", myListingId: "m3", unread: 0, trade: "negociando",
    messages: [
      { id: "1", from: "system", text: "¡Hay trueque! Ya pueden negociar los detalles.", at: "2026-10-19T09:00:00" },
      { id: "2", from: "me", text: "Hola, ¿la Trek tiene frenos de disco?", at: "2026-10-19T09:12:00" },
      { id: "3", from: "them", text: "Sí, mecánicos. ¿La Mercier tiene llantas nuevas?", at: "2026-10-19T09:40:00" },
      { id: "4", from: "me", text: "Nuevas, de este mes.", at: "2026-10-19T09:41:00" },
      { id: "5", from: "them", text: "Perfecto, te veo en Polanco.", at: "2026-10-19T10:02:00" },
    ],
  },
];
