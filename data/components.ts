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
  {
    slug: "runaway-login",
    title: "Runaway Login",
    description: "Кнопка «Log in» убегает от курсора на привязи, пока форма пустая; одно поле — вдвое ближе; оба — защёлкивается дома. Никогда не disabled: Tab до неё доходит и она останавливается, Enter всегда отправляет.",
    file: "runaway-login.tsx",
    tags: ["логин", "форма", "шутка"],
    deps: ["motion"],
    stage: "dark",
    ref: [{ label: "@_code_and_chill_", url: "https://www.instagram.com/reel/DcIIax-PZfy/" }],
    addedAt: "2026-10-08",
  },
  {
    slug: "lamp-login",
    title: "Lamp Login",
    description: "Тёмная комната с торшером: дёрните за шнурок — загорится свет, и форма входа проявится. «Sign In» тоже включает лампу. Светлячки, стекло, кнопки Google и GitHub.",
    file: "lamp-login.tsx",
    tags: ["логин", "свет", "сцена"],
    deps: ["motion"],
    stage: "dark",
    addedAt: "2026-10-08",
  },
  {
    slug: "scanner-testimonials",
    title: "Scanner Testimonials",
    description: "Две ленты отзывов едут навстречу друг другу, золотой луч «сканирует» карточки — всё левее луча рассыпается в ASCII. Наведите курсор — лента плавно останавливается. Уважает prefers-reduced-motion.",
    file: "scanner-testimonials.tsx",
    tags: ["отзывы", "marquee", "ASCII"],
    deps: [],
    stage: "dark",
    ref: [{ label: "georgiirivera.ai", url: "https://georgiirivera.ai/#projects" }],
    addedAt: "2026-10-08",
  },
];
