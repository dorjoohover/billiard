import { Suspense } from "react";
import { connection } from "next/server";
import { deleteMatch } from "./actions";
import { Scoreboard } from "./scoreboard";
import { GAMES, standings, type Match, type Mode, type Row } from "@/lib/matches";
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
  const matches = Object.values((await redis.hgetall<Record<string, Match>>("matches")) ?? {})
    // Matches saved before game types existed have no game/scored fields.
    .map((m) => ({ ...m, game: m.game ?? "Бусад", scored: m.scored ?? true }))
    .sort((x, y) => y.at - x.at);

  const games = [...GAMES];
  for (const m of matches) if (!games.some((g) => g.name === m.game)) games.push({ name: m.game, scored: m.scored });

  const names = Object.fromEntries(
    MODES.map(([mode]) => [mode, [...new Set(matches.filter((m) => m.mode === mode).flatMap((m) => [m.a, m.b]))]]),
  ) as Record<Mode, string[]>;

  const played = games.filter((g) => matches.some((m) => m.game === g.name));

  return (
    <>
      <Scoreboard names={names} games={games} />

      {played.map((g, gi) => {
        const ms = matches.filter((m) => m.game === g.name);
        return (
          <details key={g.name} open={gi === 0} className="rounded-2xl bg-card p-4 shadow-sm">
            <summary className="cursor-pointer font-semibold">
              Чансаа · {g.name} <span className="text-sm font-normal text-zinc-500">({ms.length} тоглолт)</span>
            </summary>
            {MODES.map(([mode, title]) => {
              const rows = standings(ms, mode);
              return rows.length ? (
                <div key={mode} className="mt-3">
                  <h3 className="mb-1 text-sm text-zinc-500">{title}</h3>
                  <Table rows={rows} showDiff={ms.some((m) => m.scored)} />
                </div>
              ) : null;
            })}
          </details>
        );
      })}

      <section className="rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Түүх</h2>
        {matches.length === 0 && <p className="text-sm text-zinc-500">Одоогоор тоглолт алга.</p>}
        <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          {matches.map((m) => (
            <li key={m.id} className="flex items-center gap-2 py-2">
              <div className="flex-1">
                {m.scored ? (
                  <>
                    <b className={m.scoreA > m.scoreB ? "" : "font-normal"}>{m.a}</b>{" "}
                    <span className="tabular-nums">
                      {m.scoreA} : {m.scoreB}
                    </span>{" "}
                    <b className={m.scoreB > m.scoreA ? "" : "font-normal"}>{m.b}</b>
                  </>
                ) : (
                  <>
                    🏆 <b>{m.scoreA > m.scoreB ? m.a : m.b}</b> – {m.scoreA > m.scoreB ? m.b : m.a}
                  </>
                )}
                <div className="text-xs text-zinc-500">
                  {m.game} · {m.mode === "team" ? "Баг" : "Ганц"} ·{" "}
                  <time dateTime={new Date(m.at).toISOString()}>
                    {new Date(m.at).toLocaleDateString("mn-MN", { timeZone: "Asia/Ulaanbaatar" })}
                  </time>
                </div>
              </div>
              <form action={deleteMatch.bind(null, m.id)}>
                <button aria-label={`${m.a} – ${m.b} тоглолтыг устгах`} className="px-2 text-zinc-400 hover:text-red-600">
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

function Table({ rows, showDiff }: { rows: Row[]; showDiff: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm tabular-nums">
        <thead className="text-left text-zinc-500">
          <tr>
            <th className="py-1">#</th>
            <th>Нэр</th>
            <th className="text-right">Тоглосон</th>
            <th className="text-right">Хожсон</th>
            <th className="text-right">Хожигдсон</th>
            {showDiff && <th className="text-right">Зөрүү</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} className="border-t border-zinc-200 dark:border-zinc-800">
              <td className="py-1.5">{i + 1}</td>
              <td className="font-medium">{r.name}</td>
              <td className="text-right">{r.played}</td>
              <td className="text-right">{r.won}</td>
              <td className="text-right">{r.lost}</td>
              {showDiff && <td className="text-right">{r.diff > 0 ? `+${r.diff}` : r.diff}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
