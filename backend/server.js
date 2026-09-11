// server.js
// Express REST API for the portfolio. Serves profile / skills / projects
// data from SQLite and accepts contact-form submissions.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simple request log — handy while developing
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ---------- Health check ----------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------- Profile ----------
app.get("/api/profile", (_req, res) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json(profile);
});

// ---------- Skills ----------
app.get("/api/skills", (_req, res) => {
  const skills = db.prepare("SELECT * FROM skills ORDER BY category, name").all();
  res.json(skills);
});

// ---------- Projects ----------
app.get("/api/projects", (_req, res) => {
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY created_at DESC")
    .all()
    .map((p) => ({ ...p, tech_stack: p.tech_stack.split(",") }));
  res.json(projects);
});

app.get("/api/projects/:id", (req, res) => {
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ ...project, tech_stack: project.tech_stack.split(",") });
});

// Add a new project (e.g. from an admin form, or just curl/Postman)
app.post("/api/projects", (req, res) => {
  const { title, description, tech_stack, github_url, live_url, image_url } =
    req.body;

  if (!title || !description || !tech_stack) {
    return res
      .status(400)
      .json({ error: "title, description and tech_stack are required" });
  }

  const stack = Array.isArray(tech_stack) ? tech_stack.join(",") : tech_stack;

  const result = db
    .prepare(
      `INSERT INTO projects (title, description, tech_stack, github_url, live_url, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(title, description, stack, github_url || "", live_url || "", image_url || "");

  const created = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({ ...created, tech_stack: created.tech_stack.split(",") });
});

app.delete("/api/projects/:id", (req, res) => {
  const result = db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Project not found" });
  res.json({ success: true });
});

// ---------- Contact form ----------
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email and message are required" });
  }

  db.prepare(
    "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)"
  ).run(name, email, message);

  res.status(201).json({ success: true, message: "Thanks! Your message has been received." });
});

// (Optional) view submitted messages — remove or protect this in production
app.get("/api/contact", (_req, res) => {
  const messages = db
    .prepare("SELECT * FROM messages ORDER BY created_at DESC")
    .all();
  res.json(messages);
});

app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
});
