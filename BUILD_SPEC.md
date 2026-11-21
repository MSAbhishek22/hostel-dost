# Nexconn Build Challenge — Build Spec: "Hostel Dost"

**Deadline: 22 Nov 2026, 23:59 IST.** Registered on Reskilll, solo team "Abhi Solo". This is a fresh build (not a fleet reuse), so no disclosure split is needed.

---

## 1. What the challenge asks, and how it is judged

Facts below are from the hunt notes in `~/workspace/hackathons/x-hunt-2026-11-19/STARTUPS.md`, which were verified line-by-line on the official page (reskilll.com/hack/nexconn). Anything not in those notes is marked **TO VERIFY** — check it on the event page before building around it.

- **Organiser:** Nexconn (powered by Reskilll) — Nexconn Build Challenge 2026.
- **Prize:** $5,000 cash — $2,000 / $1,250 / $750 / $500 / $500 — plus a 2-year free Chat Plan for each winner.
- **Teams:** 1–4. Solo is fine ("create a team of one"). He is already registered solo as "Abhi Solo".
- **Who can enter:** free, fully online, open to developers/students worldwide except Mainland China residents. 600+ builders had joined per organiser posts.
- **Hard requirement:** the app must use the **Nexconn Chat SDK** (free tier). No SDK integration, no entry.
- **What must be submitted:** live app link, public GitHub repo, demo video, and a write-up that includes the Nexconn **App Key**.
- **Existing projects:** allowed only if a real Chat SDK integration is added during the challenge, with the split disclosed. (Hostel Dost is built fresh, so this does not apply — but keep the repo history clean and inside the window anyway.)

### Judging (judge-scored, no public vote)

| Criterion | Weight | What it means for this build |
|---|---|---|
| Completeness & UX | **50%** | Half the marks. The chat must actually work end to end, look clean, and have no dead buttons or half-finished screens. Polish beats extra features. |
| Innovation | **30%** | The AI helper living inside the group chat is the new idea here — a chat that answers, not just carries messages. |
| Business & growth | **20%** | The write-up needs a short, honest growth note: which hostels/PGs would use this first and how it spreads (one hostel → its students invite the next batch). |

**TO VERIFY on the event page (not in the hunt notes):**
- Whether there are fixed themes/problem statements, or any chat app is fine.
- The exact submission form fields on Reskilll (some forms ask for more than the four items above).
- The Chat SDK's web/JS package name, docs URL, and what the free tier allows (users, messages, group size).
- Whether group channels, read receipts, and typing indicators are in the free tier — the build below only depends on basic group messaging; anything extra is a bonus.
- Whether the App Key in the write-up is the public app key only (never a secret/master key — if the form asks for anything secret-like, stop and check).

---

## 2. The build: Hostel Dost

**One line:** a group chat for a hostel or PG where new students ask seniors their everyday questions — and an AI helper inside the same chat answers the common ones right away, in Hindi + English.

**Why this fits the rubric:**
- The Chat SDK does real work: real accounts, a real group room, real messages between two people. It is not a chat skin over a static page.
- The helper is the innovation (30%): it sits in the chat as a member ("Dost Bot"), watches for common questions, and answers from a small fixed knowledge list — mess timings, laundry day, warden rules, Wi-Fi, guest policy, quiet hours. Fixed list = no made-up answers, and it works without any paid AI API.
- Completeness (50%): the whole thing is small enough to finish properly — join, chat, ask, get an answer.

**How the helper works (keep it simple and honest):**
- A fixed knowledge list of ~15 hostel questions and answers, written in simple Hindi + English (Hinglish-friendly: "mess kab band hota hai?" and "when does the mess close?" both match).
- Simple keyword matching on each new message. If it matches, Dost Bot posts the answer in the chat. If not, the bot stays quiet and a senior can answer — the bot never guesses.
- A "Common questions" panel lists everything the bot knows, so judges can test it in one tap (tap a question → it posts to the chat → bot answers).

**The 3 screens:**
1. **Join screen** — name + pick a role (New Student / Senior) + pick your hostel block. One tap in, no password. (Demo-friendly: a judge can open two tabs as two people.)
2. **Group chat screen** — the hostel group room, powered by the Chat SDK: messages, names, roles shown as small tags (Senior / New / Dost Bot). This is the main screen; it must feel finished.
3. **Common questions screen/panel** — the fixed knowledge list, grouped (Food, Rules, Facilities), with tap-to-ask. Also shows "what Dost Bot can answer" honestly.

**Demo script (for the video):** Tab 1 joins as a new student "Rahul", asks "mess ka khana kab tak milta hai?" → Dost Bot answers in the chat. Tab 2 joins as senior "Priya", answers a question the bot doesn't know. Rahul asks about laundry → bot answers. Done — SDK chat + bot, both proven live.

---

## 3. Build steps, in order

1. **Verify first (15 min):** open reskilll.com/hack/nexconn and the Nexconn docs; clear every TO VERIFY item above, especially the SDK package and free-tier limits. Note the exact submission form fields.
2. **Create the Nexconn account + app** (user's hands — account creation is his step): sign up on Nexconn, create one app for Hostel Dost, note the **App Key** and any SDK keys. If a key must be saved for reuse, it goes through the user's **Secure Vault** — never in chat, never in the repo, never in this file.
3. **Scaffold:** single-page web app (plain HTML/JS or a light Vite app — whichever deploys fastest to GitHub Pages). Create the GitHub repo `hostel-dost` under MSAbhishek22 at the start, and commit as you go (history inside the challenge window).
4. **Wire the Chat SDK:** connect with the App Key, create users on join (name + role), one group channel per hostel block. Get two-browser-tab messaging working before touching any design.
5. **Add Dost Bot:** the fixed knowledge list + keyword matcher, posting answers into the same channel as a bot user. Test the Hinglish variants.
6. **Build the 3 screens** to a finished standard — this is where the 50% UX marks live. Empty states, loading states, and a clean mobile view (judges may open it on a phone).
7. **Test like a stranger:** fresh browser, no cache — join as two users, run the full demo script, check the bot answers and stays quiet on unknown questions.
8. **Deploy** to GitHub Pages; confirm the live link works signed-out.
9. **Record the demo video** from the LIVE link (screen recording, real actions, per standing rule — no screenshot/slide videos).
10. **Write the write-up** (plain words, see checklist) and **submit on Reskilll** well before 23:59 IST on 22 Nov.

**Time shape:** steps 1–4 are the risky half (new SDK) — do them first, today. Steps 5–7 are known work. If the SDK fights back after a fair try, the fallback is to shrink scope (one block, one room) — never to fake the chat.

---

## 4. Submission checklist

- [ ] Live app link (GitHub Pages), verified as a signed-out stranger
- [ ] Public GitHub repo, commits inside the challenge window
- [ ] Nexconn Chat SDK really integrated (two users messaging live in the demo)
- [ ] Demo video: screen recording of the LIVE app, full demo script from §2
- [ ] Write-up in plain words: what it is, who it helps, how the SDK is used, the **App Key**, and the short growth note (Business & growth = 20%)
- [ ] Team on Reskilll shows "Abhi Solo"; submission filed before **22 Nov 2026, 23:59 IST**
- [ ] After filing: open the submitted entry once and confirm it is visible/complete on the platform
