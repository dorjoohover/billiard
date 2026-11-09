// Pure logic only (no Next/Redis imports) so `node --test` can load it directly.
export type Mode = "single" | "team";

// scored: false = only the winner is recorded (stored as 1:0).
export type Game = { name: string; scored: boolean };

export const GAMES: Game[] = [
  { name: "Пул", scored: false },
  { name: "9 бөмбөг", scored: false },
  { name: "Пирамид", scored: true },
  { name: "Снукер", scored: true },
];

export type Match = {
  id: string;
  game: string;
  mode: Mode;
  a: string;
  b: string;
  scoreA: number;
  scoreB: number;
  scored: boolean;
  at: number;
};

export type Row = { name: string; played: number; won: number; lost: number; diff: number };

const name = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");
const score = (v: unknown) => (typeof v === "string" && /^\d{1,3}$/.test(v) ? Number(v) : NaN);

// Validates untrusted form input; returns an error message or the match.
// A "winner" field (a|b) means a win-only game; otherwise scoreA/scoreB are required.
export function parseMatch(get: (key: string) => unknown, id: string, at: number): Match | string {
  const game = name(get("game"));
  const mode = get("mode");
  const a = name(get("a"));
  const b = name(get("b"));
  const winner = get("winner");
  const scored = winner !== "a" && winner !== "b";
  const scoreA = scored ? score(get("scoreA")) : Number(winner === "a");
  const scoreB = scored ? score(get("scoreB")) : Number(winner === "b");
  if (!game || game.length > 30) return "Тоглоомын төрлөө сонгоно уу";
  if (mode !== "single" && mode !== "team") return "Төрөл буруу байна";
  if (!a || !b || a.length > 40 || b.length > 40) return "Хоёр талын нэрийг оруулна уу (40 тэмдэгтээс бага)";
  if (a.toLowerCase() === b.toLowerCase()) return "Хоёр тал өөр нэртэй байх ёстой";
  if (Number.isNaN(scoreA) || Number.isNaN(scoreB)) return "Оноо буруу байна";
  if (scored && scoreA === 0 && scoreB === 0) return "Оноо 0:0 байна";
  return { id, game, mode, a, b, scoreA, scoreB, scored, at };
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
