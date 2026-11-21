/* =====================================================================
   HOSTEL DOST — app.js
   A group chat for one hostel block, with "Dost Bot" answering common
   questions inside the same chat.

   HOW THE CHAT IS CARRIED — read this before touching anything:
   This app talks to the chat through a small "transport" layer with
   two real implementations:

   1) NexconnTransport  — the real Nexconn Chat SDK (the challenge's
      hard requirement). It only starts when a real App Key AND a user
      token are pasted into the CONFIG block below.
   2) LocalDemoTransport — a demo mode that stores messages in this
      browser's localStorage and syncs between tabs of the same
      browser. It exists so the app can be opened and tried before the
      Nexconn account exists. The UI always shows which mode is live —
      demo mode is never dressed up as the real thing.

   Nothing in this file pretends a demo message went through Nexconn.
   ===================================================================== */

"use strict";

/* =====================================================================
   CONFIG — Nexconn Chat SDK
   ---------------------------------------------------------------------
   The official Nexconn Web SDK is the npm packages `@nexconn/engine`
   and `@nexconn/chat` (docs.nexconn.ai/chatsdk-web). Nexconn offers no
   official CDN <script>, so a normal project installs them with npm
   and bundles them. This shell has no build step, so when a real key
   is present it loads the SAME published package through the esm.sh
   ESM mirror via a dynamic import — the code that runs is Nexconn's
   own package either way.

   TO GO LIVE:
   1. Create the app in the Nexconn Console (console.nexconn.ai) and
      copy its App Key into APP_KEY below. The App Key is the public,
      browser-safe key. NEVER put the App Secret here — it stays on a
      server, always.
   2. A user token proves who is connecting. Tokens are issued by the
      Nexconn Server API (needs the App Secret, server-side) or, for
      testing, from the Console's API playground for a test user. Put
      one test token in USER_TOKEN, or point TOKEN_ENDPOINT at a small
      server route of yours that returns { token: "..." } for the
      signed-in user id.
   3. GROUP_IDS maps each block to the group ID created for it in
      Nexconn (groups are created from the Console / Server API). If a
      block has no entry, the block name itself is used as the ID.
   4. BOT_HOST: in live mode Dost Bot must post as its own Nexconn user
      from exactly ONE running client, otherwise every open tab would
      answer at once. Leave BOT_HOST false everywhere except that one
      client. In demo mode the bot answers only in the tab where the
      question was typed, so duplicates cannot happen there either.
   ===================================================================== */
const NEXCONN_CONFIG = {
  APP_KEY: "m7ua80gbmcx5m", // real App Key of the "Hostel Dost" app in the Nexconn Console (wired 20 Nov 2026)
  USER_TOKEN: "6HPJ7mB3XGpNuJ1qlfDsGVK5AhguL1iK6cl+HipQ2nw=@m39e.sg.rongnav.com;m39e.sg.rongcfg.com", // Console test token for user ID "rahul_demo" — testing only; a real deployment issues per-user tokens server-side (TOKEN_ENDPOINT)
  TOKEN_ENDPOINT: "",            // optional: URL that returns { "token": "..." } for the current user
  SDK_ESM_URL: "https://esm.sh/@nexconn/chat@26.2.1", // same package as `npm install @nexconn/chat`
  GROUP_IDS: {
    "A Block": "block_a", // created via the client SDK (GroupChannel.createGroup) on 20 Nov 2026, owner rahul_demo, send verified.
    "B Block": "block_b", // created the same way on 20 Nov 2026 (createGroup returned success).
    "C Block": "block_c", // created the same way on 20 Nov 2026 (createGroup returned success).
    "D Block": "block_d", // created the same way on 20 Nov 2026 (createGroup returned success).
  },
  BOT_HOST: false,
};

