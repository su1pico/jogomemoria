// Variáveis globais
const gameBoard = document.getElementById('game-board');
const movesCounter = document.getElementById('moves');
const scoreCounter = document.getElementById('score');
const timerElement = document.getElementById('timer');
const levelElement = document.getElementById('level');
const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
const shareButton = document.getElementById('share-button');
const musicToggle = document.getElementById('music-toggle');

const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');
const backgroundMusic = document.getElementById('background-music');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let timer;
let secondsElapsed = 0;
let level = 1;
let isMusicPlaying = false;

// Emojis para as cartas (mantém igual)
const emojis = [
  '🐥', '🦉', '🦜', '🦢', '🦆', '🦚', '🦃', '🦅', '🐦', '🐧',
  '🌵', '🌴', '🍀', '🌿', '🍁', '🍄', '🌸', '🌻', '🌺', '🌼',
];

// Inicia o jogo
function initGame() {
  level = 1;
  resetGame();
  setupLevel(level);
  updateLevelText();
  setupMusic();
}

// Configura o nível (nº de pares)
function setupLevel(level) {
  matchedPairs = 0;
  moves = 0;
  score = 0;
  secondsElapsed = 0;
  clearInterval(timer);

  movesCounter.textContent = moves;
  scoreCounter.textContent = score;
  timerElement.textContent = '00:00';
  levelElement.textContent = level;

  // Define número pares por nível
  let pairs;
  if(level === 1) pairs = 8;
  else if(level === 2) pairs = 12;
  else pairs = 16;

  // Pega os emojis só para o nível
  const selectedEmojis = emojis.slice(0, pairs);
  cards = shuffle([...selectedEmojis, ...selectedEmojis]);

  renderBoard(cards, pairs);
  startTimer();
  updateGameBoardClass(level);
  nextButton.classList.add('hidden');
  shareButton.classList.add('hidden');
}

// Renderiza o tabuleiro
function renderBoard(cards, pairs) {
  gameBoard.innerHTML = '';
  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.addEventListener('click', onCardClick);
    gameBoard.appendChild(card);
  });
}

// Ao clicar na carta
function onCardClick(e) {
  const card = e.currentTarget;
  if (
    flippedCards.length === 2 ||
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) return;

  flipCard(card);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesCounter.textContent = moves;

    if (flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji) {
      // Acertou par
      matchedPairs++;
      score += 10;
      scoreCounter.textContent = score;
      soundMatch.play();

      flippedCards.forEach(c => c.classList.add('matched'));
      flippedCards = [];

      if (matchedPairs === cards.length / 2) {
        // Ganhou o nível
        soundWin.play();
        clearInterval(timer);
        nextButton.classList.remove('hidden');
        shareButton.classList.remove('hidden');
      }
    } else {
      // Errou par
      soundError.play();
      setTimeout(() => {
        flippedCards.forEach(c => c.classList.remove('flipped'));
        flippedCards = [];
      }, 1000);
    }
  }
}

// Virar a carta (mostrar emoji)
function flipCard(card) {
  card.classList.add('flipped');
  card.textContent = card.dataset.emoji;
}

// Timer
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    secondsElapsed++;
    timerElement.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// Botão Próxima Fase
nextButton.addEventListener('click', () => {
  if(level < 3) {
    level++;
    setupLevel(level);
    updateLevelText();
  }
  nextButton.classList.add('hidden');
  shareButton.classList.add('hidden');
});

// Botão Reiniciar
restartButton.addEventListener('click', () => {
  setupLevel(level);
  updateLevelText();
  nextButton.classList.add('hidden');
  shareButton.classList.add('hidden');
});

// Atualiza texto do nível e classe para grid
function updateLevelText() {
  const stageTitle = document.getElementById('stage-title');
  const levelsText = {
    1: 'Fase 1: Fácil',
    2: 'Fase 2: Médio',
    3: 'Fase 3: Difícil'
  };
  stageTitle.textContent = levelsText[level] || 'Jogo da Memória';
  levelElement.textContent = level;
}

function updateGameBoardClass(level) {
  gameBoard.className = 'game-board'; // reset
  if(level === 1) gameBoard.classList.add('fase-1');
  else if(level === 2) gameBoard.classList.add('fase-2');
  else if(level === 3) gameBoard.classList.add('fase-3');
}

// Shuffle (embaralha array)
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// Música de fundo - setup
function setupMusic() {
  isMusicPlaying = false;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  musicToggle.textContent = '🔈'; // ícone desligado
}

// Toggle música
musicToggle.addEventListener('click', () => {
  if(isMusicPlaying) {
    backgroundMusic.pause();
    musicToggle.textContent = '🔈';
  } else {
    backgroundMusic.play();
    musicToggle.textContent = '🔊';
  }
  isMusicPlaying = !isMusicPlaying;
});

// Inicializa tudo
initGame();
