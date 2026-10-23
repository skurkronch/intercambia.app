import type { Metadata } from "next";
import { LegalPage } from "@/components/shell/LegalPage";

export const metadata: Metadata = { title: "Aviso de privacidad", alternates: { canonical: "/aviso-de-privacidad" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Aviso de privacidad" updated="22 de octubre de 2026">
      <h2>Quién es responsable de tus datos</h2>
      <p>truXanger es responsable del tratamiento de los datos personales que nos compartes, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
      <h2>Qué datos recabamos</h2>
      <ul>
        <li>De identificación y contacto: nombre, correo electrónico y teléfono, si decides darlo.</li>
        <li>De tu perfil: foto, colonia y ciudad, y lo que publicas para intercambiar.</li>
        <li>De ubicación aproximada: la colonia que eliges, para calcular distancias. Nunca mostramos tu dirección.</li>
        <li>De uso: objetos que ves, deslizas y guardas, y los mensajes que envías en el chat.</li>
      </ul>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Crear tu cuenta, mostrar tus publicaciones y emparejar trueques.</li>
        <li>Habilitar el chat entre personas que hicieron match.</li>
        <li>Calcular reseñas e insignias.</li>
        <li>Mostrar publicidad. En páginas públicas trabajamos con redes de anuncios que pueden usar cookies. En el chat no hay publicidad.</li>
      </ul>
      <h2>Con quién los compartimos</h2>
      <p>Con proveedores que nos ayudan a operar el servicio (alojamiento, base de datos y medición), y con redes publicitarias en las páginas públicas. No vendemos tus datos.</p>
      <h2>Tus derechos ARCO</h2>
      <p>Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos, o revocar tu consentimiento, escribiendo a privacidad@truxange.com.</p>
      <h2>Cambios a este aviso</h2>
      <p>Publicaremos cualquier cambio en esta página, con su fecha de actualización.</p>
    </LegalPage>
  );
}
