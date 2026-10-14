# Farm Vibe — Deploy to Live URL (3 proven paths)

Repo is git-ready (`git log` shows v1 commit). `vercel.json` is configured
(framework=vite, build=`npm run build`, output=`dist`). Build is verified clean.

## Path A — Vercel via GitHub (recommended, auto-redeploy on every push)

1. Create an empty repo on github.com (e.g. `farm-vibe`), do NOT add README.
2. In `farm-vibe` folder terminal:
   ```
   git remote add origin https://github.com/<you>/farm-vibe.git
   git branch -M main
   git push -u origin main
   ```
3. Go to vercel.com → Add New → Project → Import `farm-vibe` → Deploy.
   (Framework/build/output are auto-detected from `vercel.json`. Nothing to change.)
4. Done — you get `https://farm-vibe-xxx.vercel.app`.

## Path B — Vercel from your terminal (no GitHub needed)

```
cd farm-vibe
npx vercel --prod
```
Answer: Set up and deploy? **Y** → scope: your account → link? **N** →
project name: **farm-vibe** → code location: **./** → rest **Enter**.
You get the live URL at the end. (First time opens a browser tab to login.)

## Path C — Netlify Drop (fastest live link, 2 minutes)

1. `npm run build` (already verified — `dist/` is fresh).
2. Open app.netlify.com/drop → drag the `dist/` folder in.
3. Done — live URL instantly. (Re-drag after each `npm run build`.)

## After deploy — verify (no mistakes checklist)

- [ ] Home loads, hero + logo + stats visible.
- [ ] `/farms` → filter → farm detail → slot + date → checkout works.
- [ ] Login as tourist (`divya@demo.in` / `demo123`).
- [ ] Admin: `/panel-verify-login` → `admin@farmvibe.in` / `admin123`.
- [ ] Chatbot replies instantly (fallback brain works without any key).
- [ ] Mobile view (DevTools responsive mode) — bottom Book bar visible.

## Optional — live Gemini key (Vercel dashboard)

Vercel project → Settings → Environment Variables → add
`VITE_GEMINI_API_KEY` = your AI Studio key (`AIza...`) → Redeploy.
(Local `.env` is git-ignored on purpose — never commit keys.)
