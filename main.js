//////////////////////
// Connexion / Inscription
//////////////////////

// Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch("/login", {
    method: "POST",
    body: new URLSearchParams(formData)
  });

  const msg = await res.text();
  alert(msg);

  if(res.ok){
    if(msg.includes("Admin")) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
});

// Signup
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch("/signup", {
    method: "POST",
    body: new URLSearchParams(formData)
  });

  const msg = await res.text();
  alert(msg);

  if(res.ok){
    window.location.href = 'dashboard.html';
  }
});

//////////////////////
// Dashboard : afficher tous les succès
//////////////////////
async function loadAchievements() {
  const res = await fetch('/dashboard');
  if(res.status === 401) return alert("Veuillez vous connecter !");
  const achievements = await res.json();
  const list = document.getElementById('achievementsList');
  if(!list) return;
  list.innerHTML = '';

  achievements.forEach(a => {
    const li = document.createElement('li');
    li.textContent = `${a.title} - ${a.description}`;
    li.style.color = a.validated ? 'black' : 'gray';
    li.style.opacity = a.validated ? 1 : 0.5;
    list.appendChild(li);
  });
}
loadAchievements();

//////////////////////
// Admin : gérer les succès
//////////////////////
async function loadUsers() {
  const res = await fetch('/admin/users');
  if(res.status === 403) return;
  const users = await res.json();
  const list = document.getElementById('usersList');
  if(!list) return;
  list.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `ID: ${u.id} - Pseudo: ${u.username}`;
    li.style.cursor = "pointer";
    li.onclick = () => loadAchievementsForUser(u.id);
    list.appendChild(li);
  });
}

async function loadAchievementsForUser(userId) {
  const res = await fetch('/allAchievements');
  const allAchievements = await res.json();

  const userRes = await fetch('/dashboard'); 
  const userAchievements = await userRes.json(); 
  const userValidatedIds = userAchievements.map(a => a.id);

  const container = document.getElementById('achievementsManagement');
  if(!container) return;
  container.innerHTML = '';
  allAchievements.forEach(a => {
    const div = document.createElement('div');
    const validated = userValidatedIds.includes(a.id);
    div.innerHTML = `
      ${a.title} - ${validated ? a.description : (a.hidden_description ? '???' : a.description)}
      <button onclick="toggleAchievement(${userId}, ${a.id}, ${validated})">
        ${validated ? 'Dévalider' : 'Valider'}
      </button>
    `;
    container.appendChild(div);
  });
}

async function toggleAchievement(userId, achievementId, has) {
  const url = has ? '/admin/remove' : '/admin/award';
  const res = await fetch(url, {
    method: 'POST',
    body: new URLSearchParams({ userId, achievementId })
  });
  alert(await res.text());
  loadUsers();
}

// Lancer admin si on est sur admin.html
loadUsers();const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.sqlite");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secretkey", resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname)));

// --- Admin hardcodé ---
const ADMIN_USERNAME = "AdminMaster";
const ADMIN_PASSWORD = "SuperSecret123";

// --- Créer les succès par défaut ---
const defaultAchievements = [
  { title: 'Premier succès', description: 'Félicitations !', hidden_description: 0 },
  { title: 'Explorateur', description: 'Vous avez exploré toutes les zones !', hidden_description: 1 },
  { title: 'Champion', description: 'Vous avez terminé toutes les missions !', hidden_description: 0 },
];

defaultAchievements.forEach(a => {
  db.run(
    "INSERT OR IGNORE INTO achievements (title, description, hidden_description) VALUES (?, ?, ?)",
    [a.title, a.description, a.hidden_description]
  );
});

// --- ROUTES ---

// Inscription
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], function(err){
    if(err) return res.status(400).send("Erreur : utilisateur existant");
    req.session.userId = this.lastID;
    req.session.isAdmin = 0;
    res.send("Inscription réussie !");
  });
});

// Connexion
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Vérifier si c’est l’admin hardcodé
  if(username === ADMIN_USERNAME && password === ADMIN_PASSWORD){
    req.session.userId = 0;   // id spécial pour admin
    req.session.isAdmin = 1;
    return res.send("Connexion Admin réussie !");
  }

  // Sinon connexion normale
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if(!user) return res.status(400).send("Utilisateur non trouvé");
    if(await bcrypt.compare(password, user.password)){
      req.session.userId = user.id;
      req.session.isAdmin = 0;
      res.send("Connexion réussie !");
    } else {
      res.status(400).send("Mot de passe incorrect");
    }
  });
});

// Dashboard : tous les succès + validés ou non
app.get("/dashboard", (req, res) => {
  if(!req.session.userId) return res.status(401).send("Non autorisé");

  db.all("SELECT * FROM achievements", [], (err, achievements) => {
    if(err) return res.status(500).send("Erreur DB");
    db.all("SELECT achievement_id FROM user_achievements WHERE user_id = ?", [req.session.userId], (err2, userAch) => {
      const userAchievementsIds = userAch.map(a => a.achievement_id);
      const result = achievements.map(a => ({
        id: a.id,
        title: a.title,
        description: (a.hidden_description && !userAchievementsIds.includes(a.id)) ? '???' : a.description,
        validated: userAchievementsIds.includes(a.id),
      }));
      res.json(result);
    });
  });
});

// --- Protection et serveur admin.html ---
app.get("/admin.html", (req, res) => {
  if(!req.session.isAdmin) return res.status(403).send("Accès refusé");
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Admin : tous les utilisateurs
app.get("/admin/users", (req, res) => {
  if(!req.session.isAdmin) return res.status(403).send("Accès refusé");
  db.all("SELECT id, username FROM users", [], (err, users) => res.json(users));
});

// Admin : tous les succès
app.get("/allAchievements", (req, res) => {
  if(!req.session.isAdmin) return res.status(403).send("Accès refusé");
  db.all("SELECT * FROM achievements", [], (err, rows) => res.json(rows));
});

// Admin : attribuer un succès
app.post("/admin/award", (req, res) => {
  if(!req.session.isAdmin) return res.status(403).send("Accès refusé");
  const { userId, achievementId } = req.body;
  db.run(
    "INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, date_awarded) VALUES (?, ?, ?)",
    [userId, achievementId, new Date().toISOString()],
    (err) => err ? res.status(400).send("Erreur") : res.send("Succès attribué !")
  );
});

// Admin : retirer un succès
app.post("/admin/remove", (req, res) => {
  if(!req.session.isAdmin) return res.status(403).send("Accès refusé");
  const { userId, achievementId } = req.body;
  db.run(
    "DELETE FROM user_achievements WHERE user_id = ? AND achievement_id = ?",
    [userId, achievementId],
    (err) => err ? res.status(400).send("Erreur") : res.send("Succès retiré !")
  );
});

// Lancer serveur
app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));
