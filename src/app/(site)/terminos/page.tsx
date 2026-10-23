import type { Metadata } from "next";
import { LegalPage } from "@/components/shell/LegalPage";

export const metadata: Metadata = { title: "Términos de uso", alternates: { canonical: "/terminos" } };

export default function TermsPage() {
  return (
    <LegalPage title="Términos de uso" updated="22 de octubre de 2026">
      <h2>Qué es truXanger</h2>
      <p>truXanger es una plataforma que conecta a personas que quieren intercambiar objetos y servicios. No compramos, vendemos ni custodiamos nada, y no cobramos comisiones.</p>
      <h2>Tu responsabilidad en cada trueque</h2>
      <ul>
        <li>Lo que publicas debe ser tuyo y estar descrito con honestidad: estado, fallas y fotos reales.</li>
        <li>Las personas que hacen trueque acuerdan entre ellas la entrega, el envío y cualquier diferencia. truXanger no participa en la logística ni garantiza el resultado.</li>
        <li>Recomendamos verse en lugares públicos y revisar el objeto antes de cerrar.</li>
      </ul>
      <h2>Lo que no se puede intercambiar</h2>
      <ul>
        <li>Armas, municiones y explosivos.</li>
        <li>Drogas, medicamentos con receta y alcohol.</li>
        <li>Animales.</li>
        <li>Objetos robados, falsificados o que infrinjan derechos de autor.</li>
        <li>Documentos oficiales, datos personales o cuentas.</li>
        <li>Cualquier cosa ilegal en tu país o estado.</li>
      </ul>
      <h2>Reseñas e insignias</h2>
      <p>Las reseñas deben reflejar un trueque real. Podemos retirar reseñas o insignias obtenidas con trampa.</p>
      <h2>Publicidad</h2>
      <p>El servicio se financia con publicidad. Los anuncios siempre van marcados como «Patrocinado» o «Publicidad».</p>
      <h2>Suspensión de cuentas</h2>
      <p>Podemos suspender cuentas que incumplan estos términos o que reciban reportes justificados.</p>
      <h2>Contacto</h2>
      <p>hola@truxange.com</p>
    </LegalPage>
  );
}
