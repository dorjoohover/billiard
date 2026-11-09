import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMatch, standings } from "./matches.ts";

const form = (o) => (k) => o[k];
const base = { game: "Пирамид", mode: "single", a: "A", b: "B" };
const err = (o) => assert.equal(typeof parseMatch(form({ ...base, ...o }), "x", 1), "string", JSON.stringify(o));

test("parseMatch: scored game", () => {
  const ok = parseMatch(form({ game: " Пирамид ", mode: "team", a: "  Бат  Баг ", b: "Хүрэл", scoreA: "5", scoreB: "3" }), "x", 1);
  assert.deepEqual(ok, { id: "x", game: "Пирамид", mode: "team", a: "Бат Баг", b: "Хүрэл", scoreA: 5, scoreB: 3, scored: true, at: 1 });
  err({ mode: "x", scoreA: "1", scoreB: "0" });
  err({ b: "a", scoreA: "1", scoreB: "0" });
  err({ scoreA: "-1", scoreB: "0" });
  err({ scoreA: "0", scoreB: "0" });
  err({ a: "", scoreA: "1", scoreB: "0" });
  err({ game: "", scoreA: "1", scoreB: "0" });
  err({ winner: "c" }); // bogus winner falls back to scored mode, which then needs scores
});

test("parseMatch: win-only game", () => {
  const ok = parseMatch(form({ ...base, game: "Пул", winner: "b" }), "x", 1);
  assert.deepEqual(ok, { id: "x", game: "Пул", mode: "single", a: "A", b: "B", scoreA: 0, scoreB: 1, scored: false, at: 1 });
});

test("standings counts wins, losses, draws and diff per mode", () => {
  const m = (a, b, scoreA, scoreB, mode = "single") => ({ id: a + b, mode, a, b, scoreA, scoreB, at: 0 });
  const rows = standings([m("A", "B", 3, 1), m("B", "C", 2, 2), m("C", "A", 1, 0), m("X", "Y", 9, 0, "team")], "single");
  assert.deepEqual(rows, [
    { name: "A", played: 2, won: 1, lost: 1, diff: 1 },
    { name: "C", played: 2, won: 1, lost: 0, diff: 1 },
    { name: "B", played: 2, won: 0, lost: 1, diff: -2 },
  ]);
});
