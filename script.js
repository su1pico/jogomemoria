// Jogo da Memória Pico-Pico com fases, estrelas, sons e ranking

const emojisPorFase = [
  ['🐶', '🐱', '🐔', '🐾'], // 4 cartas (2 pares)
  ['🌿', '🐻', '🦜', '🐼', '🌿', '🐻'],
  ['🐺', '🐘', '🐷', '🐵', '🐺', '🐘', '🐷', '🐵'],
  // ... mais fases até 10
];

const tempoLimitePorFase = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

let faseAtual = 0;
let jogadas = 0;
let paresEncontrados = 0;
let tempoRestante = 0;
let intervaloTempo;
let primeiraCarta = null;
let bloqueio = false;
let ranking = [];

const gameBoard = document.getElementById("game-board");
const stageTitle = document.getElementById("stage-title");
const jogadasEl = document.getElementById("jogadas");
const tempoEl = document.getElementById("tempo");
const estrelasEl = document.getElementById("estrelas");
const rankingList = document.getElementById("ranking-list");
const avancarBtn = document.getElementById("next-btn");

const bgMusic = new Audio("musica.mp3");
const soundMatch = new Audio("acerto.mp3");
const soundError = new Audio("erro.mp3");
const soundWin = new Audio("vitoria.mp3");
bgMusic.loop = true;

function embaralhar(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function iniciarFase() {
  const fase = emojisPorFase[faseAtual];
  const embaralhado = embaralhar([...fase, ...fase]);
  gameBoard.innerHTML = "";
  jogadas = 0;
  paresEncontrados = 0;
  primeiraCarta = null;
  bloqueio = false;
  stageTitle.textContent = `Nível ${faseAtual + 1}`;
  jogadasEl.textContent = jogadas;
  estrelasEl.innerHTML = '';

  embaralhado.forEach((emoji) => {
    const carta = document.createElement("div");
    carta.className = "card";
    carta.dataset.valor = emoji;
    carta.style.backgroundImage = "url('carapicopico.png')";
    carta.addEventListener("click", virarCarta);
    gameBoard.appendChild(carta);
  });

  iniciarTempo();
}

function iniciarTempo() {
  tempoRestante = tempoLimitePorFase[faseAtual];
  tempoEl.textContent = tempoRestante + "s";
  clearInterval(intervaloTempo);
  intervaloTempo = setInterval(() => {
    tempoRestante--;
    tempoEl.textContent = tempoRestante + "s";
    if (tempoRestante <= 0) {
      clearInterval(intervaloTempo);
      alert("Tempo esgotado!");
      iniciarFase();
    }
  }, 1000);
}

function virarCarta() {
  if (bloqueio || this.classList.contains("flip")) return;
  this.classList.add("flip");
  this.style.backgroundImage = "none";
  this.textContent = this.dataset.valor;

  if (!primeiraCarta) {
    primeiraCarta = this;
    return;
  }

  jogadas++;
  jogadasEl.textContent = jogadas;
  bloqueio = true;

  if (this.dataset.valor === primeiraCarta.dataset.valor) {
    soundMatch.play();
    this.classList.add("matched");
    primeiraCarta.classList.add("matched");
    paresEncontrados++;
    primeiraCarta = null;
    bloqueio = false;

    if (paresEncontrados === emojisPorFase[faseAtual].length) {
      clearInterval(intervaloTempo);
      soundWin.play();
      mostrarEstrelas();
      avancarBtn.classList.remove("hidden");
      guardarRanking();
    }
  } else {
    soundError.play();
    setTimeout(() => {
      this.classList.remove("flip");
      this.textContent = "";
      this.style.backgroundImage = "url('carapicopico.png')";
      primeiraCarta.classList.remove("flip");
      primeiraCarta.textContent = "";
      primeiraCarta.style.backgroundImage = "url('carapicopico.png')";
      primeiraCarta = null;
      bloqueio = false;
    }, 1000);
  }
}

function mostrarEstrelas() {
  const max = emojisPorFase[faseAtual].length;
  let estrelas = 1;
  if (jogadas <= max + 2) estrelas = 3;
  else if (jogadas <= max * 1.5) estrelas = 2;

  for (let i = 0; i < estrelas; i++) {
    const star = document.createElement("span");
    star.textContent = "⭐";
    estrelasEl.appendChild(star);
  }
}

function guardarRanking() {
  const nome = prompt("Parabéns! Introduz o teu nome para o ranking:") || "Jogador";
  const item = `${nome} - Nível ${faseAtual + 1} - ${jogadas} jogadas`;
  ranking.unshift(item);
  if (ranking.length > 10) ranking.pop();
  rankingList.innerHTML = ranking.map((r) => `<li>${r}</li>`).join('');
}

function avancarFase() {
  avancarBtn.classList.add("hidden");
  faseAtual++;
  if (faseAtual >= emojisPorFase.length) {
    alert("Parabéns! Concluíste todos os níveis!");
    faseAtual = 0;
  }
  iniciarFase();
}

document.getElementById("toggle-music-btn").addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
});

document.getElementById("restart-btn").addEventListener("click", iniciarFase);
document.getElementById("next-btn").addEventListener("click", avancarFase);

iniciarFase();
