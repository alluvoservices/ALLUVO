import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import twilio from "twilio";
import axios from "axios";
import http from "http";
import { Server } from "socket.io";
import bcrypt from "bcryptjs";
import validator from "validator";
import { parsePhoneNumberFromString } from "libphonenumber-js";

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

// Config
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TMDB = process.env.TMDB_API_KEY || "";
const ORIGIN = process.env.CORS_ORIGIN || "*";
const whitelist = ORIGIN.split(",").map(o => o.trim());
const DEMO_LOGIN = String(process.env.DEMO_LOGIN || "").toLowerCase() === "true";
const DEMO_CODE = process.env.DEMO_CODE || "";

// CORS (Express)
app.use(cors({
  origin(origin, cb) {
    if (!origin || whitelist.includes("*") || whitelist.includes(origin)) cb(null, true);
    else cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true
}));
app.use(express.json({ limit: "5mb" })); // allow small avatar data URLs, etc.

// CORS (Socket.io)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || whitelist.includes("*") || whitelist.includes(origin)) cb(null, true);
      else cb(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST"]
  }
});

// In-memory stores (demo)
const users = new Map(); // id -> { id, type: 'email'|'phone', passwordHash? }
const profilesByUser = new Map(); // userId -> [{id,name,avatar,kids}]
const activeProfileByUser = new Map(); // userId -> profileId
const notificationsByUser = new Map(); // userId -> [notes]
const MAX_PROFILES = 4;
const makeId = () => Math.random().toString(36).slice(2, 10);

// OTP (optional)
let smsClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}
const VERIFY_SID = process.env.TWILIO_VERIFY_SID || ""; // if present, use Verify for phone OTP

// Email (SMTP)
let mailer = null;
if (process.env.SMTP_HOST) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

// OTP fallback store (if not using Verify or for email)
const otpStore = new Map(); // key -> { code, expiresAt }
const OTP_TTL_MS = 5 * 60 * 1000;

// Helpers
const makeOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

function normalizeIdentifier(raw, country) {
  const v = String(raw || "").trim();
  if (!v) throw new Error("Identifier required");
  // Email
  if (v.includes("@")) {
    const e = v.toLowerCase();
    if (!validator.isEmail(e)) throw new Error("Invalid email");
    return { id: e, type: "email" };
  }
  // Phone (try parse with country)
  const cc = (country || "IN").toUpperCase();
  const p = parsePhoneNumberFromString(v, cc);
  if (!p || !p.isValid()) throw new Error("Invalid phone");
  return { id: p.number, type: "phone" }; // E.164
}

function passwordStrong(pw) {
  // 8–18, 1 upper, 1 lower, 1 digit, 1 symbol
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,18}$/.test(String(pw || ""));
}

function ensureUser(userId) {
  if (!profilesByUser.has(userId)) {
    const defaults = ["KIDS", "Profile 2", "Profile 3", "Profile 4"];
    const list = defaults.map((name, i) => ({ id: makeId(), name, avatar: null, kids: i === 0 }));
    profilesByUser.set(userId, list.slice(0, MAX_PROFILES));
    activeProfileByUser.set(userId, list[3].id);
  }
  if (!notificationsByUser.has(userId)) {
    notificationsByUser.set(userId, [
      { id: makeId(), title: "Welcome to ALLUVO", body: "Enjoy the Digital Multiplex!", read: false, ts: Date.now() }
    ]);
  }
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    ensureUser(req.userId);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Rate limit for request-otp
const limiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth/request-otp", limiter);

// ========== Password auth ==========
app.post("/api/auth/register", async (req, res) => {
  try {
    const { identifier, password, country } = req.body || {};
    const norm = normalizeIdentifier(identifier, country);
    if (!passwordStrong(password)) return res.status(400).json({ error: "Weak password" });
    if (users.has(norm.id)) return res.status(409).json({ error: "Account already exists" });
    const hash = await bcrypt.hash(password, 10);
    users.set(norm.id, { id: norm.id, type: norm.type, passwordHash: hash });
    ensureUser(norm.id);
    const token = jwt.sign({ sub: norm.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: norm.id }, profiles: profilesByUser.get(norm.id), activeId: activeProfileByUser.get(norm.id) });
  } catch (e) {
    res.status(400).json({ error: e.message || "Invalid data" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password, country } = req.body || {};
    const norm = normalizeIdentifier(identifier, country);
    const u = users.get(norm.id);
    if (!u || !u.passwordHash) return res.status(400).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    ensureUser(norm.id);
    const token = jwt.sign({ sub: norm.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: norm.id }, profiles: profilesByUser.get(norm.id), activeId: activeProfileByUser.get(norm.id) });
  } catch (e) {
    res.status(400).json({ error: e.message || "Invalid data" });
  }
});