/* =====================================================================
   Dost Bot — fixed knowledge list
   ---------------------------------------------------------------------
   ~15 everyday hostel questions. Each entry has:
     q        — the question as shown on the Common Questions screen
     group    — Food / Facilities / Rules
     keywords — Hindi + English words that trigger this answer
     a        — the answer Dost Bot posts, in plain Hinglish
   The answers below are written for one sample hostel. A real hostel
   edits the timings in this one list and the bot is theirs.
   The bot matches keywords only. No match = no made-up answer, ever.
   ===================================================================== */
const KNOWLEDGE = [
  // ---- Khana (Food) ----
  {
    group: "Khana (Food)",
    q: "Mess kab khulta hai, kab band hota hai?",
    keywords: ["mess timing", "mess time", "mess kab", "mess band", "mess khulta", "mess khula", "mess close", "mess open", "khana kab tak", "mess ka time"],
    a: "Mess ka time fixed hai — subah 7:30–9:30 nashta, dopahar 12:30–2:30 lunch, shaam 7:30–9:30 dinner. Dinner ke baad mess band ho jata hai, to 9:30 se pehle aa jana.",
  },
  {
    group: "Khana (Food)",
    q: "Nashta (breakfast) kab milta hai?",
    keywords: ["breakfast", "nashta", "nashta kab", "subah ka khana"],
    a: "Nashta subah 7:30 se 9:30 tak milta hai. Sunday ko aadha ghanta late shuru hota hai, 8 baje se.",
  },
  {
    group: "Khana (Food)",
    q: "Lunch kab milta hai?",
    keywords: ["lunch", "lunch kab", "dopahar ka khana"],
    a: "Lunch dopahar 12:30 se 2:30 tak hai. Class ke beech me aana ho to 12:30 wala batch hi pakdo, 2:30 ke baad mess band milta hai.",
  },
  {
    group: "Khana (Food)",
    q: "Dinner kab milta hai?",
    keywords: ["dinner", "dinner kab", "raat ka khana"],
    a: "Dinner shaam 7:30 se 9:30 tak milta hai. Uske baad bahar se order karna padega, mess me kuch nahi bachega.",
  },
  {
    group: "Khana (Food)",
    q: "Aaj mess me kya bana hai?",
    keywords: ["menu", "aaj kya bana", "khane me kya", "aaj ka khana", "aaj kya hai khane"],
    a: "Aaj ka menu subah notice board par lag jata hai. Roz ka fix pattern hai — dal, sabzi, roti, chawal. Wednesday aur Sunday ko special banta hai.",
  },
  // ---- Suvidha (Facilities) ----
  {
    group: "Suvidha (Facilities)",
    q: "Wi-Fi ka password kaise milega?",
    keywords: ["wifi", "wi-fi", "wi fi", "internet", "password", "net nahi"],
    a: "Wi-Fi ka password room allotment ke time mili slip par hota hai — har student ka alag hota hai, isliye group me password mat maango. Slip kho gayi ho to ID card leke warden office jao, wahi se dobara mil jayega.",
  },
  {
    group: "Suvidha (Facilities)",
    q: "Laundry kab aata hai?",
    keywords: ["laundry", "kapde", "dhobi", "washing", "kapda dhona"],
    a: "Laundry wala har Tuesday aur Friday shaam 5 baje aata hai, ground floor ke paas khada hota hai. Kapdon par apna room number likhna mat bhoolna. Ek lot ke 60 rupay lagte hain, wapas 2 din me milta hai.",
  },
  {
    group: "Suvidha (Facilities)",
    q: "Garam paani kab aata hai?",
    keywords: ["garam paani", "geyser", "hot water", "nahane ka paani"],
    a: "Garam paani subah 6–9 aur shaam 6–9 milta hai, geyser usi time chalta hai. Baaki time thanda paani hi aayega.",
  },
  {
    group: "Suvidha (Facilities)",
    q: "Peene ka paani kahan se bharun?",
    keywords: ["peene ka paani", "drinking water", "ro", "paani bharna", "bottle bharna"],
    a: "Har floor par RO laga hai, peene ka paani wahi se bharna. Dopahar me sabse khali milta hai, subah-shaam line lagti hai.",
  },
  {
    group: "Suvidha (Facilities)",
    q: "Light jaye to backup hai kya?",
    keywords: ["light", "light gayi", "bijli", "power cut", "generator", "inverter", "andhera"],
    a: "Light jaye to generator 5 minute me chalu ho jata hai — fan aur light chalenge, par AC aur geyser nahi. Agar 15 minute tak na aaye to gate wale guard ko bata do.",
  },
  {
    group: "Suvidha (Facilities)",
    q: "Room ki safai kab hoti hai?",
    keywords: ["safai", "cleaning", "room saaf", "jhadu", "safai wala"],
    a: "Room ki safai roz subah 10 baje se pehle hoti hai. Us time room khula rakhna, warna safai wala aage badh jayega. Bathroom ki gehri safai Sunday ko hoti hai.",
  },
  // ---- Niyam (Rules) ----
  {
    group: "Niyam (Rules)",
    q: "Gate kab band hota hai? Late aa sakte hain?",
    keywords: ["gate band", "gate kab", "late entry", "late aa", "bahar se aana", "entry time", "gate timing"],
    a: "Main gate raat 10:30 band ho jata hai. Uske baad aana ho to pehle warden ko call karke bata do — bina bataye aane par entry register me naam likhna padta hai aur warning milti hai.",
  },
  {
    group: "Niyam (Rules)",
    q: "Guest ya parents aa sakte hain?",
    keywords: ["guest", "visitor", "parents aa", "dost aa sakta", "bahar wala", "mummy papa"],
    a: "Guest din me 10 se shaam 6 tak allowed hai, gate par entry karani padti hai. Raat ko koi ruk nahi sakta. Parents aane wale hon to ek din pehle warden se permission le lo.",
  },
  {
    group: "Niyam (Rules)",
    q: "Quiet hours kab se hain?",
    keywords: ["quiet hours", "shor", "awaaz", "tez music", "padhai ka time"],
    a: "Raat 10 baje ke baad quiet hours hai — room aur corridor me tez music ya shor nahi. Exam ke dino me ye niyam aur sakht ho jata hai.",
  },
  {
    group: "Niyam (Rules)",
    q: "Rent kab tak jama karna hai?",
    keywords: ["rent", "kiraya", "due date", "paisa kab", "fees kab", "jama karna"],
    a: "Rent har mahine ki 10 tarikh tak jama karna hota hai. Uske baad roz 50 rupay late fee lagti hai. Receipt hamesha office se lena — online bheja ho to screenshot sambhal ke rakhna.",
  },
  {
    group: "Niyam (Rules)",
    q: "Warden se kaise baat karun? Complaint kahan karun?",
    keywords: ["warden", "complaint", "shikayat", "problem hai", "madad", "contact number"],
    a: "Warden sir ka office ground floor, room 4 me hai — subah 10 se shaam 5 milte hain. Complaint register wahi rakha hai. Raat ko emergency ho to gate wale guard ko bolo, wahi warden ko call karta hai.",
  },
];

