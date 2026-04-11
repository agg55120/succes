// ======== SUCCÈS ========
const achievements = [
  { title: "toucher le nean", description: "vous avez toucher quelque chose que vous ne devier pas", code: "895214", icon: "https://img.icons8.com/?size=100&id=EDlqOuNnwBFU&format=png&color=000000" },
  { title: "parler a la paria", description: "vous avez parler a V1CTØR1Δ LUC14NØ", code: "541823", icon: "https://img.icons8.com/?size=100&id=AlkHRCZPpIdm&format=png&color=000000" },
  { title: "parler a l'agent 76", description: "vous lui avez parler", code: "767676", icon: "https://img.icons8.com/?size=100&id=PSYB5B3EHx6s&format=png&color=000000" },
  { title: "parler a l'agent secret", description: "???", code: "???", icon: "https://img.icons8.com/?size=100&id=33452&format=png&color=000000" },
  { title: "vous avez vus ?", description: "etre divin , non pire", code: "87578484174", icon: "https://img.icons8.com/?size=100&id=124346&format=png&color=000000" },
  { title: "bizzard", description: "tu a trouver 1 anomalie de faille", code: "845762", icon: "https://img.icons8.com/?size=100&id=XKEluC8mPaFl&format=png&color=000000" },
  { title: "arme etrange", description: "tu a trouver 1 anormale", code: "15284384", icon: "https://img.icons8.com/?size=100&id=37832&format=png&color=000000" },
  { title: "encore un bunker ?", description: "c'est peut pas un bunker", code: "45186312", icon: "https://img.icons8.com/?size=100&id=VCmAXfBaxpPn&format=png&color=000000" },
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
    topImage.src = "Design sans titre(1).png";
  } else {
    topImage.src = "Capture d'écran 2026-04-09 195652.png";
  }
});

// ======== IMAGE EN HAUT AU SCROLL ========
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  topImage.style.opacity = scrollY > 50 ? 0 : 1;
});
