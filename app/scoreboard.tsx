"use client";

import { useState } from "react";
import { saveMatch } from "./actions";
import type { Mode } from "@/lib/matches";

export function Scoreboard({ names }: { names: Record<Mode, string[]> }) {
  const [mode, setMode] = useState<Mode>("single");
  const [scores, setScores] = useState([0, 0]);
  // Controlled so React's post-action form reset keeps names for the next game.
  const [sides, setSides] = useState(["", ""]);
  const [msg, setMsg] = useState("");
  const label = mode === "single" ? "Тоглогч" : "Баг";

  const bump = (i: number, d: number) => setScores((s) => s.map((v, j) => (j === i ? Math.max(0, v + d) : v)));

  return (
    <form
      className="rounded-2xl bg-felt p-4 shadow-lg"
      action={async (fd) => {
        const err = await saveMatch(fd);
        setMsg(err ?? "Хадгаллаа ✓");
        if (!err) setScores([0, 0]);
      }}
    >
      <input type="hidden" name="mode" value={mode} />
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1" role="radiogroup" aria-label="Төрөл">
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
              value={sides[i]}
              onChange={(e) => setSides((s) => s.map((v, j) => (j === i ? e.target.value : v)))}
              maxLength={40}
              placeholder={`${label} ${i + 1}`}
              aria-label={`${label} ${i + 1}`}
              className="w-full rounded-lg bg-white/90 px-3 py-2 text-center text-zinc-900"
            />
            <input type="hidden" name={i ? "scoreB" : "scoreA"} value={scores[i]} />
            <output className="text-6xl font-bold tabular-nums text-white" aria-live="polite">
              {scores[i]}
            </output>
            <div className="flex gap-2">
              <button type="button" onClick={() => bump(i, -1)} aria-label="Хасах" className="size-12 rounded-full bg-black/30 text-2xl text-white">
                −
              </button>
              <button type="button" onClick={() => bump(i, 1)} aria-label="Нэмэх" className="size-12 rounded-full bg-white text-2xl text-felt-dark">
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="mt-5 w-full rounded-xl bg-amber-400 py-3 font-semibold text-zinc-900 active:bg-amber-500">
        Хадгалах
      </button>
      <p className="mt-2 min-h-5 text-center text-sm text-white/90" aria-live="polite">
        {msg}
      </p>
    </form>
  );
}
