const emojisPorFase = [ 
  ["🍎", "🍌", "🍇", "🍉"],
  ["🐶", "🐱", "🐭", "🐰", "🐼", "🦊"],
  ["🌸", "🌻", "🌼", "🌹", "🌷", "🪻", "🍀", "🍁"]
];

let faseAtual = 0;
let cartasSelecionadas = [];
let cartasViradas = 0;
let jogadas = 0;
let score = 0;
let timer;
let tempo = 0;

const board = document.getElementById("game-board");
const stageTitle = document.getElementById("stage-title");
const movesSpan = document.getElementById("moves");
const scoreSpan = document.getElementById("score");
const levelSpan = document.getElementById("level");
const timerSpan = document.getElementById("timer");
const nextBtn = document.getElementById("next-button");
const restartBtn = document.getElementById("restart-button");
const rankingEl = document.getElementById("ranking");
const rankingList = document.getElementById("ranking-list");
const shareBtn = document.getElementById("share-button");
const canvas = document.getElementById("shareCanvas");

const soundMatch = document.getElementById("sound-match");
const soundError = document.getElementById("sound-error");
const soundWin = document.getElementById("sound-win");

function iniciarJogo() {
  cartasSelecionadas = [];
  cartasViradas = 0;
  jogadas = 0;
  movesSpan.textContent = jogadas;
  tempo = 0;
  timerSpan.textContent = "00:00";
  atualizarTituloFase();
  atualizarPontuacao(0);
  iniciarTimer();
  gerarCartas();
}

function iniciarTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    tempo++;
    timerSpan.textContent = formatarTempo(tempo);
  }, 1000);
}

function formatarTempo(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const sec = String(segundos % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function atualizarTituloFase() {
  const titulos = ["Fácil", "Médio", "Intermédio", "Difícil"];
  const emojis = emojisPorFase[faseAtual];
  stageTitle.innerHTML = `Fase ${faseAtual + 1}: ${titulos[faseAtual] || "Avançado"}<br><small>${emojis.length * 2} cartas – Encontre ${emojis.length} pares</small>`;
  levelSpan.textContent = faseAtual + 1;
}

function gerarCartas() {
  board.innerHTML = "";
  const emojis = [...emojisPorFase[faseAtual]];
  const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

  cartas.forEach((emoji, index) => {
    const carta = document.createElement("div");
    carta.className = "card";
    carta.dataset.emoji = emoji;
    carta.dataset.index = index;
    carta.addEventListener("click", virarCarta);

    // Define a capa da carta como imagem do Pico-Pico
    carta.innerHTML = `<img src="picopico-face.png" alt="Pico-Pico" class="card-cover">`;

    board.appendChild(carta);
  });
}

function virarCarta() {
  if (cartasSelecionadas.length === 2) return;
  const carta = this;
  if (carta.classList.contains("flipped")) return;

  carta.classList.add("flipped");

  // Esconde a capa (imagem) e mostra o emoji
  const capa = carta.querySelector(".card-cover");
  if (capa) capa.style.display = "none";

  carta.textContent = carta.dataset.emoji;
  cartasSelecionadas.push(carta);

  if (cartasSelecionadas.length === 2) {
    jogadas++;
    movesSpan.textContent = jogadas;
    const [c1, c2] = cartasSelecionadas;

    if (c1.dataset.emoji === c2.dataset.emoji) {
      soundMatch.play();
      c1.classList.add("matched");
      c2.classList.add("matched");
      cartasViradas += 2;
      cartasSelecionadas = [];

      if (cartasViradas === emojisPorFase[faseAtual].length * 2) {
        clearInterval(timer);
        soundWin.play();
        const pontosGanhos = calcularPontuacao();
        atualizarPontuacao(score + pontosGanhos);
        salvarRanking();
        mostrarRanking();
        nextBtn.classList.remove("hidden");
        shareBtn.classList.remove("hidden");
      }
    } else {
      soundError.play();
      setTimeout(() => {
        c1.classList.remove("flipped");
        c2.classList.remove("flipped");

        // Voltar a mostrar a capa (imagem)
        c1.innerHTML = `<img src="picopico-face.png" alt="Pico-Pico" class="card-cover">`;
        c2.innerHTML = `<img src="picopico-face.png" alt="Pico-Pico" class="card-cover">`;

        cartasSelecionadas = [];
      }, 800);
    }
  }
}

function calcularPontuacao() {
  const base = 1000;
  const eficiencia = Math.max(1, emojisPorFase[faseAtual].length * 2 / jogadas);
  const tempoFactor = Math.max(1, 60 / (tempo || 1));
  return Math.round(base * eficiencia * tempoFactor);
}

function atualizarPontuacao(novoScore) {
  score = novoScore;
  scoreSpan.textContent = score;
}

function salvarRanking() {
  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  dados.push({ score, nivel: faseAtual + 1, tempo });
  dados.sort((a, b) => b.score - a.score);
  localStorage.setItem("rankingPicoPico", JSON.stringify(dados.slice(0, 10)));
}

function mostrarRanking() {
  rankingList.innerHTML = "";
  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  dados.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = `🎯 Nível ${item.nivel} – ${item.score} pts (${item.tempo}s)`;
    rankingList.appendChild(li);
  });
  rankingEl.classList.remove("hidden");
}

function gerarImagemPartilha() {
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 260;

  ctx.fillStyle = "#FFE59A";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#333";
  ctx.font = "bold 22px 'Segoe UI', sans-serif";
  ctx.fillText("🐥 Desafio Pico-Pico", 20, 40);

  ctx.font = "18px 'Segoe UI', sans-serif";
  ctx.fillText(`🏆 Pontuação: ${score}`, 20, 80);
  ctx.fillText(`🎯 Nível: ${faseAtual + 1}`, 20, 110);
  ctx.fillText(`⏱️ Tempo: ${formatarTempo(tempo)}`, 20, 140);
  ctx.fillText(`📍 Jogadas: ${jogadas}`, 20, 170);

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "desafio-pico-pico.png";
  link.click();
}

nextBtn.addEventListener("click", () => {
  faseAtual++;
  if (faseAtual >= emojisPorFase.length) {
    alert("Parabéns! Completaste todas as fases!");
    faseAtual = 0;
    score = 0;
  }
  iniciarJogo();
  nextBtn.classList.add("hidden");
  shareBtn.classList.add("hidden");
});

restartBtn.addEventListener("click", () => {
  score = 0;
  faseAtual = 0;
  iniciarJogo();
  nextBtn.classList.add("hidden");
  shareBtn.classList.add("hidden");
});

shareBtn.addEventListener("click", gerarImagemPartilha);

// Início automático
iniciarJogo();
