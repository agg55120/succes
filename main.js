// ======== SUCCÈS ========
// Ajouter de nouveaux succès ici
// Chaque succès : { title: "Titre", description: "Description complète", code: "CODE123" }
const achievements = [
  { title: "Premier succès", description: "Félicitations, vous avez débloqué le premier succès !", code: "ABC123" },
  { title: "Explorateur", description: "Vous avez exploré toutes les zones !", code: "EXPLORE42" },
  // Pour ajouter un nouveau succès, copier-coller une ligne :
  // { title: "Nom du succès", description: "Description ici", code: "CODE_UNIQUE" },
];

// ======== LOCAL STORAGE ========
const UNLOCKED_KEY = "unlockedAchievements";

// Affiche les succès
function displayAchievements(){
  const unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY)||"[]");
  const list = document.getElementById("achievementsList");
  list.innerHTML = "";
  achievements.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `${a.title} - ${unlocked.includes(a.code) ? a.description : "???"}`;
    li.style.color = unlocked.includes(a.code) ? "black" : "gray";
    li.style.opacity = unlocked.includes(a.code) ? 1 : 0.5;
    list.appendChild(li);
  });
}

// Débloquer un succès avec code
document.getElementById("submitCode").addEventListener("click", () => {
  const code = document.getElementById("codeInput").value.trim();
  const found = achievements.find(a => a.code === code);
  if(!found){
    alert("Code invalide !");
    return;
  }

  let unlocked = JSON.parse(localStorage.getItem(UNLOCKED_KEY)||"[]");
  if(unlocked.includes(code)){
    alert("Vous avez déjà ce succès !");
    return;
  }

  unlocked.push(code);
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  alert(`Succès débloqué : ${found.title}`);
  displayAchievements();
});

displayAchievements();
