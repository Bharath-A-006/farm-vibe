# Firebase Setup (Farm Vibe) — naan ready panniten, neenga keys mattum podunga

Demo already works without Firebase (localStorage). Production-ku:

1. https://console.firebase.google.com → Create project `farm-vibe` → Add Web app → copy config.
2. `copy .env.example .env` → fill `VITE_FIREBASE_*` + Razorpay key.
3. `npm i firebase` (farm-vibe folder-la).
4. Auth: Email/Password ON. Admin user-a Firestore `users` collection-la manual-a create pannunga (`role:'admin'`) — public admin signup blocked.
5. Firestore → deploy rules: `firebase deploy --only firestore:rules` (`firestore.rules` ready).
6. `src/firebase.ts`-la comment-ila irukura code-a uncomment pannunga.
7. Payments: Razorpay test key → backend verify (Cloud Function recommended). Demo mock flow same SLA logic.

Automation ready: booking → admin notify → 1-hour SLA check → confirm → tourist/farmer/guide notify → complete → review/complaint loop.
