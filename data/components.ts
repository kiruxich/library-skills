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
  {
    slug: "card-checkout",
    title: "Card Checkout",
    description: "Оплата картой: карта на лету повторяет ввод, определяет Visa/Mastercard/Amex, переворачивается на CVC. Проверка по Луну и сроку. После «Pay» карта перелетает в центр, светится синим, пока банк думает, и зелёным, когда оплата прошла.",
    file: "card-checkout.tsx",
    tags: ["оплата", "форма", "3D"],
    deps: ["motion"],
    stage: "light",
    ref: [{ label: "@_code_and_chill_", url: "https://www.instagram.com/reel/Db3CrouPbxz/" }],
    addedAt: "2026-10-08",
  },
  {
    slug: "otp-burst",
    title: "OTP Burst",
    description: "Код подтверждения из 4 цифр: тёплая подсветка ячеек, а после последней цифры они собираются в сетку, связываются линией, сплющиваются в одну плитку и взрываются зелёными частицами. Ошибка — тряска и красный.",
    file: "otp-burst.tsx",
    tags: ["код доступа", "OTP", "частицы"],
    deps: ["motion"],
    stage: "dark",
    ref: [{ label: "@_code_and_chill_", url: "https://www.instagram.com/reel/DbavLeDTP5H/" }],
    addedAt: "2026-10-08",
  },
  {
    slug: "otp-orbit",
    title: "OTP Orbit",
    description: "Ряд из четырёх ячеек сворачивается на орбиту, делает полтора оборота и «вкручивается» в одну подтверждённую плитку. Цвет только для вердикта. Подсказка «From Messages» вставляет код из SMS.",
    file: "otp-orbit.tsx",
    tags: ["код доступа", "OTP", "орбита"],
    deps: ["motion"],
    stage: "dark",
    ref: [{ label: "@_code_and_chill_", url: "https://www.instagram.com/reel/DbxxWJnoR2L/" }],
    addedAt: "2026-10-08",
  },
];