const BOT_NAME = "Dost Bot";
const BOT_FALLBACK =
  "Iska jawab mujhe nahi pata, aur galat jawab main dunga nahi. Koi senior bata dega. " +
  "Jo sawal mujhe aate hain, wo upar 'Common sawal' me saaf likhe hain.";
const BOT_WELCOME =
  "Namaste! Main Dost Bot hoon. Mess ka time, laundry, Wi-Fi, gate ke niyam — ye roz wale sawal mujhse yahi chat me puchh lo, turant jawab dunga. " +
  "Jo mujhe nahi aata, usme saaf mana kar dunga aur seniors bata denge.";

/* ---------------------------------------------------------------------
   Bot matching — plain keyword scoring. Longer keyword hits count
   more, so "mess band kab hota hai" lands on the mess-timing answer
   and not on a random entry that shares the word "kab".
   ------------------------------------------------------------------- */
function normalizeText(s) {
  return " " + String(s || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, " ").replace(/\s+/g, " ").trim() + " ";
}

function findAnswer(text) {
  const hay = normalizeText(text);
  let best = null;
  let bestScore = 0;
  for (const item of KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (hay.includes(" " + kw.toLowerCase() + " ") || hay.includes(" " + kw.toLowerCase())) {
        score += kw.length; // longer, more specific phrase = stronger match
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore > 0 ? best : null;
}

const QUESTION_HINTS = [
  "?", "kya", "kab", "kahan", "kaise", "kyun", "kyu", "kitna", "kitne", "kaun",
  "when", "where", "how", "what", "time", "timing", "hai kya", "hota hai", "milta hai", "milega",
];
function looksLikeQuestion(text) {
  const hay = normalizeText(text);
  return QUESTION_HINTS.some((h) => hay.includes(h));
}

/* =====================================================================
   TRANSPORT 1 — LocalDemoTransport (demo mode)
   Messages live in this browser's localStorage, one list per block.
   Tabs of the same browser stay in sync through the `storage` event
   and a BroadcastChannel. Nothing leaves the browser. The UI labels
   this mode openly.
   ===================================================================== */
function createLocalDemoTransport(block, onMessage) {
  const key = "hosteldost_msgs_" + block;
  const channel =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("hosteldost_" + block) : null;
  let seen = new Set();

  function load() {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }
  function save(list) {
    try {
      localStorage.setItem(key, JSON.stringify(list.slice(-200)));
    } catch (e) {
      /* storage full/blocked — demo keeps running in memory for this tab */
    }
  }
  function emitNew(list) {
    for (const m of list) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        onMessage(m);
      }
    }
  }

  return {
    mode: "demo",
    async init() {
      let list = load();
      if (list.length === 0) {
        const welcome = {
          id: "welcome_" + block,
          name: BOT_NAME,
          role: "bot",
          text: BOT_WELCOME,
          ts: Date.now(),
        };
        list = [welcome];
        save(list);
      }
      emitNew(list);
      window.addEventListener("storage", (e) => {
        if (e.key === key) emitNew(load());
      });
      if (channel) {
        channel.onmessage = () => emitNew(load());
      }
    },
    async send(msg) {
      const list = load();
      list.push(msg);
      save(list);
      emitNew(list);
      if (channel) channel.postMessage("new");
    },
  };
}

