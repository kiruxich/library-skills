# Библиотека

Три раздела в одном сайте (Next.js 16 · React · TypeScript · Tailwind 4 · Motion):

- `/` — **Скиллы**: наборы скиллов Claude Code и связки между ними. Данные — `data/skills.ts`, команды — `data/commands.json`.
- `/components` — **Компоненты**: UI-компоненты, повторённые по референсам. Код — `components/library/*.tsx`, реестр — `data/components.ts`.
- `/prompts` — **Промпты**: сохранённые промпты. Постоянные — `data/prompts.ts`, добавленные в браузере хранятся в localStorage (есть экспорт/импорт JSON).

```bash
npm install
npm run dev   # http://localhost:4321
```

Деплой: Vercel (`vercel.json` → framework nextjs).
