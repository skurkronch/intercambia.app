import Image from "next/image";
import type { CategorySlug } from "@/lib/types";
import { Icon } from "./Icon";

// Stand-ins for chaotic user photos while listings have none (seed data).
const PLACEHOLDER: Record<CategorySlug, string> = {
  electronica: "radial-gradient(90% 70% at 20% 20%, #dbe8f5 0%, rgba(219,232,245,0) 60%), linear-gradient(200deg, #8aa3bd, #3e4c5c)",
  ropa: "radial-gradient(80% 60% at 70% 20%, #b9cde6 0%, rgba(185,205,230,0) 60%), linear-gradient(160deg, #4a6fa5, #22304a)",
  "libros-coleccionables": "linear-gradient(90deg, #9c2f2f 0 18%, #e8d9b0 18% 30%, #24476b 30% 52%, #d2a23a 52% 64%, #3c6e4f 64% 82%, #e3e0d8 82%)",
  instrumentos: "radial-gradient(120% 80% at 80% 10%, #ffd79a 0%, rgba(255,215,154,0) 55%), linear-gradient(160deg, #c98a4b, #5a3a24)",
  deportes: "radial-gradient(100% 70% at 30% 10%, #e8f5d0 0%, rgba(232,245,208,0) 60%), linear-gradient(170deg, #5f9a6a, #23463a)",
  hogar: "radial-gradient(90% 70% at 70% 20%, #fff1d6 0%, rgba(255,241,214,0) 60%), linear-gradient(180deg, #d9b58c, #7a5536)",
  videojuegos: "radial-gradient(70% 60% at 30% 30%, #6f5bd8 0%, rgba(111,91,216,0) 70%), linear-gradient(200deg, #1d2140, #0c0d18)",
  arte: "radial-gradient(40% 40% at 25% 30%, #f2c94c 0%, rgba(242,201,76,0) 70%), radial-gradient(45% 45% at 75% 65%, #e2513b 0%, rgba(226,81,59,0) 70%), linear-gradient(135deg, #3a7bd5, #6dd5c7)",
  plantas: "radial-gradient(60% 50% at 50% 40%, #4f8a3c 0%, rgba(79,138,60,0) 70%), linear-gradient(180deg, #f1e6d2, #d6c3a3)",
  servicios: "radial-gradient(80% 60% at 30% 20%, #e6ecf5 0%, rgba(230,236,245,0) 60%), linear-gradient(160deg, #9aa9bf, #4b5870)",
};

export function Photo({ src, alt, category, sizes = "(max-width: 768px) 100vw, 380px", priority, label = true }: {
  src?: string; alt: string; category: CategorySlug; sizes?: string; priority?: boolean; label?: boolean;
}) {
  if (src) {
    return (
      <div className="tx-photo">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={src.startsWith("data:")} style={{ objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div className="tx-photo tx-photo-ph" style={{ background: PLACEHOLDER[category] }} role="img" aria-label={alt}>
      <Icon name={category} weight="light" className="tx-photo-glyph" />
      {label && <span className="tx-photo-label">Foto de ejemplo</span>}
    </div>
  );
}
