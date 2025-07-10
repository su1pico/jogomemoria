let board = document.getElementById("board");
let levelDisplay = document.getElementById("level");
let scoreDisplay = document.getElementById("score");
let mistakesDisplay = document.getElementById("mistakes");
let timerDisplay = document.getElementById("timer");
let rankingList = document.getElementById("ranking-list");
let nextLevelBtn = document.getElementById("nextLevel");

let level = 1;
let score = 0;
let mistakes = 0;
let time = 0;
let timerInterval;
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 3;
let sonsAtivos = true;

const fases = [
  { pares: 3, titulo: "Fácil" },
  { pares: 4, titulo: "Iniciante" },
  { pares: 6, titulo: "Intermédio" },
  { pares: 8, titulo: "Avançado" },
  { pares: 10, titulo: "Mestre" }
];

const emojis = ["🍕", "🐱", "🚗", "🎮", "🎉", "🌈", "🔥", "⚽", "🍀", "🧠", "🐶", "🎧", "🧩", "📱", "🚀", "🥳"];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startGame() {
  clearInterval(timerInterval);
  time = 0;
  mistakes = 0;
  matchedPairs = 0;
  flippedCards = [];

  const fase = fases[level - 1] || fases[fases.length - 1];
  totalPairs = fase.pares;

  let cards = shuffle([...emojis].slice(0, totalPairs).flatMap(e => [e, e]));
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(totalPairs * 2))}, 1fr)`;

  cards.forEach((emoji, i) => {
    let card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.innerText = "❓";
    card.onclick = () => flipCard(card);
    board.appendChild(card);
  });

  updateUI();
  timerInterval = setInterval(() => {
    time++;
    timerDisplay.innerText = time + "s";
  }, 1000);
}

function flipCard(card) {
  if (flippedCards.length >= 2 || card.classList.contains("matched") || flippedCards.includes(card)) return;

  card.innerText = card.dataset.emoji;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    const [c1, c2] = flippedCards;
    if (c1.dataset.emoji === c2.dataset.emoji) {
      c1.classList.add("matched");
      c2.classList.add("matched");
      matchedPairs++;
      if (sonsAtivos) new Audio("https://www.soundjay.com/buttons/sounds/button-4.mp3").play();
      flippedCards = [];

      if (matchedPairs === totalPairs) {
        clearInterval(timerInterval);
        setTimeout(() => {
          const pontosFase = calcularPontuacao();
          score += pontosFase;
          updateRanking(score);
          alert(`Fase concluída! Ganhou ${pontosFase} pontos.`);
          level++;
          if (level > fases.length) {
            alert("Parabéns! Concluíste todas as fases!");
            level = 1;
            score = 0;
          }
          startGame();
        }, 800);
      }
    } else {
      if (sonsAtivos) new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3").play();
      mistakes++;
      mistakesDisplay.innerText = mistakes;
      setTimeout(() => {
        c1.innerText = "❓";
        c2.innerText = "❓";
        flippedCards = [];
      }, 800);
    }
  }
}

function calcularPontuacao() {
  let base = totalPairs * 100;
  let tempoBonus = Math.max(0, 500 - time * 5);
  let erroPenalty = mistakes * 20;
  return Math.max(0, base + tempoBonus - erroPenalty);
}

function updateUI() {
  levelDisplay.innerText = level;
  scoreDisplay.innerText = score;
  mistakesDisplay.innerText = mistakes;
  timerDisplay.innerText = "0s";
  renderRanking();
}

function updateRanking(novosPontos) {
  let ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
  const nome = prompt("Nome para o ranking:");
  ranking.push({ nome, pontos: novosPontos });
  ranking.sort((a, b) => b.pontos - a.pontos);
  localStorage.setItem("ranking", JSON.stringify(ranking.slice(0, 10)));
}

function renderRanking() {
  let ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
  rankingList.innerHTML = "";
  ranking.forEach(({ nome, pontos }) => {
    let li = document.createElement("li");
    li.innerText = `${nome}: ${pontos} pts`;
    rankingList.appendChild(li);
  });
}

startGame();
