import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_* or the KV_REST_API_* vars Vercel's Upstash integration sets.
export const redis = Redis.fromEnv();
