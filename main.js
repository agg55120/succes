// ======== UTILISATEURS =========
const USERS_KEY = "users";
const ACHIEVEMENTS_KEY = "achievements";
const UNLOCKED_KEY = "unlockedAchievements";

// Admin hardcodé
const ADMIN_USERNAME = "AdminMaster";
const ADMIN_PASSWORD = "SuperSecret123";

// --- Connexion / inscription ---
document.getElementById("signupForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  let users = JSON.parse(localStorage.getItem(USERS_KEY)||"[]");
  if(users.includes(username)){ alert("Utilisateur existant"); return; }
  users.push(username);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem("currentUser", username);
  alert("Inscription réussie !");
  window.location.href = "dashboard.html";
});

document.getElementById("loginForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  if(username === ADMIN_USERNAME){
    const password = prompt("Mot de passe admin ?");
    if(password!==ADMIN_PASSWORD){ alert("Mot de passe incorrect"); return; }
    localStorage.setItem("currentUser", ADMIN_USERNAME);
    alert("Connexion admin réussie !");
    window.location.href = "admin.html";
    return;
  }
  let users = JSON.parse(localStorage.getItem(USERS_KEY)||"[]");
  if(!users.includes(username)){ alert("Utilisateur non trouvé"); return; }
  localStorage.setItem("currentUser", username);
  window.location.href = "dashboard.html";
});

// ======== ACHIEVEMENTS ========
let achievements = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY)||"[]");

// Affichage des succès sur dashboard
function displayAchievements(){
  const user = localStorage.getItem("currentUser");
  if(!user || user===ADMIN_USERNAME) return;

  const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY)||"{}");
  const userUnlocked = unlocked[user]||[];

  const list = document.getElementById("achievementsList");
  if(!list) return;
  list.innerHTML = "";
  achievements.forEach(a=>{
    const li = document.createElement("li");
    li.textContent = `${a.title} - ${userUnlocked.includes(a.code)?a.description:"???"}`;
    li.style.color = userUnlocked.includes(a.code)?"black":"gray";
    li.style.opacity = userUnlocked.includes(a.code)?1:0.5;
    list.appendChild(li);
  });
}
displayAchievements();

// Débloquer via code
document.getElementById("submitCode")?.addEventListener("click", ()=>{
  const code = document.getElementById("codeInput").value.trim();
  const user = localStorage.getItem("currentUser");
  if(!user){ alert("Veuillez vous connecter"); return; }
  const found = achievements.find(a=>a.code===code);
  if(!found){ alert("Code invalide"); return; }

  let unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY)||"{}");
  if(!unlocked[user]) unlocked[user] = [];
  if(unlocked[user].includes(code)){ alert("Vous avez déjà ce succès !"); return; }
  unlocked[user].push(code);
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  alert(`Succès débloqué : ${found.title}`);
  displayAchievements();
});

// ======== ADMIN ========
function displayAdmin(){
  const list = document.getElementById("allAchievements");
  if(!list) return;
  list.innerHTML = "";
  achievements.forEach(a=>{
    const li = document.createElement("li");
    li.textContent = `${a.title} - ${a.description} - code: ${a.code}`;
    list.appendChild(li);
  });
}

document.getElementById("addAchievement")?.addEventListener("click", ()=>{
  const title = document.getElementById("newTitle").value.trim();
  const desc = document.getElementById("newDesc").value.trim();
  const code = document.getElementById("newCode").value.trim();
  if(!title||!desc||!code){ alert("Remplissez tous les champs"); return; }
  achievements.push({title, description: desc, code});
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  displayAdmin();
});

displayAdmin();
