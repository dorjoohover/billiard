// Pure logic only (no Next/Redis imports) so `node --test` can load it directly.
export type Mode = "single" | "team";

export type Match = {
  id: string;
  mode: Mode;
  a: string;
  b: string;
  scoreA: number;
  scoreB: number;
  at: number;
};

export type Row = { name: string; played: number; won: number; lost: number; diff: number };

const name = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");
const score = (v: unknown) => (typeof v === "string" && /^\d{1,3}$/.test(v) ? Number(v) : NaN);

// Validates untrusted form input; returns an error message or the match.
export function parseMatch(get: (key: string) => unknown, id: string, at: number): Match | string {
  const mode = get("mode");
  const a = name(get("a"));
  const b = name(get("b"));
  const scoreA = score(get("scoreA"));
  const scoreB = score(get("scoreB"));
  if (mode !== "single" && mode !== "team") return "Төрөл буруу байна";
  if (!a || !b || a.length > 40 || b.length > 40) return "Хоёр талын нэрийг оруулна уу (40 тэмдэгтээс бага)";
  if (a.toLowerCase() === b.toLowerCase()) return "Хоёр тал өөр нэртэй байх ёстой";
  if (Number.isNaN(scoreA) || Number.isNaN(scoreB)) return "Оноо буруу байна";
  if (scoreA === 0 && scoreB === 0) return "Оноо 0:0 байна";
  return { id, mode, a, b, scoreA, scoreB, at };
}

export function standings(matches: Match[], mode: Mode): Row[] {
  const rows = new Map<string, Row>();
  const row = (n: string) => {
    const r = rows.get(n) ?? { name: n, played: 0, won: 0, lost: 0, diff: 0 };
    rows.set(n, r);
    return r;
  };
  for (const m of matches) {
    if (m.mode !== mode) continue;
    const a = row(m.a);
    const b = row(m.b);
    a.played++;
    b.played++;
    a.diff += m.scoreA - m.scoreB;
    b.diff += m.scoreB - m.scoreA;
    const [w, l] = m.scoreA > m.scoreB ? [a, b] : m.scoreB > m.scoreA ? [b, a] : [];
    if (w && l) {
      w.won++;
      l.lost++;
    }
  }
  return [...rows.values()].sort((x, y) => y.won - x.won || y.diff - x.diff || x.name.localeCompare(y.name));
}
