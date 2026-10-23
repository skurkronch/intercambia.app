import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CURRENT_USER_ID } from "@/lib/data/seed";
import { getReviewsFor, getUser } from "@/lib/repo";
import { Profile } from "./Profile";

export const metadata: Metadata = { title: "Mi perfil", robots: { index: false } };

export default async function ProfilePage() {
  const user = await getUser(CURRENT_USER_ID);
  if (!user) notFound();
  const reviews = await Promise.all(
    (await getReviewsFor(user.id)).map(async (r) => ({
      id: r.id,
      author: (await getUser(r.authorId))?.displayName ?? "Alguien",
      stars: r.stars,
      text: r.text,
      createdAt: r.createdAt,
    })),
  );
  return <Profile user={user} reviews={reviews} />;
}
