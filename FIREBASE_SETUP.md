# Firebase Setup (VAYALOO) — naan ready panniten, neenga keys mattum podunga

Demo already works without Firebase (localStorage). Production-ku:

1. https://console.firebase.google.com → Create project `farm-vibe` → Add Web app → copy config.
2. `copy .env.example .env` → fill `VITE_FIREBASE_*` + Razorpay key.
3. `npm i firebase` (farm-vibe folder-la).
4. Auth: Email/Password ON. Admin user-a Firestore `users` collection-la manual-a create pannunga (`role:'admin'`) — public admin signup blocked.
5. Firestore → deploy rules: `firebase deploy --only firestore:rules` (`firestore.rules` ready).
6. `src/firebase.ts`-la comment-ila irukura code-a uncomment pannunga.
7. Payments: Razorpay test key → backend verify (Cloud Function recommended). Demo mock flow same SLA logic.

Automation ready: booking → admin notify → 1-hour SLA check → confirm → tourist/farmer/guide notify → complete → review/complaint loop.

## Cross-device live sync (VAYALOO cloud)

Same-browser tabs sync instantly via storage events. For phone + laptop +
other devices syncing together, the app mirrors data to ONE Firestore
document (`app/live`) — no SDK needed (REST based, `src/cloud.ts`):

1. Firebase console → Firestore Database → Create database (production mode).
2. `.env`-la add pannunga:
   ```
   VITE_FIREBASE_API_KEY=<web api key>
   VITE_FIREBASE_PROJECT_ID=<project id>
   ```
3. Firestore Rules (demo — open read/write for the single sync doc):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /app/live { allow read, write: if true; }
       match /{rest=**} { allow read, write: if false; }
     }
   }
   ```
   Production-ku Auth-based rules-ku upgrade pannunga.
4. Rebuild + redeploy. Sidebar badge `Local demo` → `Cloud live` maarum.
   Push (2s debounce) + pull (20s) automatic. Photos stay device-local;
   bookings, farms, users, payments sync everywhere.
