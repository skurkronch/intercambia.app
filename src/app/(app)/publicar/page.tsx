import type { Metadata } from "next";
import { getCity } from "@/lib/data/catalog";
import { requireViewer } from "@/lib/repo";
import { Publish } from "./Publish";

export const metadata: Metadata = { title: "Subir objeto", robots: { index: false } };

export default async function PublishPage() {
  const { profile } = await requireViewer("/publicar");
  const city = getCity(profile.citySlug);
  return <Publish defaultPlace={[profile.neighborhood, city?.short].filter(Boolean).join(", ")} />;
}
