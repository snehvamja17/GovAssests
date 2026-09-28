# GovAssets – Government Property Lifecycle Management
Next.js 14 + Supabase (Postgres + Auth), deployed on Vercel.
Setup: run supabase/schema.sql in Supabase SQL Editor, create an auth user (Auto Confirm),
copy .env.example to .env.local with your Supabase URL + anon key, then `npm install && npm run dev`.
Deploy: push to GitHub, import in Vercel, add the two env variables.