/* =====================================================================
   TRANSPORT 2 — NexconnTransport (the real Nexconn Chat SDK)
   Uses the real APIs from the official Web quickstart
   (docs.nexconn.ai/chatsdk-web):
     NCEngine.initialize({ appKey })
     NCEngine.addMessageHandler(id, new MessageHandler({...}))
     NCEngine.connect({ token })  -> res.code === 0 means connected
     new GroupChannel(groupId).sendMessage(new SendTextMessageParams({ text }))
   If anything here fails (bad key, no token, group missing), init()
   throws and the app falls back to demo mode with a visible notice —
   it never silently pretends to be connected.
   ===================================================================== */
async function createNexconnTransport(cfg, user, block, onMessage) {
  const sdk = await import(/* @vite-ignore */ cfg.SDK_ESM_URL);
  const { NCEngine, GroupChannel, SendTextMessageParams, MessageHandler, ConnectionStatusHandler } = sdk;
  if (!NCEngine || !GroupChannel || !SendTextMessageParams) {
    throw new Error("Nexconn SDK package loaded but its main exports were not found.");
  }

  NCEngine.initialize({ appKey: cfg.APP_KEY }); // exactly once per page load

  let statusCb = null;
  if (ConnectionStatusHandler) {
    NCEngine.addConnectionStatusHandler(
      "hosteldost-conn",
      new ConnectionStatusHandler({
        onConnectionStatusChanged({ status }) {
          if (statusCb) statusCb(status);
        },
      })
    );
  }

  const channel = new GroupChannel(cfg.GROUP_IDS[block] || block);
  const myUserId = "hd_" + user.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");

  if (MessageHandler) {
    NCEngine.addMessageHandler(
      "hosteldost-msgs",
      new MessageHandler({
        onMessageReceived({ messages }) {
          for (const m of messages || []) {
            // Field names follow the SDK's message object; the sender's
            // display name/role travel in the message text prefix set by
            // send() below until user profiles are wired from a server.
            const raw = (m && (m.text || (m.content && m.content.text) || m.content)) || "";
            const parsed = parseWireText(raw);
            if (parsed && parsed.senderId !== myUserId) {
              onMessage({
                id: "nx_" + (m.messageId || m.id || Math.random().toString(36).slice(2)),
                name: parsed.name,
                role: parsed.role,
                text: parsed.text,
                ts: m.sentAt || m.timestamp || Date.now(),
              });
            }
          }
        },
      })
    );
  }

  let token = cfg.USER_TOKEN;
  if (!token && cfg.TOKEN_ENDPOINT) {
    const r = await fetch(cfg.TOKEN_ENDPOINT + "?userId=" + encodeURIComponent(myUserId));
    const data = await r.json();
    token = data.token;
  }
  if (!token) {
    throw new Error("No Nexconn user token available (set USER_TOKEN or TOKEN_ENDPOINT in the CONFIG block).");
  }

  const res = await NCEngine.connect({ token });
  if (!res || res.code !== 0) {
    throw new Error("Nexconn connect failed, code: " + (res && res.code));
  }

  // Wire format for this shell: "HD1|<userId>|<role>|<name>|<text>".
  // It keeps names/roles visible with zero server code. A production
  // build should switch to Nexconn user profiles instead.
  function parseWireText(raw) {
    if (typeof raw !== "string") return null;
    const parts = raw.split("|");
    if (parts[0] !== "HD1" || parts.length < 5) {
      return { senderId: "?", name: "Hostel member", role: "new", text: raw };
    }
    return { senderId: parts[1], role: parts[2], name: parts[3], text: parts.slice(4).join("|") };
  }

  return {
    mode: "nexconn",
    onStatus(cb) {
      statusCb = cb;
    },
    async send(msg) {
      const wire = ["HD1", myUserId, msg.role, msg.name, msg.text].join("|");
      const { code } = await channel.sendMessage(new SendTextMessageParams({ text: wire }));
      if (code !== 0) throw new Error("Nexconn send failed, code: " + code);
      onMessage(msg); // own message echo (handler above skips our own userId)
    },
  };
}

