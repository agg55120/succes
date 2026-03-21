// ======== SUCCÈS ========
const achievements = [
  { title: "Premier succès", description: "Félicitations, vous avez débloqué le premier succès !", code: "ABC123", icon: "🏆" },
  { title: "Explorateur", description: "Vous avez exploré toutes les zones !", code: "EXPLORE42", icon: "🧭" },
  { title: "Maîtrise du jeu", description: "Vous avez complété tous les défis !", code: "MASTER2026", icon: "⚡" },
  { title: "Débutant courageux", description: "Vous avez essayé pour la première fois !", code: "BEGINNER01", icon: "💪" },
  { title: "Secret bien gardé", description: "Vous avez trouvé un secret !", code: "SECRET99", icon: "🔒" },
];

const UNLOCKED_KEY = "unlockedAchievements";

function displayAchievements() {
  const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY) || "[]");
  const container = document.getElementById("achievementsContainer");
  container.innerHTML = "";

  const unlockedList = achievements.filter(a => unlocked.includes(a.code));
  const lockedList = achievements.filter(a => !unlocked.includes(a.code));

  [...unlockedList, ...lockedList].forEach(a => {
    const div = document.createElement("div");
    div.className = "achievement" + (unlocked.includes(a.code) ? " unlocked" : "");

    if(a.icon.startsWith("http")) {
      const img = document.createElement("img");
      img.src = a.icon;
      div.appendChild(img);
    } else {
      const span = document.createElement("div");
      span.className = "emoji";
      span.textContent = a.icon;
      div.appendChild(span);
    }

    const content = document.createElement("div");
    content.className = "content";
    const title = document.createElement("strong");
    title.textContent = a.title;
    const desc = document.createElement("span");
    desc.textContent = unlocked.includes(a.code) ? a.description : "???";
    content.appendChild(title);
    content.appendChild(desc);
    div.appendChild(content);

    container.appendChild(div);
  });
}

// Débloquer via code
document.getElementById("submitCode").addEventListener("click", () => {
  const code = document.getElementById("codeInput").value.trim().toUpperCase();
  const found = achievements.find(a => a.code.toUpperCase() === code);
  if(!found){ alert("Code invalide !"); return; }

  let unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY) || "[]");
  if(unlocked.includes(found.code)){ alert("Succès déjà débloqué !"); return; }

  unlocked.push(found.code);
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  displayAchievements();
});

displayAchievements();

// ======== MODE SOMBRE ========
const toggleDark = document.getElementById("toggleDark");
const topImage = document.getElementById("topImage");

toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  // Changer l'image selon le mode
  if(document.body.classList.contains("dark")){
    topImage.src = "https://via.placeholder.com/1200x200/222222/ffffff.png?text=Mode+sombre";
  } else {
    topImage.src = "https://png.pngtree.com/thumb_back/fh260/background/20240522/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg";
  }
});

// ======== IMAGE EN HAUT AU SCROLL ========
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  topImage.style.opacity = scrollY > 50 ? 0 : 1;
});
