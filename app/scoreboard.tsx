"use client";

import { useState } from "react";
import { saveMatch } from "./actions";
import type { Game, Mode } from "@/lib/matches";

const chip = (on: boolean) =>
  `rounded-full px-3 py-1.5 text-sm font-medium ${on ? "bg-white text-felt-dark" : "bg-black/25 text-white/85"}`;

export function Scoreboard({ names, games }: { names: Record<Mode, string[]>; games: Game[] }) {
  const [game, setGame] = useState(games[0].name);
  const [scored, setScored] = useState(games[0].scored);
  const [mode, setMode] = useState<Mode>("single");
  const [scores, setScores] = useState([0, 0]);
  // Controlled so React's post-action form reset keeps names for the next game.
  const [sides, setSides] = useState(["", ""]);
  const [msg, setMsg] = useState("");
  const label = mode === "single" ? "Тоглогч" : "Баг";
  const known = games.some((g) => g.name === game);

  const bump = (i: number, d: number) => setScores((s) => s.map((v, j) => (j === i ? Math.max(0, v + d) : v)));

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl bg-felt p-4 text-white shadow-lg"
      action={async (fd) => {
        const err = await saveMatch(fd);
        const w = fd.get("winner");
        setMsg(err ?? (w ? `Хадгаллаа ✓ ${sides[w === "a" ? 0 : 1]} хожлоо` : "Хадгаллаа ✓"));
        if (!err) setScores([0, 0]);
      }}
    >
      {/* Disabled default button: Enter in a name field must not submit (or pick a winner). */}
      <button type="submit" disabled hidden aria-hidden />
      <input type="hidden" name="game" value={game} />
      <input type="hidden" name="mode" value={mode} />

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Тоглоомын төрөл">
        {games.map((g) => (
          <button
            key={g.name}
            type="button"
            role="radio"
            aria-checked={game === g.name}
            onClick={() => {
              setGame(g.name);
              setScored(g.scored);
            }}
            className={chip(game === g.name)}
          >
            {g.name}
          </button>
        ))}
        <input
          value={known ? "" : game}
          onChange={(e) => setGame(e.target.value)}
          maxLength={30}
          placeholder="Өөр төрөл…"
          aria-label="Өөр төрөл"
          className={`${chip(!known)} w-28 placeholder:text-white/60`}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-2 gap-1 rounded-xl bg-black/25 p-1" role="radiogroup" aria-label="Хэлбэр">
          {(["single", "team"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-lg py-2 font-medium ${mode === m ? "bg-white text-felt-dark" : "text-white/80"}`}
            >
              {m === "single" ? "Ганцаарчилсан" : "Багаар"}
            </button>
          ))}
        </div>
        {/* A button, not a checkbox: React's post-action form reset would uncheck a checkbox's DOM state. */}
        <button type="button" role="switch" aria-checked={scored} onClick={() => setScored(!scored)} className={chip(scored)}>
          {scored ? "✓ " : ""}Оноо тоолох
        </button>
      </div>

      <datalist id="names">
        {names[mode].map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <input
              name={i ? "b" : "a"}
              list="names"
              required
              maxLength={40}
              value={sides[i]}
              onChange={(e) => setSides((s) => s.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder={`${label} ${i + 1}`}
              aria-label={`${label} ${i + 1}`}
              className="w-full rounded-lg bg-white/90 px-3 py-2 text-center text-zinc-900"
            />
            {scored ? (
              <>
                <input type="hidden" name={i ? "scoreB" : "scoreA"} value={scores[i]} />
                <output className="text-6xl font-bold tabular-nums" aria-live="polite">
                  {scores[i]}
                </output>
                <div className="flex gap-2">
                  <button type="button" onClick={() => bump(i, -1)} aria-label="Хасах" className="size-12 rounded-full bg-black/30 text-2xl">
                    −
                  </button>
                  <button type="button" onClick={() => bump(i, 1)} aria-label="Нэмэх" className="size-12 rounded-full bg-white text-2xl text-felt-dark">
                    +
                  </button>
                </div>
              </>
            ) : (
              <button
                type="submit"
                name="winner"
                value={i ? "b" : "a"}
                className="w-full rounded-xl bg-amber-400 py-6 text-lg font-semibold text-zinc-900 active:bg-amber-500"
              >
                Хожлоо 🏆
              </button>
            )}
          </div>
        ))}
      </div>

      {scored && (
        <button type="submit" className="w-full rounded-xl bg-amber-400 py-3 font-semibold text-zinc-900 active:bg-amber-500">
          Хадгалах
        </button>
      )}
      <p className="-mt-2 min-h-5 text-center text-sm text-white/90" aria-live="polite">
        {msg}
      </p>
    </form>
  );
}
