const emojisPorFase = [
  ["🍎", "🍌", "🍇", "🍉"],                           // 4 pares
  ["🐶", "🐱", "🐭", "🐰", "🐼", "🦊"],               // 6 pares
  ["🌸", "🌻", "🌼", "🌹", "🌷", "🪻", "🍀", "🍁"],     // 8 pares
  ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🥏", "🎱", "🏓", "🏸"],
  ["🚌", "🚓", "🚑", "🚒", "🚜", "🚀", "🚁", "✈️", "🚂", "🚗"],
  ["🍕", "🍔", "🍟", "🌭", "🍿", "🥪", "🥞", "🧁", "🍰", "🍩"],
  ["🎵", "🎸", "🎻", "🥁", "🎷", "🎺", "🪗", "🎤", "🎧", "📯"],
  ["🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳"],
  ["🧃", "🥤", "🍺", "🍷", "🥂", "🍾", "🥃", "🍸", "🍹", "🧋"],
  ["👻", "🤖", "🎃", "😺", "🐵", "🐔", "🦄", "🐲", "🦕", "🐉"]
];

let faseAtual = 0;
let cartasSelecionadas = [];
let cartasViradas = 0;
let jogadas = 0;
let score = 0;
let tempo = 0;
let timer;

const personagemImagem = "carapicopico.png";

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
const estrelasEl = document.getElementById("performance-stars");
const endModal = document.getElementById("endModal");

const soundMatch = document.getElementById("sound-match");
const soundError = document.getElementById("sound-error");
const soundWin = document.getElementById("sound-win");
const bgMusic = document.getElementById("bg-music");
const endTheme = document.getElementById("end-theme");
const toggleMusicBtn = document.getElementById("toggle-music-btn");
let musicaTocando = false;

toggleMusicBtn.addEventListener("click", () => {
  if (musicaTocando) {
    bgMusic.pause();
    toggleMusicBtn.textContent = "🔇 Música Desligada";
    musicaTocando = false;
  } else {
    bgMusic.play().catch(() => {});
    toggleMusicBtn.textContent = "🔊 Música Ligada";
    musicaTocando = true;
  }
});

function iniciarJogo() {
  if (!musicaTocando) {
    bgMusic.play().then(() => {
      musicaTocando = true;
      toggleMusicBtn.textContent = "🔊 Música Ligada";
    }).catch(() => {});
  }

  cartasSelecionadas = [];
  cartasViradas = 0;
  jogadas = 0;
  tempo = 0;
  movesSpan.textContent = 0;
  timerSpan.textContent = "00:00";
  scoreSpan.textContent = score;
  estrelasEl.innerHTML = "";
  atualizarTituloFase();
  iniciarTimer();
  gerarCartas();
  rankingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  shareBtn.classList.add("hidden");
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

function criarCarta(emoji) {
  const carta = document.createElement("div");
  carta.className = "card";
  carta.dataset.emoji = emoji;

  const imagem = document.createElement("img");
  imagem.src = personagemImagem;
  imagem.alt = "Personagem";
  imagem.className = "character-image";

  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = emoji;
  emojiSpan.className = "emoji";
  emojiSpan.style.visibility = "hidden";

  carta.appendChild(imagem);
  carta.appendChild(emojiSpan);
  carta.addEventListener("click", virarCarta);
  return carta;
}

function gerarCartas() {
  board.innerHTML = "";
  const emojis = [...emojisPorFase[faseAtual]];
  const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  cartas.forEach(emoji => {
    board.appendChild(criarCarta(emoji));
  });
}

function virarCarta() {
  if (cartasSelecionadas.length === 2 || this.classList.contains("flip")) return;

  this.classList.add("flip");
  const img = this.querySelector("img");
  const emojiSpan = this.querySelector(".emoji");

  if (img) img.style.display = "none";
  if (emojiSpan) emojiSpan.style.visibility = "visible";

  cartasSelecionadas.push(this);

  if (cartasSelecionadas.length === 2) {
    jogadas++;
    movesSpan.textContent = jogadas;
    mostrarEstrelas(jogadas, emojisPorFase[faseAtual].length);

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
        score += pontosGanhos;
        scoreSpan.textContent = score;
        salvarRanking();
        mostrarRanking();
        nextBtn.classList.remove("hidden");
        shareBtn.classList.remove("hidden");
      }
    } else {
      soundError.play();
      setTimeout(() => {
        c1.classList.remove("flip");
        c2.classList.remove("flip");

        if (c1.querySelector("img")) c1.querySelector("img").style.display = "block";
        if (c2.querySelector("img")) c2.querySelector("img").style.display = "block";

        if (c1.querySelector(".emoji")) c1.querySelector(".emoji").style.visibility = "hidden";
        if (c2.querySelector(".emoji")) c2.querySelector(".emoji").style.visibility = "hidden";

        cartasSelecionadas = [];
      }, 800);
    }
  }
}

function calcularPontuacao() {
  const base = 1000;
  const eficiencia = Math.max(1, (emojisPorFase[faseAtual].length * 2) / jogadas);
  const tempoFactor = Math.max(1, 60 / (tempo || 1));
  return Math.round(base * eficiencia * tempoFactor);
}

function mostrarEstrelas(jogadasUsadas, pares) {
  estrelasEl.innerHTML = "";
  const ratio = jogadasUsadas / pares;
  let estrelas = 1;

  if (ratio <= 2) estrelas = 3;
  else if (ratio <= 3) estrelas = 2;

  for (let i = 0; i < estrelas; i++) {
    const star = document.createElement("span");
    star.textContent = "⭐";
    estrelasEl.appendChild(star);
  }
}

function salvarRanking() {
  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  dados.push({ nome: "Anónimo", score, nivel: faseAtual + 1, tempo });
  dados.sort((a, b) => b.score - a.score);
  localStorage.setItem("rankingPicoPico", JSON.stringify(dados.slice(0, 10)));
}

function guardarPontuacao() {
  const nome = document.getElementById("playerName").value || "Anónimo";
  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");

  dados.push({ nome, score, nivel: faseAtual + 1, tempo });
  dados.sort((a, b) => b.score - a.score);
  localStorage.setItem("rankingPicoPico", JSON.stringify(dados.slice(0, 10)));

  endModal.classList.add("hidden");
  mostrarRanking();
}

function mostrarRanking() {
  rankingList.innerHTML = "";
  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  dados.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `👤 ${item.nome} – 🎯 Nível ${item.nivel} – ${item.score} pts (${item.tempo}s)`;
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
  ctx.font = "bold 22px 'Luckiest Guy', cursive";
  ctx.fillText("🐥 Desafio Pico-Pico", 20, 40);

  ctx.font = "18px 'Luckiest Guy', cursive";
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
  if (faseAtual >= emojisPorFase.length - 1) {
    endTheme.play();
    endModal.classList.remove("hidden");
    return;
  }
  faseAtual++;
  iniciarJogo();
});

restartBtn.addEventListener("click", () => {
  score = 0;
  faseAtual = 0;
  iniciarJogo();
});

shareBtn.addEventListener("click", gerarImagemPartilha);

iniciarJogo();
