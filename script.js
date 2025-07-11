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
const starsContainer = document.getElementById("stars-container");
const restartBtn = document.getElementById("restart-button");
const nextBtn = document.getElementById("next-button");
const shareBtn = document.getElementById("share-button");
const modal = document.getElementById("modal");
const modalScore = document.getElementById("modal-score");
const modalStars = document.getElementById("modal-stars");
const playerNameInput = document.getElementById("player-name");
const saveScoreBtn = document.getElementById("save-score-btn");
const bgMusic = document.getElementById("bg-music");
const toggleMusicBtn = document.getElementById("toggle-music-btn");

function startGame() {
  resetVariables();
  createCardsForLevel(level);
  shuffle(cardsArray);
  renderBoard();
  startTimer(tempoPorFase[level]);
  updateInfoDisplay();
  nextBtn.classList.add("hidden");
  shareBtn.classList.add("hidden");
  modal.classList.remove("show");
}

function resetVariables() {
  cardsArray = [];
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  moves = 0;
  score = 0;
  clearInterval(timerInterval);
  timeLeft = 0;
  playerNameInput.value = "";
}

function createCardsForLevel(lvl) {
  const emojis = emojisPorFase[lvl].slice(0); // copia
  const pairsCount = emojis.length;
  cardsArray = [];

  for (let i = 0; i < pairsCount; i++) {
    // Cada emoji em 2 cartas (par)
    cardsArray.push({ id: i * 2, emoji: emojis[i], matched: false });
    cardsArray.push({ id: i * 2 + 1, emoji: emojis[i], matched: false });
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderBoard() {
  gameBoard.innerHTML = "";
  const pairsCount = cardsArray.length / 2;
  // Definir colunas para manter boas proporções (aprox quadrado)
  let cols = Math.ceil(Math.sqrt(cardsArray.length));
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  cardsArray.forEach((card, idx) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.dataset.index = idx;
    cardElement.innerHTML = `<div class="emoji">${card.emoji}</div>`;
    cardElement.addEventListener("click", flipCard);
    gameBoard.appendChild(cardElement);
  });
}

function flipCard(e) {
  if (lockBoard) return;

  const clicked = e.currentTarget;
  const idx = clicked.dataset.index;
  if (cardsArray[idx].matched) return;
  if (clicked === firstCard) return;

  clicked.classList.add("flip");

  if (!firstCard) {
    firstCard = clicked;
    return;
  }

  secondCard = clicked;
  lockBoard = true;
  moves++;
  movesCounter.textContent = moves;

  checkForMatch();
}

function checkForMatch() {
  const firstIdx = firstCard.dataset.index;
  const secondIdx = secondCard.dataset.index;

  if (cardsArray[firstIdx].emoji === cardsArray[secondIdx].emoji) {
    // Match found
    cardsArray[firstIdx].matched = true;
    cardsArray[secondIdx].matched = true;
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    matchedPairs++;
    score += 10;
    scoreCounter.textContent = score;

    resetFlip();
    checkIfLevelComplete();
  } else {
    // Not a match, flip back after delay
    score = Math.max(0, score - 2);
    scoreCounter.textContent = score;

    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      resetFlip();
    }, 1000);
  }
}

function resetFlip() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function checkIfLevelComplete() {
  if (matchedPairs === cardsArray.length / 2) {
    clearInterval(timerInterval);
    showEndModal();
  }
}

function startTimer(seconds) {
  timeLeft = seconds;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      lockBoard = true;
      showEndModal();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const sec = (timeLeft % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${min}:${sec}`;
}

function updateInfoDisplay() {
  levelDisplay.textContent = level + 1;
  movesCounter.textContent = moves;
  scoreCounter.textContent = score;
  updateStars();
}

function updateStars() {
  // Baseado na pontuação (exemplo: 30+ = 3 estrelas, 20+ = 2, else 1)
  let starsCount = 1;
  if (score >= 30) starsCount = 3;
  else if (score >= 20) starsCount = 2;
  else starsCount = 1;

  starsContainer.textContent = "⭐".repeat(starsCount);
  return starsCount;
}

function showEndModal() {
  modalScore.textContent = score;
  const starsCount = updateStars();
  modalStars.textContent = "⭐".repeat(starsCount);
  modal.classList.add("show");

  nextBtn.classList.remove("hidden");
  shareBtn.classList.remove("hidden");
}

restartBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  level = 0;
  startGame();
});

nextBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  if (level < emojisPorFase.length - 1) {
    level++;
    startGame();
  } else {
    alert("Parabéns! Concluíste todas as fases.");
  }
});

saveScoreBtn.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  if (playerName === "") {
    alert("Por favor, insere o teu nome antes de guardar.");
    playerNameInput.focus();
    return;
  }
  saveScore(playerName, score, level);
  alert(`Pontuação guardada para ${playerName}!`);
  modal.classList.remove("show");
});

function saveScore(name, points, lvl) {
  // Exemplo simples com localStorage
  let rankings = JSON.parse(localStorage.getItem("rankingPicoPico")) || [];
  rankings.push({ name, points, level: lvl + 1, date: new Date().toISOString() });
  rankings.sort((a, b) => b.points - a.points);
  rankings = rankings.slice(0, 10); // top 10
  localStorage.setItem("rankingPicoPico", JSON.stringify(rankings));
}

toggleMusicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusicBtn.textContent = "🔊 Música Ligada";
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = "🔇 Música Desligada";
  }
});

// Começa jogo automaticamente
startGame();
