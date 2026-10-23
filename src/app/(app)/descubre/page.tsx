import type { Metadata } from "next";
import { getCity } from "@/lib/data/catalog";
import { getDiscoverFeed, getMyListings, getUsers, requireViewer } from "@/lib/repo";
import { SPONSORS } from "@/lib/sponsors";
import { Discover } from "./Discover";

export const metadata: Metadata = { title: "Descubre", robots: { index: false } };

export default async function DiscoverPage() {
  const viewer = await requireViewer("/descubre");
  const [{ listings, saved }, myListings] = await Promise.all([getDiscoverFeed(viewer.id), getMyListings(viewer.id)]);
  const owners = await getUsers(listings.map((l) => l.ownerId));
  const here = viewer.profile.location ?? getCity(viewer.profile.citySlug)?.center ?? null;
  return (
    <Discover
      listings={listings}
      owners={owners}
      sponsors={SPONSORS}
      wishlist={viewer.profile.wants}
      myListings={myListings}
      here={here}
      initialSaved={saved}
    />
  );
}
