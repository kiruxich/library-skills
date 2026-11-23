"use client";

import { useId, useState, type FormEvent } from "react";

const PASSWORD_REPLIES = [
  "Свет верни, алё!",
  "Я всё слышу.",
  "Шуршит как семечки.",
  "Кто выключил солнце?",
  "Клюв на замке.",
  "Я вообще сплю.",
  "У меня алиби.",
  "Глаза закрыты. Оба.",
  "Пледу виднее.",
  "Тут темно, но уютно.",
  "Мне положена семечка.",
  "Я не подсматриваю. Честно.",
];

function Parrot({ covered, watching }: { covered: boolean; watching: boolean }) {
  const blanketPosition = covered
    ? "translate-none rotate-0 opacity-100 duration-[260ms]"
    : "translate-x-14 translate-y-16 rotate-[70deg] opacity-0 [transition-duration:420ms,420ms,230ms] [transition-delay:0ms,0ms,160ms]";

  return (
    <div className="absolute top-1 right-0 h-[148px] w-[112px] drop-shadow-[0_5px_5px_#49362330]">
      {/* Tail and feet sit behind the body and stay visible under the scarf. */}
      <span className="absolute top-[87px] left-[68px] h-[56px] w-[15px] origin-top -rotate-[26deg] rounded-[45%_50%_95%_60%] bg-[#b93e33]" />
      <span className="absolute top-[86px] left-[74px] h-[60px] w-[13px] origin-top -rotate-[28deg] rounded-[50%_45%_100%_60%] bg-[#e96748]" />
      <span className="absolute top-[99px] left-[44px] h-[10px] w-[17px] -rotate-12 rounded-t-[9px] border-t-[4px] border-l-[3px] border-[#463939]" />
      <span className="absolute top-[100px] left-[53px] h-[10px] w-[17px] rotate-6 rounded-t-[9px] border-t-[4px] border-l-[3px] border-[#463939]" />

      <span className="absolute top-[39px] left-[42px] h-[66px] w-[45px] -rotate-[24deg] rounded-[57%_42%_49%_47%] bg-[linear-gradient(120deg,#f48563,#d74337_65%,#b7322c)]" />
      <span className="absolute top-[51px] left-[56px] h-[55px] w-[34px] -rotate-[30deg] overflow-hidden rounded-[56%_42%_78%_12%] bg-[#293e75]">
        <span className="absolute -top-2 -left-2 h-[51px] w-[46px] rotate-[18deg] rounded-[49%_33%_62%_30%] bg-[#3d69a4]" />
        <span className="absolute -top-3 -left-2 h-[39px] w-[49px] rotate-[22deg] rounded-[45%_31%_62%_35%] bg-[#eeb958]" />
        <span className="absolute -top-3 -left-1 h-[31px] w-[42px] rotate-[18deg] rounded-[50%_35%_63%_40%] bg-[#e05a42]" />
      </span>

      <div
        className={`absolute inset-0 origin-[57px_53px] transition-transform duration-300 motion-reduce:transition-none ${watching ? "-rotate-[8deg]" : ""}`}
      >
        <span className="absolute top-[19px] left-[33px] h-[45px] w-[45px] rotate-6 rounded-[55%_56%_48%_43%] bg-[linear-gradient(145deg,#f68b67,#dd4d3e_72%)]" />
        <span className="absolute top-[28px] left-[32px] h-[27px] w-[29px] rotate-[10deg] rounded-[53%_63%_53%_40%] bg-[#ffe9ca]" />
        <span className="absolute top-[35px] left-[42px] size-[8px] rounded-full bg-[#382827] shadow-[inset_1px_1px_0_1px_#fff9]" />
        <span className="absolute top-[45px] left-[25px] h-[15px] w-[15px] -rotate-[26deg] rounded-[35%_18%_62%_65%] bg-[#493c3c]" />
        <span className="absolute top-[34px] left-[18px] h-[25px] w-[24px] -rotate-[15deg] rounded-[77%_48%_28%_52%] bg-[linear-gradient(145deg,#ffeac6,#e3aa70_62%,#87574b)] [clip-path:polygon(0_0,100%_0,100%_77%,54%_64%,35%_100%,0_100%)]" />
      </div>

      <div
        className={`absolute top-[10px] left-[12px] h-[95px] w-[88px] origin-[70%_25%] transition-[translate,rotate,opacity] ease-out motion-reduce:transition-none ${blanketPosition}`}
      >
        <span className="absolute inset-0 bg-[linear-gradient(115deg,#397d70,#225e54_48%,#15463e)] [clip-path:polygon(28%_3%,43%_0,62%_5%,75%_17%,81%_33%,92%_62%,100%_89%,87%_96%,67%_93%,48%_100%,21%_93%,0_82%,10%_56%,13%_34%,19%_14%)]">
          <span className="absolute inset-0 bg-[radial-gradient(circle,#e2dba2_1px,transparent_1.5px)] bg-size-[8px_8px] opacity-60" />
          <span className="absolute inset-0 bg-[linear-gradient(104deg,transparent_25%,#092e2c66_45%,transparent_58%,#b0d6a72e_72%,transparent_80%)]" />
        </span>
      </div>
    </div>
  );
}

