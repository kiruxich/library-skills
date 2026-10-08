import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { ComponentsGallery } from "@/components/components-gallery";
import { COMPONENTS } from "@/data/components";

export const metadata: Metadata = { title: "Компоненты" };

export default function Page() {
  // Исходник читается при сборке — во вкладке «Код» всегда то, что реально отрисовано.
  const sources = Object.fromEntries(
    COMPONENTS.map((c) => [c.slug, readFileSync(path.join(process.cwd(), "components/library", c.file), "utf8")]),
  );
  return <ComponentsGallery sources={sources} />;
}