// ========== OTP auth (still available) ==========
async function sendOtp({ phone, email, code }) {
  if (phone) {
    if (smsClient && VERIFY_SID) {
      await smsClient.verify.v2.services(VERIFY_SID).verifications.create({ to: phone, channel: "sms" });
      return { via: "sms-verify" };
    }
    if (smsClient && process.env.TWILIO_PHONE) {
      await smsClient.messages.create({
        to: phone, from: process.env.TWILIO_PHONE,
        body: `Your ALLUVO login code is ${code}. Expires in 5 minutes.`
      });
      return { via: "sms" };
    }
    console.log("[DEV SMS OTP]", phone, code);
    return { via: "sms-dev" };
  }
  if (email) {
    if (mailer) {
      await mailer.sendMail({
        to: email,
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        subject: "ALLUVO OTP",
        text: `Your ALLUVO login code is ${code}. Expires in 5 minutes.`,
        html: `<p>Your ALLUVO login code is <b>${code}</b>. Expires in 5 minutes.</p>`
      });
      return { via: "email" };
    }
    console.log("[DEV EMAIL OTP]", email, code);
    return { via: "email-dev" };
  }
  throw new Error("No phone or email provided");
}

app.post("/api/auth/request-otp", async (req, res) => {
  const phone = req.body.phone?.trim();
  const email = req.body.email?.trim()?.toLowerCase();
  if (!phone && !email) return res.status(400).json({ error: "Provide phone or email" });
  const key = phone || email;
  const code = makeOTP();
  if (!phone || !VERIFY_SID) {
    otpStore.set(key, { code, expiresAt: Date.now() + OTP_TTL_MS });
    setTimeout(() => otpStore.delete(key), OTP_TTL_MS + 1000);
  }
  try {
    const info = await sendOtp({ phone, email, code });
    res.json({ sent: true, via: info.via });
  } catch (e) {
    console.error(e); res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const phone = req.body.phone?.trim();
  const email = req.body.email?.trim()?.toLowerCase();
  const code = String(req.body.code || "");
  const key = phone || email;
  if (!key || !code) return res.status(400).json({ error: "Missing data" });

  if (phone && smsClient && VERIFY_SID) {
    try {
      const check = await smsClient.verify.v2.services(VERIFY_SID).verificationChecks.create({ to: phone, code });
      if (check.status !== "approved") return res.status(400).json({ error: "Invalid code" });
    } catch {
      return res.status(400).json({ error: "Invalid or expired code" });
    }
  } else {
    const record = otpStore.get(key);
    if (!record) return res.status(400).json({ error: "OTP not found or expired" });
    if (Date.now() > record.expiresAt) { otpStore.delete(key); return res.status(400).json({ error: "OTP expired" }); }
    if (record.code !== code) return res.status(400).json({ error: "Invalid code" });
    otpStore.delete(key);
  }

  // Auto-provision user record so password login can be added later
  const type = email ? "email" : "phone";
  if (!users.has(key)) users.set(key, { id: key, type });
  ensureUser(key);
  const token = jwt.sign({ sub: key }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: key }, profiles: profilesByUser.get(key), activeId: activeProfileByUser.get(key) });
});

