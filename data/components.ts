// Реестр библиотеки компонентов. Код каждого лежит в components/library/<file>.tsx,
// сам компонент подключается в components/library/index.ts.
export type ComponentMeta = {
  slug: string;
  title: string;
  description: string;
  file: string;
  tags: string[];
  deps: string[];
  stage: "light" | "dark";
  ref?: { label: string; url: string }[];
  addedAt: string;
};

export const COMPONENTS: ComponentMeta[] = [
  {
    slug: "basketball-upload",
    title: "Basketball Upload",
    description: "Загрузка файлов как бросок в корзину: оттяни файл, пунктир покажет траекторию, попадание запускает загрузку с прогрессом. Файлы, брошенные мышью на карточку, грузятся сразу; Enter — идеальный бросок с клавиатуры.",
    file: "basketball-upload.tsx",
    tags: ["загрузка", "физика", "игра"],
    deps: ["motion"],
    stage: "light",
    ref: [{ label: "@code.xr", url: "https://www.instagram.com/p/DeJN9TSTlAn/" }],
    addedAt: "2026-10-08",
  },
];
