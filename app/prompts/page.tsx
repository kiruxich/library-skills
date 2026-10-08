import type { Metadata } from "next";
import { PromptsLibrary } from "@/components/prompts-library";

export const metadata: Metadata = { title: "Промпты" };

export default function Page() {
  return <PromptsLibrary />;
}
