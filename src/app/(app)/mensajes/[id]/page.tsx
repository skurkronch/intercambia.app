import type { Metadata } from "next";
import { Chat } from "./Chat";

export const metadata: Metadata = { title: "Chat", robots: { index: false } };

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Chat id={id} />;
}
