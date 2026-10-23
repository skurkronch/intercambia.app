import type { Metadata } from "next";
import { Publish } from "./Publish";

export const metadata: Metadata = { title: "Subir objeto", robots: { index: false } };

export default function PublishPage() {
  return <Publish />;
}
