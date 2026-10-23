import type { Metadata } from "next";
import { CURRENT_USER_WISHLIST, USERS } from "@/lib/data/seed";
import { getRecentListings, getSponsors } from "@/lib/repo";
import { Discover } from "./Discover";

export const metadata: Metadata = {
  title: "Descubre",
  robots: { index: false },
};

export default async function DiscoverPage() {
  const [listings, sponsors] = await Promise.all([getRecentListings(100), getSponsors()]);
  const ownerIds = new Set(listings.map((l) => l.ownerId));
  const users = USERS.filter((u) => ownerIds.has(u.id));
  return <Discover listings={listings} users={users} sponsors={sponsors} wishlist={CURRENT_USER_WISHLIST} />;
}
