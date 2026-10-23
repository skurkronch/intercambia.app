import type { Metadata } from "next";
import { ItemCard } from "@/components/ds/ItemCard";
import { SPONSORS } from "@/lib/data/seed";

export const metadata: Metadata = {
  title: "Anúnciate",
  description: "Llega a vecinos que intercambian en tu ciudad con tarjetas patrocinadas y espacios en categorías y colonias.",
  alternates: { canonical: "/anunciate" },
};

export default function AdvertisePage() {
  return (
    <div className="site-wrap advertise">
      <div className="advertise-copy">
        <p className="overline">Anúnciate</p>
        <h1 className="title-lg">Tu marca frente a vecinos que intercambian</h1>
        <p className="page-intro">
          Quien hace trueque ya está pensando en lo siguiente: afinar la bici que acaba de cambiar, comprar macetas para su nueva monstera o un estuche para su guitarra. Llega justo ahí.
        </p>
        <h2 className="title-sm">Formatos</h2>
        <ul className="advertise-list">
          <li><b>Tarjeta patrocinada en Descubre.</b> Aparece entre los objetos, como mucho una cada cinco, siempre marcada como «Patrocinado».</li>
          <li><b>Categoría o ciudad.</b> Un espacio fijo en las páginas de una categoría o de una ciudad.</li>
        </ul>
        <h2 className="title-sm">Escríbenos</h2>
        <p>anuncios@truxange.com</p>
      </div>
      <div className="advertise-art" aria-hidden="true">
        <ItemCard item={{ kind: "sponsor", key: "demo", sponsor: SPONSORS[0] }} top />
      </div>
    </div>
  );
}