// DEMO login
app.post("/api/auth/demo", (req, res) => {
  if (!DEMO_LOGIN) return res.status(403).json({ error: "Demo login disabled" });
  if (DEMO_CODE && req.body?.code !== DEMO_CODE) return res.status(403).json({ error: "Invalid demo code" });
  const userId = "demo@alluvo.local";
  users.set(userId, { id: userId, type: "email" });
  ensureUser(userId);
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: userId }, profiles: profilesByUser.get(userId), activeId: activeProfileByUser.get(userId) });
});

// Profiles API
app.get("/api/profiles", (req, res, next) => auth(req, res, next), (req, res) => {
  res.json({ profiles: profilesByUser.get(req.userId) || [], activeId: activeProfileByUser.get(req.userId) || null });
});
app.post("/api/profiles", (req, res, next) => auth(req, res, next), (req, res) => {
  const list = profilesByUser.get(req.userId) || [];
  if (list.length >= MAX_PROFILES) return res.status(400).json({ error: "Max 4 profiles" });
  const name = (req.body?.name || `Profile ${list.length + 1}`).slice(0, 30);
  const p = { id: makeId(), name, avatar: req.body?.avatar || null, kids: !!req.body?.kids };
  list.push(p); profilesByUser.set(req.userId, list);
  res.json({ profile: p });
});
app.put("/api/profiles/:id", (req, res, next) => auth(req, res, next), (req, res) => {
  const list = profilesByUser.get(req.userId) || [];
  const p = list.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  if (req.body?.name !== undefined) p.name = String(req.body.name).slice(0, 30);
  if (req.body?.avatar !== undefined) p.avatar = req.body.avatar;
  if (req.body?.kids !== undefined) p.kids = !!req.body.kids;
  res.json({ profile: p });
});
app.delete("/api/profiles/:id", (req, res, next) => auth(req, res, next), (req, res) => {
  const list = profilesByUser.get(req.userId) || [];
  const idx = list.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [removed] = list.splice(idx, 1);
  profilesByUser.set(req.userId, list);
  if (activeProfileByUser.get(req.userId) === removed.id) {
    activeProfileByUser.set(req.userId, list[0]?.id || null);
  }
  res.json({ ok: true });
});
app.post("/api/profiles/:id/activate", (req, res, next) => auth(req, res, next), (req, res) => {
  const list = profilesByUser.get(req.userId) || [];
  const p = list.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  activeProfileByUser.set(req.userId, p.id);
  res.json({ activeId: p.id });
});

// Notifications
app.get("/api/notifications", (req, res, next) => auth(req, res, next), (req, res) => {
  res.json({ items: (notificationsByUser.get(req.userId) || []).sort((a,b)=>b.ts-a.ts) });
});
app.post("/api/notifications/:id/read", (req, res, next) => auth(req, res, next), (req, res) => {
  const items = notificationsByUser.get(req.userId) || [];
  const it = items.find(x => x.id === req.params.id);
  if (it) it.read = true;
  res.json({ ok: true });
});
app.delete("/api/notifications/read", (req, res, next) => auth(req, res, next), (req, res) => {
  let items = notificationsByUser.get(req.userId) || [];
  items = items.filter(x => !x.read);
  notificationsByUser.set(req.userId, items);
  res.json({ ok: true });
});

// TMDB helpers (if TMDB_API_KEY is present)
const TMDB_BASE = "https://api.themoviedb.org/3";
async function tmdb(path, params = {}) {
  if (!TMDB) return { results: [] };
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set("api_key", TMDB);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const { data } = await axios.get(url.toString());
  return data;
}
function poster(urlPath, size = "w500") {
  return urlPath ? `https://image.tmdb.org/t/p/${size}${urlPath}` : null;
}

