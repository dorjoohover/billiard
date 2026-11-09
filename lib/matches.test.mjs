import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMatch, standings } from "./matches.ts";

const form = (o) => (k) => o[k];

test("parseMatch validates input", () => {
  const ok = parseMatch(form({ mode: "team", a: "  Бат  Баг ", b: "Хүрэл", scoreA: "5", scoreB: "3" }), "x", 1);
  assert.deepEqual(ok, { id: "x", mode: "team", a: "Бат Баг", b: "Хүрэл", scoreA: 5, scoreB: 3, at: 1 });
  assert.equal(typeof parseMatch(form({ mode: "x", a: "A", b: "B", scoreA: "1", scoreB: "0" }), "x", 1), "string");
  assert.equal(typeof parseMatch(form({ mode: "single", a: "A", b: "a", scoreA: "1", scoreB: "0" }), "x", 1), "string");
  assert.equal(typeof parseMatch(form({ mode: "single", a: "A", b: "B", scoreA: "-1", scoreB: "0" }), "x", 1), "string");
  assert.equal(typeof parseMatch(form({ mode: "single", a: "A", b: "B", scoreA: "0", scoreB: "0" }), "x", 1), "string");
  assert.equal(typeof parseMatch(form({ mode: "single", a: "", b: "B", scoreA: "1", scoreB: "0" }), "x", 1), "string");
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
