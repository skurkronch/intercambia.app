import type { MetadataRoute } from "next";
import { CATEGORIES, CITIES } from "@/lib/data/catalog";
import { getRecentListings } from "@/lib/repo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getRecentListings(5000);
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/buscar`, changeFrequency: "daily", priority: 0.8 },
    ...CATEGORIES.map((c) => ({ url: `${SITE_URL}/categoria/${c.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...CITIES.map((c) => ({ url: `${SITE_URL}/ciudad/${c.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...listings.map((l) => ({ url: `${SITE_URL}/objeto/${l.slug}`, lastModified: l.createdAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    { url: `${SITE_URL}/anunciate`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/terminos`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/aviso-de-privacidad`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
