const emojisPorFase = [
  ["🐶", "🐱", "🐭", "🐹"], //4 pares
  ["🐶", "🐱", "🐭", "🐹", "🦊", "🐻"], //6 pares
  ["🦁", "🐯", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧"], //8 pares
  ["🦄", "🐍", "🦓", "🐘", "🐪", "🐬", "🐙", "🐢", "🐝"], //9 pares
  ["🌻", "🌼", "🌸", "🌺", "🌹", "🍀", "🌷", "🪷", "🌵", "🍁"], //10 pares
  ["🐙", "🐠", "🐟", "🐡", "🦑", "🦀", "🪼", "🐬", "🐳", "🐋", "🦈"], //11 pares
  ["🐉", "🐲", "🧚", "🧞", "🧜", "🧝", "🧙", "🧛", "👽", "🤖", "👾", "🎃"], //12 pares
  ["🍎", "🍌", "🍉", "🍇", "🍓", "🍒", "🥝", "🍍", "🥥", "🍑", "🍐", "🍊", "🥭"], //13 pares
  ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🥎", "🏓", "🏸", "🥏", "🏒", "🏑"], //14 pares
  ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵"], //15 pares
];

const tempoPorFase = [90, 80, 70, 65, 60, 55, 50, 45, 40, 35]; // Segundos limite por fase

const starsMax = 3;

let level = 0; // 0 a 9 (fase 1 a 10)
let cardsArray = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 0;

const gameBoard = document.getElementById("game-board");
const movesCounter = document.getElementById("moves");
const scoreCounter = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const levelDisplay = document.getElementById("level");
const stageTitle = document.getElementById("stage-title");
const starsContainer = document.getElementById("stars-container");
const restartBtn = document.getElementById("restart-button");
const nextBtn = document.getElementById("next-button");
const shareBtn = document.getElementById("share-button");
const rankingDiv = document.getElementById("ranking");
const rankingList = document.getElementById("ranking-list");

const soundMatch = document.getElementById("sound-match");
const soundError = document.getElementById("sound-error");
const soundWin = document.getElementById("sound-win");
const bgMusic = document.getElementById("bg-music");
const toggleMusicBtn = document.getElementById("toggle-music-btn");

// Começar música ligada
document.addEventListener("DOMContentLoaded", () => {
  bgMusic.play().then(() => {
    musicOn = true;
    toggleMusicBtn.textContent = "🔊 Música Ligada";
  }).catch(() => {
    musicOn = false;
    toggleMusicBtn.textContent = "🔇 Música Desligada";
  });
});

let musicOn = true;

toggleMusicBtn.addEventListener("click", () => {
  if(musicOn){
    bgMusic.pause();
    musicOn = false;
    toggleMusicBtn.textContent = "🔇 Música Desligada";
  } else {
    bgMusic.play();
    musicOn = true;
    toggleMusicBtn.textContent = "🔊 Música Ligada";
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

nextBtn.addEventListener("click", () => {
  if(level < 9){
    level++;
    startPhase(level);
  }
});

shareBtn.addEventListener("click", () => {
  alert(`Partilhar pontuação: ${score} pontos no nível ${level+1}`);
});

function shuffle(array) {
  for(let i = array.length -1; i > 0; i--){
    let j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCardsForPhase(phaseIndex){
  const emojis = emojisPorFase[phaseIndex];
  let cards = [];

  emojis.forEach((emoji) => {
    cards.push({ emoji, id: emoji + "_1" });
    cards.push({ emoji, id: emoji + "_2" });
  });

  return shuffle(cards);
}

function updateTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${mins}:${secs}`;
}

function startTimer(seconds) {
  timeLeft = seconds;
  updateTimerDisplay(timeLeft);

  if(timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);

    if(timeLeft <= 0){
      clearInterval(timerInterval);
      lockBoard = true;
      alert("Tempo esgotado! Fim da fase.");
      endPhase(false);
    }
  }, 1000);
}

function stopTimer(){
  if(timerInterval) clearInterval(timerInterval);
}

function updateStars(){
  const pares = emojisPorFase[level].length;
  let stars = 1;

  if(moves <= pares * 2 + 2) stars = 3;
  else if(moves <= pares * 3) stars = 2;

  starsContainer.textContent = "⭐".repeat(stars);
  return stars;
}

function updateStageTitle(){
  const fases = [
    "Fácil", "Médio Fácil", "Médio", "Médio Difícil", "Difícil",
    "Muito Difícil", "Extremo", "Super Extremo", "Insano", "Lendário"
  ];

  stageTitle.textContent = `Fase ${level + 1}: ${fases[level]}`;
  levelDisplay.textContent = level + 1;
}

function updateRankingDisplay(){
  const rankingKey = `picoPicoRankingFase${level+1}`;
  let ranking = JSON.parse(localStorage.getItem(rankingKey)) || [];

  rankingList.innerHTML = "";
  if(ranking.length === 0){
    rankingList.innerHTML = "<li>Ninguém ainda nesta fase.</li>";
    return;
  }

  ranking.forEach((entry) => {
    let li = document.createElement("li");
    li.textContent = `${entry.nome} - ${entry.pontuacao} pontos`;
    rankingList.appendChild(li);
  });
}

function saveRanking(nome, pontuacao){
  const rankingKey = `picoPicoRankingFase${level+1}`;
  let ranking = JSON.parse(localStorage.getItem(rankingKey)) || [];

  ranking.push({ nome, pontuacao });
  ranking.sort((a,b) => b.pontuacao - a.pontuacao);
  if(ranking.length > 10) ranking = ranking.slice(0,10);

  localStorage.setItem(rankingKey, JSON.stringify(ranking));
  updateRankingDisplay();
}

function renderBoard(){
  gameBoard.innerHTML = "";
  cardsArray.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.dataset.id = card.id;
    cardDiv.dataset.emoji = card.emoji;
    cardDiv.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="carapicopico.png" alt="Pico-Pico" />
        </div>
        <div class="card-back">
          <span class="emoji">${card.emoji}</span>
        </div>
      </div>
    `;
    cardDiv.addEventListener("click", onCardClick);
    gameBoard.appendChild(cardDiv);
  });

  const pares = emojisPorFase[level].length;
  if(pares <= 4) gameBoard.style.gridTemplateColumns = "repeat(4, 1fr)";
  else if(pares <= 6) gameBoard.style.gridTemplateColumns = "repeat(4, 1fr)";
  else if(pares <= 8) gameBoard.style.gridTemplateColumns = "repeat(4, 1fr)";
  else if(pares <= 10) gameBoard.style.gridTemplateColumns = "repeat(5, 1fr)";
  else gameBoard.style.gridTemplateColumns = "repeat(6, 1fr)";
}

function onCardClick(e){
  if(lockBoard) return;
  const card = e.currentTarget;
  if(card === firstCard || card.classList.contains("matched") || card.classList.contains("flip")) return;

  flipCard(card);

  if(!firstCard){
    firstCard = card;
  } else {
    secondCard = card;
    lockBoard = true;
    moves++;
    movesCounter.textContent = moves;
    checkForMatch();
  }
}

function flipCard(card){
  card.classList.add("flip");
}

function unflipCards(){
  setTimeout(() => {
    firstCard.classList.remove("flip");
    secondCard.classList.remove("flip");
    resetBoard();
  }, 1000);
}

function resetBoard(){
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function checkForMatch(){
  if(firstCard.dataset.emoji === secondCard.dataset.emoji){
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchedPairs++;
    score += 10;
    scoreCounter.textContent = score;
    soundMatch.play();
    updateStars();
    resetBoard();

    if(matchedPairs === emojisPorFase[level].length){
      endPhase(true);
    }
  } else {
    soundError.play();
    unflipCards();
  }
}

function endPhase(vitoria){
  stopTimer();
  lockBoard = true;

  if(vitoria){
    soundWin.play();
    alert(`Parabéns! Concluíste a fase ${level + 1}.`);

    let nome = prompt("Indica o teu nome para o ranking (max 10 caracteres):", "Jogador");
    if(nome) nome = nome.trim().substring(0,10);
    else nome = "Anon";

    saveRanking(nome, score);

    nextBtn.classList.remove("hidden");
    shareBtn.classList.remove("hidden");
    rankingDiv.classList.remove("hidden");
    restartBtn.classList.add("hidden");
  } else {
    alert("Tenta novamente!");
    restartBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");
    shareBtn.classList.add("hidden");
  }
}

function startPhase(phaseNumber){
  level = phaseNumber;
  moves = 0;
  score = 0;
  matchedPairs = 0;
  movesCounter.textContent = moves;
  scoreCounter.textContent = score;
  lockBoard = false;
  firstCard = null;
  secondCard = null;

  updateStageTitle();
  starsContainer.textContent = "";
  rankingDiv.classList.add("hidden");
  restartBtn.classList.remove("hidden");
  nextBtn.classList.add("hidden");
  shareBtn.classList.add("hidden");

  cardsArray = createCardsForPhase(level);
  renderBoard();
  startTimer(tempoPorFase[level]);

  updateRankingDisplay();
}

function resetGame(){
  level = 0;
  startPhase(level);
  rankingDiv.classList.add("hidden");
  restartBtn.classList.remove("hidden");
  nextBtn.classList.add("hidden");
  shareBtn.classList.add("hidden");
}

window.onload = () => {
  resetGame();
};
