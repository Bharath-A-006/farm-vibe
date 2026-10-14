# 🌾 Farm Vibe — Every Season. A New Experience.

Fresh build. Natural farm photography (Unsplash) — no AI images. Free AI (no API key).

## Run anywhere (pick ONE)

**0. Double-click, no server (NEW — works like a normal file)**
- Double-click `OPEN-FARMVIBE.bat` (parent folder), OR open `farm-vibe/dist/index.html` directly.
- Works in Edge/Chrome AND in VS Code's preview — no terminal, no localhost needed.
- (Uses HashRouter + relative paths, so every page works from file.)

**1. VS Code (recommended)**
- VS Code → Open Folder → select the `farm-vibe` folder (not the parent).
- First time: Terminal → `npm install`
- Press `Ctrl+Shift+B` → run task **"Farm Vibe: run (dev)"**, OR Terminal → `npm run dev`
- Or press `F5` → **"Farm Vibe: open in Edge/Chrome"** (starts server + opens browser automatically).
- Open http://localhost:5175 (note: URLs now look like `/#/farms` — same app, works everywhere).

**2. Any terminal (PowerShell / CMD / bash)**
```powershell
cd farm-vibe
npm install   # first time only
npm run dev   # or: npm start
```
Open http://localhost:5175

**3. Double-click (Windows)**
- Double-click `RUN-FARMVIBE.bat` (in the parent folder) → browser-la http://localhost:5175

**4. Production build preview (exact investor demo)**
```powershell
cd farm-vibe
npm run build
npm run serve
```
Open http://localhost:5175

**5. Phone / another device (same WiFi)**
- Server binds `0.0.0.0`, so use your PC's LAN IP: http://10.53.208.115:5175
- Find yours: PowerShell → `ipconfig` → IPv4 Address.

**6. Free hosting (Netlify / Vercel / GitHub Pages)**
- `npm run build` → upload the `dist/` folder (drag-drop on Netlify works, no config needed).

> Logo: save your logo image as `farm-vibe/public/logo.png` — navbar, hero and favicon pick it up automatically.

## Demo logins (type manually — no one-tap cards)

| Role | Login |
|---|---|
| Tourist | `divya@demo.in` / `demo123` (or Sign Up — tourists only) |
| Farmer | `9842000111` / `farm123` (Admin-created) |
| Guide | `9751000111` / `guide123` (Admin-created) |
| Admin (private) | http://localhost:5175/panel-verify-login — `admin@farmvibe.in` / `admin123` |

Admin link is NOT on home page (by rule).

## Full flow test (5 min, no refresh needed — tabs sync live)

1. Guest → farm detail → Book (date + slot) → Login → checkout **continues automatically** → Pay → "awaiting Admin verification within 1 hour".
2. Admin (`/panel-verify-login`) → Payments → Confirm → tourist sees it instantly (open two tabs to watch live sync).
3. Admin → Bookings → assign guide (shows "Assigned: name").
4. Farmer adds farm (place dropdown, INR+USDT price) → Admin verifies farm + ID → Tourist Explore shows "New from farmer".
5. Help tabs → complaints → Admin reply → open count drops to 0 when all resolved.
6. Chatbot (bottom-right): English/Tamil, instant replies, thought-process box. Hearts turn red in Favourites (persistent).

## Notes

- Past dates are blocked in every calendar. Plan ≠ Booking. Transport/food/stay verified before confirm.
- Tamil/English toggle in navbar; full UI dictionary in `src/data.ts` (`TX`).
- Firebase production: see `FIREBASE_SETUP.md`. Demo runs without keys.
