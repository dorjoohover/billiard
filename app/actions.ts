"use server";

import { refresh } from "next/cache";
import { parseMatch } from "@/lib/matches";
import { redis } from "@/lib/redis";

// shortcut: no auth — anyone with the URL can add/delete; add a PIN or login if the link goes public.
export async function saveMatch(fd: FormData): Promise<string | undefined> {
  const m = parseMatch((k) => fd.get(k), crypto.randomUUID(), Date.now());
  if (typeof m === "string") return m;
  await redis.hset("matches", { [m.id]: m });
  refresh();
}

export async function deleteMatch(id: string) {
  if (typeof id !== "string") return;
  await redis.hdel("matches", id);
  refresh();
}
