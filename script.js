const emojisPorFase = [
  ["🍎", "🍌", "🍇", "🍉"], // Fase 1 - 4 pares
  ["🐶", "🐱", "🐭", "🐰", "🐼", "🦊"], // Fase 2 - 6 pares
  ["🌸", "🌻", "🌼", "🌹", "🌷", "🪻", "🍀", "🍁"], // Fase 3 - 8 pares
  ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🥏", "🎱", "🏓", "🏸"], // Fase 4 - 10 pares
  ["👑", "💎", "🏆", "🎖️", "🎉", "🎁", "💰", "🪙", "💵", "🗝️"] // Fase final - 10 pares (Tesouro)
];

let faseAtual = 0;
let cartasSelecionadas = [];
let cartasViradas = 0;
let jogadas = 0;
let score = 0;
let tempo = 0;
let tempoMaximo = 0;
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

const soundMatch = document.getElementById("sound-match");
const soundError = document.getElementById("sound-error");
const soundWin = document.getElementById("sound-win");
const bgMusic = document.getElementById("bg-music");
const toggleMusicBtn = document.getElementById("toggle-music-btn");

const endModal = document.getElementById("endModal");
const playerNameInput = document.getElementById("playerName");

let musicaTocando = false;

toggleMusicBtn.addEventListener("click", () => {
  musicaTocando ? bgMusic.pause() : bgMusic.play().catch(() => {});
  musicaTocando = !musicaTocando;
  toggleMusicBtn.textContent = musicaTocando ? "🔊 Música Ligada" : "🔇 Música Desligada";
});

document.addEventListener("click", () => {
  if (!musicaTocando) {
    bgMusic.play().then(() => {
      musicaTocando = true;
      toggleMusicBtn.textContent = "🔊 Música Ligada";
    }).catch(() => {});
  }
}, { once: true });

restartBtn.addEventListener("click", () => {
  faseAtual = 0;
  score = 0;
  iniciarJogo();
});

shareBtn.addEventListener("click", gerarImagemPartilha);
document.querySelector("#endModal button").addEventListener("click", guardarPontuacao);

function iniciarJogo() {
  cartasSelecionadas = [];
  cartasViradas = 0;
  jogadas = 0;
  movesSpan.textContent = 0;
  scoreSpan.textContent = score;
  definirTempoLimite();
  timerSpan.textContent = formatarTempo(tempoMaximo);
  atualizarTituloFase();
  gerarCartas();
  iniciarTimer();

  rankingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  shareBtn.classList.add("hidden");
  endModal.classList.add("hidden");
}

function definirTempoLimite() {
  const base = 60;
  tempoMaximo = base + faseAtual * 30;
  tempo = tempoMaximo;
}

function iniciarTimer() {
  clearInterval(timer);
  timerSpan.textContent = formatarTempo(tempo);

  timer = setInterval(() => {
    tempo--;
    timerSpan.textContent = formatarTempo(tempo);
    if (tempo <= 0) {
      clearInterval(timer);
      alert("⏱️ Tempo esgotado!");
      mostrarModalFim(false);
    }
  }, 1000);
}

function formatarTempo(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const sec = String(segundos % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function atualizarTituloFase() {
  const titulos = ["Fácil", "Médio", "Intermédio", "Difícil", "Final"];
  const faseNome = titulos[faseAtual] || `Fase ${faseAtual + 1}`;
  const total = emojisPorFase[faseAtual].length;
  stageTitle.innerHTML = `Fase ${faseAtual + 1}: ${faseNome}<br><small>${total * 2} cartas – Encontre ${total} pares</small>`;
  levelSpan.textContent = faseAtual + 1;
}

function gerarCartas() {
  board.innerHTML = "";
  const emojis = [...emojisPorFase[faseAtual]];
  const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

  cartas.forEach(emoji => {
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
    board.appendChild(carta);
  });
}

function virarCarta() {
  mostrarEstrelas(jogadas, emojisPorFase[faseAtual].length);
  if (cartasSelecionadas.length === 2 || this.classList.contains("flip")) return;

  this.classList.add("flip");
  const img = this.querySelector("img");
  const emoji = this.querySelector(".emoji");
  img.style.display = "none";
  emoji.style.visibility = "visible";

  cartasSelecionadas.push(this);

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
        score += calcularPontuacao();
        scoreSpan.textContent = score;
        mostrarModalFim(true);
      }
    } else {
      soundError.play();
      setTimeout(() => {
        c1.classList.remove("flip");
        c2.classList.remove("flip");
        c1.querySelector("img").style.display = "block";
        c2.querySelector("img").style.display = "block";
        c1.querySelector(".emoji").style.visibility = "hidden";
        c2.querySelector(".emoji").style.visibility = "hidden";
        cartasSelecionadas = [];
      }, 800);
    }
  }
}

function mostrarModalFim(venceu) {
  endModal.classList.remove("hidden");
  rankingEl.classList.remove("hidden");

  if (venceu) {
    nextBtn.classList.remove("hidden");
    shareBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.add("hidden");
    shareBtn.classList.add("hidden");
  }
}

function guardarPontuacao() {
  const nome = playerNameInput.value.trim();
  if (!nome) return alert("Insere um nome!");

  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  dados.push({ nome, score, nivel: faseAtual + 1, tempo: tempoMaximo - tempo });
  dados.sort((a, b) => b.score - a.score);
  localStorage.setItem("rankingPicoPico", JSON.stringify(dados.slice(0, 10)));

  endModal.classList.add("hidden");
  mostrarRanking();

  // Se for a última fase:
  if (faseAtual === emojisPorFase.length - 1) {
    setTimeout(() => {
      alert("🎉💰 ÉS O CAMPEÃO DO JOGO! 🏆");
      faseAtual = 0;
      score = 0;
      iniciarJogo();
    }, 100);
  } else {
    faseAtual++;
    iniciarJogo();
  }
}

function calcularPontuacao() {
  const base = 1000;
  const eficiencia = Math.max(1, (emojisPorFase[faseAtual].length * 2) / jogadas);
  const tempoFactor = Math.max(1, tempoMaximo / (tempoMaximo - tempo || 1));
  return Math.round(base * eficiencia * tempoFactor);
}

function mostrarRanking() {
  rankingList.innerHTML = "";
  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  dados.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `👤 ${item.nome} – 🎯 Nível ${item.nivel} – ${item.score} pts (${item.tempo}s)`;
    rankingList.appendChild(li);
  });
}

function gerarImagemPartilha() {
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 260;

  ctx.fillStyle = "#FFE59A";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff9900";
  ctx.font = "bold 22px 'Luckiest Guy', cursive";
  ctx.fillText("🐥 Desafio Pico-Pico", 20, 40);

  ctx.font = "18px 'Luckiest Guy', cursive";
  ctx.fillText(`🏆 Pontuação: ${score}`, 20, 80);
  ctx.fillText(`🎯 Nível: ${faseAtual + 1}`, 20, 110);
  ctx.fillText(`⏱️ Tempo: ${formatarTempo(tempoMaximo - tempo)}`, 20, 140);
  ctx.fillText(`📍 Jogadas: ${jogadas}`, 20, 170);

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "desafio-pico-pico.png";
  link.click();
}

function mostrarEstrelas(jogadasUsadas, pares) {
  const estrelasEl = document.getElementById("performance-stars");
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

iniciarJogo();
