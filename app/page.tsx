import { Suspense } from "react";
import { connection } from "next/server";
import { deleteMatch } from "./actions";
import { Scoreboard } from "./scoreboard";
import { standings, type Match, type Mode } from "@/lib/matches";
import { redis } from "@/lib/redis";

const MODES: [Mode, string][] = [
  ["single", "Ганцаарчилсан"],
  ["team", "Багаар"],
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">🎱 Билльярдын оноо</h1>
      <Suspense fallback={<p className="text-zinc-500">Ачаалж байна…</p>}>
        <Board />
      </Suspense>
    </main>
  );
}

async function Board() {
  await connection();
  const matches = Object.values(
    (await redis.hgetall<Record<string, Match>>("matches")) ?? {},
  ).sort((x, y) => y.at - x.at);
  const tables = Object.fromEntries(
    MODES.map(([m]) => [m, standings(matches, m)]),
  ) as Record<Mode, ReturnType<typeof standings>>;
  const names = Object.fromEntries(
    MODES.map(([m]) => [m, tables[m].map((r) => r.name)]),
  ) as Record<Mode, string[]>;

  return (
    <>
      <Scoreboard names={names} />

      {MODES.map(([mode, title]) =>
        tables[mode].length ? (
          <section key={mode} className="rounded-2xl bg-card p-4 shadow-sm">
            <h2 className="mb-2 font-semibold">Чансаа · {title}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-1">#</th>
                    <th>Нэр</th>
                    <th className="text-right">Тоглосон</th>
                    <th className="text-right">Хожсон</th>
                    <th className="text-right">Хожигдсон</th>
                    <th className="text-right">Зөрүү</th>
                  </tr>
                </thead>
                <tbody>
                  {tables[mode].map((r, i) => (
                    <tr
                      key={r.name}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="py-1.5">{i + 1}</td>
                      <td className="font-medium">{r.name}</td>
                      <td className="text-right">{r.played}</td>
                      <td className="text-right">{r.won}</td>
                      <td className="text-right">{r.lost}</td>
                      <td className="text-right">
                        {r.diff > 0 ? `+${r.diff}` : r.diff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null,
      )}

      <section className="rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Түүх</h2>
        {matches.length === 0 && (
          <p className="text-sm text-zinc-500">Одоогоор тоглолт алга.</p>
        )}
        <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          {matches.map((m) => (
            <li key={m.id} className="flex items-center gap-2 py-2">
              <span className="w-12 shrink-0 text-xs text-zinc-500">
                {m.mode === "team" ? "Баг" : "Ганц"}
              </span>
              <span className="flex-1">
                <b className={m.scoreA > m.scoreB ? "" : "font-normal"}>
                  {m.a}
                </b>{" "}
                <span className="tabular-nums">
                  {m.scoreA} : {m.scoreB}
                </span>{" "}
                <b className={m.scoreB > m.scoreA ? "" : "font-normal"}>
                  {m.b}
                </b>
              </span>
              <time
                className="text-xs text-zinc-500"
                dateTime={new Date(m.at).toISOString()}
              >
                {new Date(m.at).toLocaleDateString("mn-MN", {
                  timeZone: "Asia/Ulaanbaatar",
                })}
              </time>
              <form action={deleteMatch.bind(null, m.id)}>
                <button
                  aria-label={`${m.a} – ${m.b} тоглолтыг устгах`}
                  className="px-2 text-zinc-400 hover:text-red-600"
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
