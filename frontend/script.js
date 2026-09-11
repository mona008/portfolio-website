// script.js
// Fetches profile, skills, and project data from the backend API and
// renders it into the page. Also handles the contact form submission.

// Change this to your deployed backend URL when you go live
// (e.g. "https://your-app.onrender.com/api")
const API_BASE = "https://portfolio-backend-5oxk.onrender.com/api";

async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile`);
    const profile = await res.json();

    document.getElementById("profile-name").textContent = profile.name;
    document.getElementById("profile-title").textContent = profile.title;
    document.getElementById("profile-bio").textContent = profile.bio;

    const linksEl = document.getElementById("profile-links");
    linksEl.innerHTML = "";
    if (profile.github) {
      linksEl.appendChild(makeLink("GitHub", profile.github));
    }
    if (profile.linkedin) {
      linksEl.appendChild(makeLink("LinkedIn", profile.linkedin));
    }
    if (profile.email) {
      linksEl.appendChild(makeLink(profile.email, `mailto:${profile.email}`));
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
    document.getElementById("profile-name").textContent = "Your Name";
    document.getElementById("profile-bio").textContent =
      "Couldn't reach the API. Make sure the backend server is running on port 5000.";
  }
}

function makeLink(label, href) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = label;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

async function loadSkills() {
  try {
    const res = await fetch(`${API_BASE}/skills`);
    const skills = await res.json();

    const grouped = skills.reduce((acc, skill) => {
      acc[skill.category] = acc[skill.category] || [];
      acc[skill.category].push(skill);
      return acc;
    }, {});

    const container = document.getElementById("skills-groups");
    container.innerHTML = "";

    Object.entries(grouped).forEach(([category, items]) => {
      const group = document.createElement("div");
      group.className = "skills-group";

      const heading = document.createElement("h3");
      heading.textContent = category;
      group.appendChild(heading);

      const tags = document.createElement("div");
      tags.className = "skills-tags";
      items.forEach((skill) => {
        const tag = document.createElement("span");
        tag.className = "skill-tag";
        tag.dataset.level = skill.level;
        tag.textContent = skill.name;
        tags.appendChild(tag);
      });
      group.appendChild(tags);

      container.appendChild(group);
    });
  } catch (err) {
    console.error("Failed to load skills:", err);
  }
}

async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();

    const list = document.getElementById("projects-list");
    list.innerHTML = "";

    projects.forEach((project) => {
      const item = document.createElement("li");
      item.className = "project-item";

      const body = document.createElement("div");

      const title = document.createElement("h3");
      title.className = "project-title";
      title.textContent = project.title;
      body.appendChild(title);

      const desc = document.createElement("p");
      desc.className = "project-desc";
      desc.textContent = project.description;
      body.appendChild(desc);

      const stack = document.createElement("div");
      stack.className = "project-stack";
      project.tech_stack.forEach((tech) => {
        const span = document.createElement("span");
        span.textContent = tech.trim();
        stack.appendChild(span);
      });
      body.appendChild(stack);

      const links = document.createElement("div");
      links.className = "project-links";
      if (project.github_url) {
        links.appendChild(makeLink("Code", project.github_url));
      }
      if (project.live_url) {
        links.appendChild(makeLink("Live demo", project.live_url));
      }
      body.appendChild(links);

      item.appendChild(body);
      list.appendChild(item);
    });
  } catch (err) {
    console.error("Failed to load projects:", err);
    document.getElementById("projects-list").innerHTML =
      "<p>Couldn't reach the API. Make sure the backend server is running.</p>";
  }
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Sending…";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        status.textContent = data.message || "Message sent!";
        form.reset();
      } else {
        status.textContent = data.error || "Something went wrong. Please try again.";
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      status.textContent = "Couldn't reach the server. Please try again later.";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadSkills();
  loadProjects();
  setupContactForm();
});
