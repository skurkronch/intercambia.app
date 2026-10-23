import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConversation, requireViewer } from "@/lib/repo";
import { Chat } from "./Chat";

export const metadata: Metadata = { title: "Chat", robots: { index: false } };

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requireViewer(`/mensajes/${id}`);
  const data = await getConversation(viewer.id, id);
  if (!data?.conversation) notFound();
  return <Chat key={id} conversation={data.conversation} initialMessages={data.messages} meId={viewer.id} reviewed={data.reviewed} />;
}
