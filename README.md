# Hostel Dost — app shell

A group chat for one hostel block. New students ask the everyday questions
(mess timing, laundry, Wi-Fi, gate rules) inside the chat itself, and
**Dost Bot** — a member of the same chat — answers the common ones right
away, in Hinglish. What it does not know, it says so plainly and a senior
answers. It never makes up an answer.

Built for the **Nexconn Build Challenge** (submission due 22 Nov 2026,
23:59 IST). See `../BUILD_SPEC.md` for the full plan and checklist.

## Files

| File | What it is |
|---|---|
| `index.html` | The 3 screens: Join (name + role + block), Group Chat, Common Questions |
| `styles.css` | Mobile-first styling, no framework |
| `app.js` | Everything else: Nexconn CONFIG block, Dost Bot's fixed knowledge list (~16 questions) + keyword matcher, the two chat transports, and the UI logic |

No build step. Open `index.html` in a browser, or serve the folder with
any static server (e.g. `python3 -m http.server`).

## What is real today

- **All 3 screens work.** Join with a name, pick New Student or Senior,
  pick a block, and you are in that block's group room.
- **Dost Bot works.** It matches ~16 fixed hostel questions by keywords
  (Hindi + English spellings both work, e.g. "laundry kab aata hai?" and
  "when does the mess close?"). Tap-to-ask from the Common Questions
  screen posts the question into the chat and the bot answers there.
  Unknown questions get one honest line — the bot says it does not know
  and that a senior will answer. Normal chat messages are left alone.
- **Demo mode chat works inside one browser.** If Nexconn cannot be
  reached, messages are stored in the browser's localStorage (one list
  per block) and sync live between tabs of the same browser — so the
  two-tab demo (Rahul in one tab, Priya in another) still runs. The
  chat header and a banner on screen say "Demo mode" openly. Nothing in
  demo mode touches Nexconn's servers, and the app never claims it does.
- **The Nexconn integration is wired and verified live (20 Nov 2026).**
  The real App Key of the "Hostel Dost" Nexconn app and a Console test
  token (test user `rahul_demo`) are in the `NEXCONN_CONFIG` block in
  `app.js`. In a headless-browser test on this machine the SDK loaded,
  connected (the navi server itself confirmed userId `rahul_demo`),
  the chat header showed "Nexconn Chat se juda hai", and a test
  message sent from the app's own UI reached the real A Block group on
  Nexconn's servers. `app.js` uses the official Web SDK flow from
  docs.nexconn.ai (`NCEngine.initialize({ appKey })`,
  `addMessageHandler`, `NCEngine.connect({ token })`,
  `GroupChannel.sendMessage` with `SendTextMessageParams`). Nexconn
  ships the Web SDK only as npm packages (`@nexconn/engine`,
  `@nexconn/chat`) with no official CDN, so this no-build-step shell
  loads the same published package through the esm.sh ESM mirror.
  If connecting fails for any reason, the app falls back to demo mode
  and shows why — it never silently pretends to be connected. (One
  early test attempt did exactly that: the navi fetch timed out, the
  banner said so, and a fresh page load connected fine.)
- **All four block groups exist.** Each block's group was created from
  the client SDK (`GroupChannel.createGroup`) with `rahul_demo` as
  owner — A Block (`block_a`) first, then B, C and D Block (`block_b`,
  `block_c`, `block_d`) the same way on 20 Nov 2026; every createGroup
  call returned success. All four are wired in `GROUP_IDS`. Sends are
  verified from the app's own UI in A Block and in B Block — the
  header showed the live Nexconn mode and the test message reached
  the group with no failure note.
- **Honest limit of the current wiring:** everyone who opens this
  shell right now connects as the same test user, `rahul_demo`,
  because there is one shared test token in the CONFIG block. That is
  fine for the demo recording. Real students each need their own
  token, issued server-side (see "What remains").

## What remains (in order)

1. ~~**Create the Nexconn account + app and paste the App Key**~~ —
   DONE 20 Nov 2026. The App Key and a Console test token for
   `rahul_demo` are in the `NEXCONN_CONFIG` block, and the live
   connection plus a real message send are verified (see above). The
   **App Secret must never go in this file or repo** — it belongs on
   a server only.
2. **Per-user tokens for real use.** Testing is covered by the shared
   `rahul_demo` test token now in `USER_TOKEN`. For real students, set
   `TOKEN_ENDPOINT` to a small server route that issues a token per
   signed-in user via the Server API.
3. ~~**Create the B, C and D Block groups**~~ — DONE 20 Nov 2026.
   All four groups (`block_a`–`block_d`) were created with
   `GroupChannel.createGroup` and are in `GROUP_IDS`; a UI send from
   B Block is verified (see "What is real today").
4. **Verify live messaging between two different users** (a second
   Console test user + token), including
   the sender name/role display (this shell passes name + role inside
   the message wire text as a zero-server shortcut; a production build
   should use Nexconn user profiles instead). Set `BOT_HOST: true` on
   exactly one client so Dost Bot posts its answers into the live group
   exactly once.
5. **Deploy** (GitHub Pages), run the full demo script as a stranger,
   record the demo video from the live link, and file the submission on
   Reskilll with the App Key in the write-up — all before
   **22 Nov 2026, 23:59 IST**.