/* =====================================================================
   APP — state, screens, rendering
   ===================================================================== */
const $ = (id) => document.getElementById(id);
const screens = { join: $("screen-join"), chat: $("screen-chat"), questions: $("screen-questions") };

const state = {
  user: null, // { name, role: 'new' | 'senior', block }
  transport: null,
  messages: [],
  botBusy: false,
  chatSession: 0, // bumped on every enterChat so stale transports go quiet
};

function showScreen(name) {
  for (const k of Object.keys(screens)) screens[k].hidden = k !== name;
  window.scrollTo(0, 0);
}

function roleTag(role) {
  if (role === "senior") return '<span class="tag tag-senior">Senior</span>';
  if (role === "bot") return '<span class="tag tag-bot">Bot</span>';
  return '<span class="tag tag-new">Naya</span>';
}

function fmtTime(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + m + " " + ap;
}

function renderMessage(msg) {
  const wrap = $("messages");
  const row = document.createElement("div");
  row.className = "msg-row" + (state.user && msg.name === state.user.name && msg.role === state.user.role ? " own" : "");

  const bubble = document.createElement("div");
  bubble.className = "bubble" + (msg.role === "bot" ? " bot" : "");

  const sender = document.createElement("div");
  sender.className = "sender";
  const nameSpan = document.createElement("span");
  nameSpan.textContent = msg.name;
  sender.appendChild(nameSpan);
  const tagHolder = document.createElement("span");
  tagHolder.innerHTML = roleTag(msg.role);
  sender.appendChild(tagHolder);

  const text = document.createElement("div");
  text.className = "text";
  text.textContent = msg.text;

  const time = document.createElement("div");
  time.className = "time";
  time.textContent = fmtTime(msg.ts);

  bubble.appendChild(sender);
  bubble.appendChild(text);
  bubble.appendChild(time);
  row.appendChild(bubble);
  wrap.appendChild(row);
}

