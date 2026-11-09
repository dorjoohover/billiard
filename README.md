# Билльярдын оноо

Ганцаарчилсан болон багийн тоглолтын оноог хөтөлж, Upstash Redis-д хадгална. Чансаа (хожил, хожигдол, онооны зөрүү) болон тоглолтын түүхийг харуулна.

## Vercel дээр deploy хийх

1. Энэ кодыг GitHub руу push хийгээд Vercel дээр **Add New → Project**-оор import хийнэ.
2. Project → **Storage → Create Database → Upstash for Redis** сонгоод project-той холбоно.
   (`KV_REST_API_URL`, `KV_REST_API_TOKEN` env автоматаар нэмэгдэнэ.)
3. **Redeploy** хийнэ.

## Локалаар ажиллуулах

```bash
npx vercel link && npx vercel env pull .env.local   # эсвэл UPSTASH_REDIS_REST_URL / _TOKEN-оо .env.local-д бичнэ
npm run dev
npm test
```

> Нэвтрэлт байхгүй: линктэй хүн бүр оноо нэмж/устгаж чадна.