// Movies
app.get("/api/movies/trending", async (req, res) => {
  try {
    const data = await tmdb("/trending/movie/week", { language: "en-IN" });
    const items = (data.results || []).map(m => ({ id: m.id, title: m.title, rating: m.vote_average, overview: m.overview, poster: poster(m.poster_path) }));
    res.json({ items });
  } catch { res.json({ items: [] }); }
});
app.get("/api/movies/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ items: [] });
  try {
    const data = await tmdb("/search/movie", { query: q, language: "en-IN" });
    const items = (data.results || []).slice(0, 20).map(m => ({ id: m.id, title: m.title, rating: m.vote_average, overview: m.overview, poster: poster(m.poster_path) }));
    res.json({ items });
  } catch { res.json({ items: [] }); }
});
app.get("/api/movies/:id", async (req, res) => {
  try {
    const m = await tmdb(`/movie/${req.params.id}`, { language: "en-IN" });
    res.json({ id: m.id, title: m.title, rating: m.vote_average, overview: m.overview, poster: poster(m.poster_path), backdrop: poster(m.backdrop_path, "w1280") });
  } catch { res.status(404).json({ error: "Not found" }); }
});
function providerSearchUrl(provider, title) {
  const q = encodeURIComponent(title);
  const map = {
    "Netflix": `https://www.netflix.com/search?q=${q}`,
    "Amazon Prime Video": `https://www.primevideo.com/search?phrase=${q}`,
    "Disney Plus": `https://www.disneyplus.com/search?q=${q}`,
    "Hotstar": `https://www.hotstar.com/in/search?q=${q}`,
    "JioCinema": `https://www.jiocinema.com/search/${q}`,
    "ZEE5": `https://www.zee5.com/search?q=${q}`,
    "aha": `https://www.aha.video/search?query=${q}`,
    "Discovery Plus": `https://www.discoveryplus.in/search?q=${q}`
  };
  return map[provider] || `https://www.google.com/search?q=${encodeURIComponent(provider + " " + title)}`;
}
app.get("/api/movies/:id/open", async (req, res) => {
  try {
    const m = await tmdb(`/movie/${req.params.id}`, { language: "en-IN" });
    const p = await tmdb(`/movie/${req.params.id}/watch/providers`);
    const inProviders = p.results?.IN?.flatrate || [];
    const links = inProviders.map(x => ({ provider: x.provider_name, url: providerSearchUrl(x.provider_name, m.title) }));
    res.json({ title: m.title, links });
  } catch { res.json({ title: "", links: [] }); }
});

// Food/Tickets/Global search stubs
const FOODS = [
  { id: "f1", name: "Chicken Biryani", type: "non-veg", img: "https://images.unsplash.com/photo-1601050690597-9f7a27f2d2cc?w=600&q=60" },
  { id: "f2", name: "Veg Biryani", type: "veg", img: "https://images.unsplash.com/photo-1604908176997-431f9f675e3e?w=600&q=60" },
  { id: "f3", name: "Paneer Wrap", type: "veg", img: "https://images.unsplash.com/photo-1604908553724-2893a4e7b1d9?w=600&q=60" },
  { id: "f4", name: "Chicken Wrap", type: "non-veg", img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=60" },
  { id: "f5", name: "Margherita Pizza", type: "veg", img: "https://images.unsplash.com/photo-1548365328-9f547fb09574?w=600&q=60" }
];
app.get("/api/food/search", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const veg = req.query.veg;
  let items = FOODS.filter(x => x.name.toLowerCase().includes(q));
  if (veg === "veg") items = items.filter(x => x.type === "veg");
  if (veg === "non-veg") items = items.filter(x => x.type === "non-veg");
  items = items.map(i => ({ ...i, link: `https://www.eatsure.com/search?q=${encodeURIComponent(i.name)}` }));
  res.json({ items });
});
app.get("/api/tickets/search", (req, res) => {
  const q = String(req.query.q || "").trim();
  const city = (req.query.city || "hyderabad").toLowerCase().replace(/\s+/g, "-");
  res.json({ items: q ? [{ id: "t-" + makeId(), title: q, link: `https://in.bookmyshow.com/explore/movies-${city}?query=${encodeURIComponent(q)}` }] : [] });
});
app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ movies: [], food: [], tickets: [] });
  try {
    const [movies, food, tickets] = await Promise.all([
      TMDB ? tmdb("/search/movie", { query: q, language: "en-IN" }).then(d => (d.results || []).slice(0, 8).map(m => ({ id: m.id, title: m.title, poster: poster(m.poster_path) }))) : [],
      Promise.resolve(FOODS.filter(x => x.name.toLowerCase().includes(q.toLowerCase())).map(i => ({ id: i.id, name: i.name, type: i.type, link: `https://www.eatsure.com/search?q=${encodeURIComponent(i.name)}` }))),
      Promise.resolve([{ id: "bms", title: q, link: `https://in.bookmyshow.com/explore/movies-hyderabad?query=${encodeURIComponent(q)}` }])
    ]);
    res.json({ movies, food, tickets });
  } catch { res.json({ movies: [], food: [], tickets: [] }); }
});