function scrollToBottom() {
  const wrap = $("messages");
  wrap.scrollTop = wrap.scrollHeight;
}

function addSystemNote(text) {
  const note = document.createElement("div");
  note.className = "day-note";
  note.textContent = text;
  $("messages").appendChild(note);
}

/* ---------------- Bot behaviour ----------------
   Demo mode: the bot answers in the tab where the question was typed
   (the answer is written through the transport, so other tabs of the
   same browser see it too).
   Nexconn mode: only the one client with BOT_HOST = true answers,
   posting as its own run — see the CONFIG comment.
------------------------------------------------- */
function maybeBotReply(userMsg, transport) {
  const botMayPost =
    transport.mode === "demo" || (transport.mode === "nexconn" && NEXCONN_CONFIG.BOT_HOST);
  if (!botMayPost || state.botBusy) return;

  const hit = findAnswer(userMsg.text);
  if (!hit && !looksLikeQuestion(userMsg.text)) return; // normal chat — bot stays out of it

  state.botBusy = true;
  $("typing-row").hidden = false;
  scrollToBottom();
  const answerText = hit ? hit.a : BOT_FALLBACK;
  setTimeout(async () => {
    $("typing-row").hidden = true;
    state.botBusy = false;
    try {
      await transport.send({
        id: "bot_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        name: BOT_NAME,
        role: "bot",
        text: answerText,
        ts: Date.now(),
      });
    } catch (e) {
      /* a failed bot post must never break the chat */
    }
    scrollToBottom();
  }, 900);
}

/* ---------------- Join flow ---------------- */
let joinRole = "new";
let joinBlock = "A Block";

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-checked", b === btn ? "true" : "false");
    });
    joinRole = btn.dataset.role;
  });
});
document.querySelectorAll("#block-chips .chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#block-chips .chip").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-checked", c === chip ? "true" : "false");
    });
    joinBlock = chip.dataset.block;
  });
});

$("join-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("input-name").value.trim();
  if (!name) return;
  state.user = { name, role: joinRole, block: joinBlock };
  try {
    sessionStorage.setItem("hosteldost_user", JSON.stringify(state.user));
  } catch (err) {}
  await enterChat();
});

