import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "truXanger",
    short_name: "truXanger",
    description: "Cambia lo que tienes por lo que quieres.",
    start_url: "/descubre",
    display: "standalone",
    background_color: "#121316",
    theme_color: "#121316",
    lang: "es-MX",
    icons: [{ src: "/app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
