const emojisPorFase = [
  ["🍎", "🍌", "🍇", "🍉"],
  ["🐶", "🐱", "🐭", "🐰", "🐼", "🦊"],
  ["🌸", "🌻", "🌼", "🌹", "🌷", "🐣", "🍀", "🍁"],
  ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🥏", "🎱", "🎓", "🏉"],
  ["🚌", "🚓", "🚑", "🚒", "🚜", "🚀", "🚁", "✈️", "🚂", "🚗"],
  ["🍕", "🍔", "🍟", "🌭", "🍿", "🥪", "🥞", "🧁", "🍰", "🍩"],
  ["🎵", "🎸", "🎻", "🥁", "🎷", "🎺", "🔔", "🎤", "🎧", "📯"],
  ["🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳"],
  ["🧃", "🥤", "🍺", "🍷", "🥂", "🍾", "🥃", "🍸", "🍹", "☕"],
  ["👻", "🤖", "🎃", "😺", "🐵", "🐔", "🦄", "🐲", "🦕", "🐉"]
];

let faseAtual = 0;
let cartasSelecionadas = [];
let cartasViradas = 0;
let jogadas = 0;
let score = 0;
let tempo = 0;
let timer;
let tempoMaximo;

const personagemImagem = "carapicopico.png";

const board = document.getElementById("game-board");
const stageTitle = document.getElementById("stage-title");
const movesSpan = document.getElementById("moves");
const scoreSpan = document.getElementById("score");
const levelSpan = document.getElementById("level");
const timerSpan = document.getElementById("timer");
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
const starsContainer = document.getElementById("stars-container");

let musicaTocando = false;

toggleMusicBtn.addEventListener("click", () => {
  musicaTocando = !musicaTocando;
  toggleMusicBtn.textContent = musicaTocando ? "🔊 Música Ligada" : "🔇 Música Desligada";
  musicaTocando ? bgMusic.play() : bgMusic.pause();
});

document.addEventListener("click", () => {
  if (!musicaTocando) {
    bgMusic.play();
    musicaTocando = true;
    toggleMusicBtn.textContent = "🔊 Música Ligada";
  }
}, { once: true });

function iniciarJogo() {
  cartasSelecionadas = [];
  cartasViradas = 0;
  jogadas = 0;
  tempoMaximo = 60 + faseAtual * 30;
  tempo = tempoMaximo;

  movesSpan.textContent = 0;
  scoreSpan.textContent = score;
  timerSpan.textContent = formatarTempo(tempoMaximo);
  atualizarTituloFase();
  gerarCartas();
  iniciarTimer();
  rankingEl.classList.add("hidden");
  shareBtn.classList.add("hidden");
  endModal.classList.add("hidden");
}

function iniciarTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    tempo--;
    timerSpan.textContent = formatarTempo(tempo);
    if (tempo <= 0) {
      clearInterval(timer);
      alert("Tempo esgotado! Tente novamente.");
      mostrarModalFim(false);
    }
  }, 1000);
}

function formatarTempo(s) {
  const min = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
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

  const img = document.createElement("img");
  img.src = personagemImagem;
  img.alt = "Personagem";
  img.className = "character-image";

  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = emoji;
  emojiSpan.className = "emoji";
  emojiSpan.style.visibility = "hidden";

  carta.appendChild(img);
  carta.appendChild(emojiSpan);
  carta.addEventListener("click", virarCarta);

  return carta;
}

function gerarCartas() {
  board.innerHTML = "";
  const emojis = [...emojisPorFase[faseAtual]];
  const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  cartas.forEach(emoji => board.appendChild(criarCarta(emoji)));
}

