// Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch("/login", { method:"POST", body: new URLSearchParams(formData) });
  const msg = await res.text();
  alert(msg);
  if(res.ok){
    if(msg.includes("Admin")) window.location.href = 'admin.html';
    else window.location.href = 'dashboard.html';
  }
});

// Signup
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch("/signup", { method:"POST", body: new URLSearchParams(formData) });
  const msg = await res.text();
  alert(msg);
  if(res.ok) window.location.href = 'dashboard.html';
});

// Dashboard
async function loadAchievements() {
  const res = await fetch('/dashboard');
  if(res.status === 401) return alert("Veuillez vous connecter !");
  const achievements = await res.json();
  const list = document.getElementById('achievementsList');
  if(!list) return;
  list.innerHTML = '';
  achievements.forEach(a=>{
    const li = document.createElement('li');
    li.textContent = `${a.title} - ${a.description}`;
    li.style.color = a.validated ? 'black' : 'gray';
    li.style.opacity = a.validated ? 1 : 0.5;
    list.appendChild(li);
  });
}
loadAchievements();

// Admin
async function loadUsers() {
  const res = await fetch('/admin/users');
  if(res.status === 403) return;
  const users = await res.json();
  const list = document.getElementById('usersList');
  if(!list) return;
  list.innerHTML='';
  users.forEach(u=>{
    const li = document.createElement('li');
    li.textContent=`ID: ${u.id} - Pseudo: ${u.username}`;
    li.style.cursor="pointer";
    li.onclick=()=>loadAchievementsForUser(u.id);
    list.appendChild(li);
  });
}

async function loadAchievementsForUser(userId){
  const res = await fetch('/allAchievements');
  const allAchievements = await res.json();
  const userRes = await fetch('/dashboard');
  const userAchievements = await userRes.json();
  const userValidatedIds = userAchievements.map(a=>a.id);

  const container=document.getElementById('achievementsManagement');
  if(!container) return;
  container.innerHTML='';
  allAchievements.forEach(a=>{
    const div=document.createElement('div');
    const validated = userValidatedIds.includes(a.id);
    div.innerHTML=`${a.title} - ${validated ? a.description : (a.hidden_description?'???':a.description)}
      <button onclick="toggleAchievement(${userId},${a.id},${validated})">${validated?'Dévalider':'Valider'}</button>`;
    container.appendChild(div);
  });
}

async function toggleAchievement(userId,achievementId,has){
  const url = has ? '/admin/remove' : '/admin/award';
  const res = await fetch(url, { method:'POST', body: new URLSearchParams({userId,achievementId}) });
  alert(await res.text());
  loadUsers();
}

// Lancer admin si admin.html
loadUsers();
