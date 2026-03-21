// ======== SUCCÈS ========
// Tous les succès sont visibles, mais grisés si non débloqués
const achievements = [
  { title: "Premier succès", description: "Félicitations, vous avez débloqué le premier succès !", code: "ABC123" },
  { title: "Explorateur", description: "Vous avez exploré toutes les zones !", code: "EXPLORE42" },
  { title: "Maîtrise du jeu", description: "Vous avez complété tous les défis !", code: "MASTER2026" },
  { title: "Débutant courageux", description: "Vous avez essayé pour la première fois !", code: "BEGINNER01" },
  { title: "Secret bien gardé", description: "Vous avez trouvé un secret !", code: "SECRET99" },
];

const UNLOCKED_KEY = "unlockedAchievements";

// Affiche tous les succès
function displayAchievements(){
  const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY) || "[]");
  const list = document.getElementById("achievementsList");
  list.innerHTML = "";
  achievements.forEach(a => {
    const li = document.createElement("li");
    // Toujours visible, description cachée si pas débloqué
    li.textContent = `${a.title} - ${unlocked.includes(a.code) ? a.description : "???"}`;
    li.style.color = unlocked.includes(a.code) ? "black" : "gray";
    li.style.opacity = unlocked.includes(a.code) ? 1 : 0.5;
    list.appendChild(li);
  });
}

// Débloquer un succès via code
document.getElementById("submitCode").addEventListener("click", () => {
  const code = document.getElementById("codeInput").value.trim().toUpperCase();
  const found = achievements.find(a => a.code.toUpperCase() === code);
  if(!found){
    alert("Code invalide !");
    return;
  }

  let unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY) || "[]");
  if(unlocked.includes(found.code)){
    alert("Vous avez déjà ce succès !");
    return;
  }

  unlocked.push(found.code);
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  alert(`Succès débloqué : ${found.title}`);
  displayAchievements();
});

displayAchievements();