// Socket.io chat relay
io.on("connection", (socket) => {
  socket.on("join", (room) => socket.join(room));
  socket.on("message", ({ room, ciphertext, meta }) => {
    io.to(room).emit("message", { ciphertext, meta, ts: Date.now() });
  });
});


/* Feedback email (rate limited) */
const feedbackLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
app.use("/api/feedback", feedbackLimiter);

app.post("/api/feedback", async (req, res) => {
  try {
    const { name = "", email = "", subject = "", message = "", type = "General", rating } = req.body || {};
    const trimmedMsg = String(message || "").trim();
    if (!trimmedMsg || trimmedMsg.length < 10) return res.status(400).json({ error: "Please write at least 10 characters." });

    const cleanSubject = String(subject || "Feedback").slice(0, 120);
    const cleanName = String(name || "").slice(0, 80);
    const cleanType = String(type || "General").slice(0, 40);
    const cleanEmail = String(email || "").trim();
    if (cleanEmail && !validator.isEmail(cleanEmail)) return res.status(400).json({ error: "Enter a valid contact email." });

    if (!mailer) {
      console.log("[Feedback received but SMTP not configured]:", { name: cleanName, email: cleanEmail, subject: cleanSubject, type: cleanType, rating, message: trimmedMsg.slice(0,400) });
      return res.status(500).json({ error: "Email service not configured" });
    }

    const to = process.env.FEEDBACK_TO || "alluvohq@gmail.com";
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || to;

    const html = `
      <h3>ALLUVO – New Feedback</h3>
      <p><b>Type:</b> ${cleanType}</p>
      ${rating ? '<p><b>Rating:</b> ' + rating + '/5</p>' : ''}
      <p><b>Name:</b> ${cleanName || "(not provided)"}</p>
      <p><b>Contact:</b> ${cleanEmail || "(not provided)"} </p>
      <hr/>
      <pre style="font-family: ui-monospace, Menlo, Consolas, monospace; white-space: pre-wrap;">${trimmedMsg}</pre>
      <hr/>
      <small>Sent from ALLUVO web app.</small>
    `;
    const text = [
      "ALLUVO – New Feedback",
      "Type: " + cleanType,
      rating ? "Rating: " + rating + "/5" : "",
      "Name: " + (cleanName || "(not provided)"),
      "Contact: " + (cleanEmail || "(not provided)"),
      "",
      trimmedMsg
    ].filter(Boolean).join("\n");

    await mailer.sendMail({
      to,
      from,
      replyTo: cleanEmail || undefined,
      subject: `[ALLUVO Feedback] ${cleanSubject}`,
      text,
      html
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unable to send feedback right now" });
  }
});
app.get("/api/health", (_, res) => res.json({ ok: true }));

httpServer.listen(PORT, () => {
  console.log(`API + Socket.io on http://localhost:${PORT}`);
});