export default function ParrotLogin() {
  const id = useId();
  const [login, setLogin] = useState("");
  const [field, setField] = useState<"login" | "password" | null>(null);
  const [reply, setReply] = useState(-1);
  const [complete, setComplete] = useState(false);
  const covered = field === "password" && !complete;

  let message = "Кар-р, привет!";
  if (field === "login") message = login.trim() || "Как тебя зовут?";
  if (covered) message = PASSWORD_REPLIES[reply] ?? "Я не смотрю!";
  if (complete) message = "Кар-р, готово!";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setLogin("");
    setReply(-1);
    setComplete(true);
  }

  const inputClass = "min-h-11 w-full rounded-xl border border-[#d8cbb8] bg-[#fffefa] px-3 text-base text-[#2a2623] outline-none placeholder:text-[#776c62] focus:border-[#a84631] focus:ring-2 focus:ring-[#a84631]/20";

  return (
    <div className="relative w-full min-w-0 max-w-[350px] pt-[110px] font-sans text-[#2a2623] [color-scheme:light]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[148px]">
        <div className="absolute top-[30px] right-[101px] max-w-[calc(100%-109px)] rounded-[16px_16px_4px_16px] border border-[#d8cbb8] bg-[#fff9ed] px-3 py-2 text-sm font-semibold shadow-[0_3px_9px_#4e3a2112]">
          <p className={field === "login" && !complete ? "truncate" : "text-pretty"}>{message}</p>
        </div>
        <Parrot covered={covered} watching={field === "login" && !complete} />
      </div>

      <form
        autoComplete="off"
        onSubmit={submit}
        onChange={() => setComplete(false)}
        className="relative rounded-[24px] border border-[#e4d8c6] bg-[#fffcf4] p-5 shadow-[0_22px_52px_-27px_#43362660] sm:p-7"
      >
        <h3 className="font-sans text-[27px] leading-tight font-bold tracking-tight">Вход</h3>
        <p className="mt-1 text-sm leading-snug text-[#63594f]">Для демо подойдут любые тестовые данные.</p>

        <label htmlFor={`${id}-login`} className="mt-5 mb-1.5 block text-sm font-semibold">Логин</label>
        <input
          id={`${id}-login`}
          type="text"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          onFocus={() => setField("login")}
          onBlur={() => setField(null)}
          placeholder="Например, капитан"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={48}
          required
          className={inputClass}
        />

        <label htmlFor={`${id}-password`} className="mt-3.5 mb-1.5 block text-sm font-semibold">Пароль</label>
        <input
          id={`${id}-password`}
          type="password"
          onFocus={() => {
            setField("password");
            setReply(-1);
          }}
          onBlur={() => setField(null)}
          onChange={() => setReply((current) => (current + 1) % PASSWORD_REPLIES.length)}
          autoComplete="new-password"
          placeholder="Минимум 4 символа"
          minLength={4}
          required
          className={inputClass}
        />

        <button type="submit" className="mt-5 min-h-11 w-full cursor-pointer rounded-xl bg-[#382c28] px-4 text-sm font-bold text-[#fff8e9] transition-colors hover:bg-[#57392c] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#a84631]">
          Войти
        </button>
        <p role="status" className="text-center text-sm font-semibold text-[#21574a]">
          {complete && <span className="mt-3 block">Демо-вход выполнен.</span>}
        </p>
      </form>
    </div>
  );
}