async function enterChat() {
  const { name, role, block } = state.user;
  showScreen("chat");
  $("chat-block-name").textContent = block + " — Hostel Dost";
  $("profile-line").textContent =
    name + " · " + (role === "senior" ? "Senior" : "Naya Student") + " · " + block;
  $("messages").innerHTML = "";
  state.messages = [];

  const mySession = ++state.chatSession;
  const onMessage = (msg) => {
    if (mySession !== state.chatSession) return; // an old room's transport — ignore
    state.messages.push(msg);
    renderMessage(msg);
    scrollToBottom();
  };

  const keyReady =
    NEXCONN_CONFIG.APP_KEY && NEXCONN_CONFIG.APP_KEY !== "PASTE_APP_KEY_HERE";

  let transport = null;
  let notice = "";
  if (keyReady) {
    $("chat-mode-line").textContent = "Nexconn se jud rahe hain…";
    try {
      transport = await createNexconnTransport(NEXCONN_CONFIG, state.user, block, onMessage);
    } catch (err) {
      notice =
        "Nexconn se jud nahi paya (" + (err && err.message ? err.message : "error") +
        "). Abhi demo mode chal raha hai — message sirf is browser me rahenge.";
      transport = null;
    }
  }
  if (!transport) {
    transport = createLocalDemoTransport(block, onMessage);
    await transport.init();
    if (!notice) {
      notice =
        "Demo mode: Nexconn App Key abhi set nahi hai, isliye message sirf is browser me save hote hain " +
        "(dusri tab khologe to wahan bhi dikhenge). Asli chat ke liye app.js ke CONFIG me App Key dalna hai.";
    }
  }

  state.transport = transport;
  const banner = $("mode-banner");
  if (transport.mode === "nexconn") {
    $("chat-mode-line").textContent = "Nexconn Chat se juda hai · " + block;
    banner.hidden = true;
    addSystemNote("Tum Nexconn wale asli group me ho. Dost Bot ke jawab BOT_HOST wale client se aate hain.");
  } else {
    $("chat-mode-line").textContent = "Demo mode · " + block;
    banner.textContent = notice;
    banner.hidden = false;
  }
  addSystemNote(name + " chat me aa gaya (" + (role === "senior" ? "Senior" : "Naya Student") + ")");
  scrollToBottom();
}

/* ---------------- Composer ---------------- */
$("composer").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("input-message");
  const text = input.value.trim();
  if (!text || !state.transport) return;
  input.value = "";
  const msg = {
    id: "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    name: state.user.name,
    role: state.user.role,
    text,
    ts: Date.now(),
  };
  try {
    await state.transport.send(msg);
  } catch (err) {
    addSystemNote("Message nahi gaya — " + (err && err.message ? err.message : "dobara try karo"));
    return;
  }
  scrollToBottom();
  maybeBotReply(msg, state.transport);
});

/* ---------------- Questions screen ---------------- */
function buildQuestions() {
  const holder = $("question-groups");
  holder.innerHTML = "";
  const groups = [];
  for (const item of KNOWLEDGE) {
    if (!groups.includes(item.group)) groups.push(item.group);
  }
  for (const g of groups) {
    const div = document.createElement("div");
    div.className = "q-group";
    const h = document.createElement("h3");
    h.textContent = g;
    div.appendChild(h);
    for (const item of KNOWLEDGE.filter((i) => i.group === g)) {
      const b = document.createElement("button");
      b.className = "q-item";
      b.type = "button";
      const q = document.createElement("span");
      q.textContent = item.q;
      const hint = document.createElement("span");
      hint.className = "q-hint";
      hint.textContent = "Tap karo — chat me sawal jayega, bot jawab dega";
      b.appendChild(q);
      b.appendChild(hint);
      b.addEventListener("click", () => askQuestion(item.q));
      div.appendChild(b);
    }
    holder.appendChild(div);
  }
}

async function askQuestion(text) {
  showScreen("chat");
  if (!state.transport) return;
  const msg = {
    id: "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    name: state.user.name,
    role: state.user.role,
    text,
    ts: Date.now(),
  };
  try {
    await state.transport.send(msg);
    scrollToBottom();
    maybeBotReply(msg, state.transport);
  } catch (err) {
    addSystemNote("Sawal nahi gaya — dobara try karo");
  }
}

$("btn-questions").addEventListener("click", () => showScreen("questions"));
$("btn-back-chat").addEventListener("click", () => showScreen("chat"));
$("btn-leave").addEventListener("click", () => showScreen("join"));
$("btn-change-identity").addEventListener("click", () => showScreen("join"));

/* ---------------- Start ---------------- */
buildQuestions();
(function restore() {
  try {
    const saved = sessionStorage.getItem("hosteldost_user");
    if (saved) {
      state.user = JSON.parse(saved);
      $("input-name").value = state.user.name;
      enterChat();
    }
  } catch (e) {
    /* no saved user — stay on the join screen */
  }
})();
