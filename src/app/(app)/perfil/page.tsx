import type { Metadata } from "next";
import { renderTime } from "@/lib/format";
import { getMyListings, getReviewsFor, getSavedListings, getStats, requireViewer } from "@/lib/repo";
import { Profile } from "./Profile";
import { SavedList } from "./SavedList";

export const metadata: Metadata = { title: "Mi perfil", robots: { index: false } };

export default async function ProfilePage() {
  const viewer = await requireViewer("/perfil");
  const [stats, listings, reviews, saved] = await Promise.all([
    getStats(viewer.id), getMyListings(viewer.id), getReviewsFor(viewer.id), getSavedListings(viewer.id),
  ]);
  return (
    <Profile
      user={viewer.profile}
      stats={stats}
      listings={listings}
      reviews={reviews}
      seenBadges={viewer.profile.seenBadges}
      now={renderTime()}
      saved={<SavedList listings={saved} />}
    />
  );
}
