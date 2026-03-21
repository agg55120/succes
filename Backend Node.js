const express = require("express");
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
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if(!user) return res.status(400).send("Utilisateur non trouvé");
    if(await bcrypt.compare(password, user.password)){
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
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