function virarCarta() {
  if (cartasSelecionadas.length === 2 || this.classList.contains("flip")) return;

  this.classList.add("flip");
  this.querySelector("img").style.display = "none";
  this.querySelector(".emoji").style.visibility = "visible";

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

function calcularPontuacao() {
  const base = 1000;
  const eficiencia = Math.max(1, (emojisPorFase[faseAtual].length * 2) / jogadas);
  const tempoFactor = Math.max(1, tempoMaximo / (tempoMaximo - tempo || 1));
  return Math.round(base * eficiencia * tempoFactor);
}

function calcularEstrelas() {
  const maxScorePorFase = 1500; // Ajusta conforme necessário
  const percentual = score / maxScorePorFase;

  if (percentual >= 0.8) return 3;
  else if (percentual >= 0.5) return 2;
  else return 1;
}

function mostrarEstrelas() {
  starsContainer.innerHTML = "";
  const n = calcularEstrelas();
  for (let i = 0; i < n; i++) {
    const star = document.createElement("span");
    star.textContent = "⭐";
    starsContainer.appendChild(star);
  }
}

function mostrarModalFim(venceu) {
  clearInterval(timer);
  endModal.classList.remove("hidden");
  rankingEl.classList.remove("hidden");
  shareBtn.classList.toggle("hidden", !venceu);
  mostrarEstrelas();
}

function guardarPontuacao() {
  const nome = playerNameInput.value.trim();
  if (!nome) {
    alert("Por favor, insira um nome!");
    return false;
  }

  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  dados.push({ nome, score, nivel: faseAtual + 1, tempo: tempoMaximo - tempo });
  dados.sort((a, b) => b.score - a.score);
  localStorage.setItem("rankingPicoPico", JSON.stringify(dados.slice(0, 10)));

  mostrarRanking();

  gerarImagemPartilha(); // Atualiza imagem antes de fechar modal

  endModal.classList.add("hidden");

  if (cartasViradas === emojisPorFase[faseAtual].length * 2) {
    faseAtual++;
    if (faseAtual >= emojisPorFase.length) {
      alert("🏆 És o Campeão do Jogo! 🌟 Recebeste o tesouro final! 💼");
      faseAtual = 0;
      score = 0;
    }
  }

  iniciarJogo();

  return true;
}

function mostrarRanking() {
  const dados = JSON.parse(localStorage.getItem("rankingPicoPico") || "[]");
  rankingList.innerHTML = dados.length ? "" : "<li>Nenhuma pontuação ainda</li>";
  dados.forEach(({ nome, score, nivel, tempo }) => {
    const li = document.createElement("li");
    li.textContent = `${nome} - Pontos: ${score} | Fase: ${nivel} | Tempo: ${formatarTempo(tempo)}`;
    rankingList.appendChild(li);
  });
}

function gerarImagemPartilha() {
  const ctx = canvas.getContext("2d");
  const largura = canvas.width;
  const altura = canvas.height;

  ctx.clearRect(0, 0, largura, altura);

  // Fundo amarelo
  ctx.fillStyle = "#ffc107";
  ctx.fillRect(0, 0, largura, altura);

  // Desenha personagem (pode substituir com imagem carregada)
  const personagem = new Image();
  personagem.src = personagemImagem;
  personagem.onload = () => {
    ctx.drawImage(personagem, 20, 20, 120, 120);

    // Texto
    ctx.fillStyle = "#000";
    ctx.font = "bold 28px Arial";
    ctx.fillText("Desafio Pico-Pico", 160, 60);

    ctx.font = "24px Arial";
    ctx.fillText(`Pontuação: ${score}`, 160, 100);
    ctx.fillText(`Fase: ${faseAtual + 1}`, 160, 140);

    // Para facilitar partilha, transformamos canvas em imagem
    const dataURL = canvas.toDataURL("image/png");
    shareBtn.href = dataURL;
  };

  // Caso personagem não carregue rápido, desenha o texto mesmo assim
  setTimeout(() => {
    if (!personagem.complete) {
      ctx.fillStyle = "#000";
      ctx.font = "bold 28px Arial";
      ctx.fillText("Desafio Pico-Pico", 160, 60);
      ctx.font = "24px Arial";
      ctx.fillText(`Pontuação: ${score}`, 160, 100);
      ctx.fillText(`Fase: ${faseAtual + 1}`, 160, 140);
    }
  }, 500);
}

shareBtn.addEventListener("click", (e) => {
  if (!shareBtn.href) {
    e.preventDefault();
    alert("A imagem ainda não está pronta para partilha. Tente de novo.");
  }
});

playerNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    guardarPontuacao();
  }
});

iniciarJogo();
mostrarRanking();
