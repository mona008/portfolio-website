// db.js
// Sets up the SQLite database for the portfolio website.

const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "portfolio.db"));

db.pragma("journal_mode = WAL");

// --------------------
// Database Schema
// --------------------

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    email TEXT NOT NULL,
    github TEXT,
    linkedin TEXT
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// --------------------
// Profile
// --------------------

const profileCount = db
  .prepare("SELECT COUNT(*) AS c FROM profile")
  .get().c;

if (profileCount === 0) {
  db.prepare(`
    INSERT INTO profile
    (id, name, title, bio, email, github, linkedin)
    VALUES (1, ?, ?, ?, ?, ?, ?)
  `).run(
    "MONA R",
    "B.E. CSE Student | Aspiring Software Developer",
    "B.E. Computer Science and Engineering student passionate about building practical software applications and learning full-stack development.",
    "monaramesh18@gmail.com",
    "https://github.com/mona008",
    "https://www.linkedin.com/in/mona-r-35814637a/"
  );
}

// --------------------
// Skills
// --------------------

const skillCount = db
  .prepare("SELECT COUNT(*) AS c FROM skills")
  .get().c;

if (skillCount === 0) {
  const insertSkill = db.prepare(`
    INSERT INTO skills (name, category, level)
    VALUES (?, ?, ?)
  `);

  const skills = [
    ["HTML5", "Frontend", 5],
    ["CSS3", "Frontend", 5],
    ["JavaScript", "Frontend", 4],
    ["PHP", "Backend", 4],
    ["Node.js", "Backend", 3],
    ["Express.js", "Backend", 3],
    ["MySQL", "Database", 4],
    ["SQLite", "Database", 3],
    ["Git & GitHub", "Tools", 4]
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertSkill.run(...row);
    }
  });

  insertMany(skills);
}

// --------------------
// Projects
// --------------------

const projectCount = db
  .prepare("SELECT COUNT(*) AS c FROM projects")
  .get().c;

if (projectCount === 0) {
  const insertProject = db.prepare(`
    INSERT INTO projects
    (title, description, tech_stack, github_url, live_url, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const projects = [
    [
      "Smart Grocery",
      "A full-stack grocery planning and budget management web application that helps users plan meals, manage grocery items, track expenses, and stay within their monthly budget.",
      "HTML,CSS,JavaScript,PHP,MySQL",
      "https://github.com/mona008/Smart-Grocery",
      "",
      ""
    ],
    [
      "Number Guessing Game",
      "A Java Swing desktop game where users guess a randomly generated number with difficulty levels and interactive gameplay.",
      "Java,Java Swing",
      "https://github.com/mona008/Number-Guessing-Game-Java",
      "",
      ""
    ]
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertProject.run(...row);
    }
  });

  insertMany(projects);
}

// --------------------
// Export Database
// --------------------

module.exports = db;