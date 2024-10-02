// Mendapatkan elemen DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menuScreen');
const startBtn = document.getElementById('startBtn');
const shopBtn = document.getElementById('shopBtn'); // Placeholder untuk fungsi shop
const exitBtn = document.getElementById('exitBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseMenu = document.getElementById('pauseMenu');
const resumeBtn = document.getElementById('resumeBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const confirmationModal = document.getElementById('confirmationModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const finalHighScore = document.getElementById('finalHighScore');
const finalCoins = document.getElementById('finalCoins');
const restartBtn = document.getElementById('restartBtn');
const gameOverMenuBtn = document.getElementById('gameOverMenuBtn');

// Mengatur ukuran canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

// Menangani resize window
window.addEventListener('resize', resizeCanvas);

// Variabel game
let gravity = 0.8;
let jumpStrength = -15;
let playerVelY = 0;
let jumpCount = 0;
let maxJumps = 2;
let isGameOver = false;
let isPaused = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let coins = 0;

// Objek pemain
const player = {
  x: 100,
  y: canvas.height / 2,
  radius: 20,
  color: '#00ff00',
  collectRadius: 15 // untuk deteksi koleksi koin
};

// Array untuk jejak pemain
let trail = [];

// Array untuk platform
let platforms = [];
const platformWidth = 200;
const platformHeight = 20;
const gap = 150;
const platformSpeed = 3;

// Variabel koin
let currentCoin = null; // Hanya satu koin pada satu waktu
let coinSpawnTimer = null; // Timer untuk spawning koin
const coinSpawnInterval = 15000; // 15 detik dalam milidetik

// Fungsi untuk menghasilkan platform awal
function generateInitialPlatforms() {
  platforms = [];
  let initialX = 0;
  let yPosition = canvas.height - platformHeight - 100; // 100 piksel dari bawah

  for (let i = 0; i < 5; i++) {
    let platform = {
      x: initialX + (platformWidth + gap) * i,
      y: yPosition - Math.random() * 100,
      width: platformWidth,
      height: platformHeight
    };
    platforms.push(platform);
  }

  // Memulai timer spawning koin
  startCoinSpawnTimer();
}

// Fungsi untuk spawning koin pada platform acak
function spawnCoin() {
  if (currentCoin !== null) return; // Mencegah multiple koin

  if (platforms.length === 0) return;

  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];

  // Pastikan koin ditempatkan di dalam batas platform
  const coinX = randomPlatform.x + Math.random() * (randomPlatform.width - 40) + 20; // 20 padding
  const coinY = randomPlatform.y - 30; // 30 piksel di atas platform

  currentCoin = {
    x: coinX,
    y: coinY,
    radius: 10,
    color: '#FFD700', // Warna emas
    platform: randomPlatform // Referensi ke platform tempat koin ditempatkan
  };
}

// Fungsi untuk menjadwalkan spawning koin berikutnya
function startCoinSpawnTimer() {
  // Bersihkan timer yang ada
  if (coinSpawnTimer) {
    clearTimeout(coinSpawnTimer);
  }

  // Jadwalkan spawning koin berikutnya
  coinSpawnTimer = setTimeout(() => {
    spawnCoin();
    // Jadwalkan spawning berikutnya setelah interval saat ini
    startCoinSpawnTimer();
  }, coinSpawnInterval);
}

// Fungsi untuk membatalkan timer spawning koin (digunakan saat game berakhir atau di-restart)
function cancelCoinSpawnTimer() {
  if (coinSpawnTimer) {
    clearTimeout(coinSpawnTimer);
    coinSpawnTimer = null;
  }
}

// Fungsi untuk menggambar pemain
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}

// Fungsi untuk menggambar jejak pemain
function drawTrail() {
  trail.forEach((pos, index) => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, player.radius - (index * 2), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 0, ${1 - index * 0.1})`;
    ctx.fill();
    ctx.closePath();
  });
}

// Fungsi untuk menggambar platform
function drawPlatform(platform) {
  ctx.fillStyle = '#654321'; // Warna coklat
  ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}

// Fungsi untuk menggambar koin
function drawCoin(coin) {
  if (!coin) return;
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
  ctx.fillStyle = coin.color;
  ctx.fill();
  ctx.closePath();
}

// Fungsi untuk memperbarui posisi pemain
function updatePlayer() {
  playerVelY += gravity;
  player.y += playerVelY;

  // Memperbarui jejak
  trail.unshift({ x: player.x, y: player.y });
  if (trail.length > 10) trail.pop();

  // Deteksi tabrakan dengan platform
  platforms.forEach(platform => {
    if (
      player.x + player.radius > platform.x &&
      player.x - player.radius < platform.x + platform.width &&
      player.y + player.radius > platform.y &&
      player.y + player.radius < platform.y + platform.height &&
      playerVelY >= 0
    ) {
      player.y = platform.y - player.radius;
      playerVelY = 0;
      jumpCount = 0;
      score += 10; // Increment skor saat mendarat di platform

      // Cek jika koin ada di platform ini
      if (currentCoin && currentCoin.platform === platform) {
        coins += 1;
        currentCoin = null;
        // Anda dapat memanggil spawnCoin() di sini jika ingin segera memunculkan koin berikutnya
        // startCoinSpawnTimer();
      }
    }
  });

  // Deteksi tabrakan dengan koin
  if (currentCoin && isColliding(player, currentCoin)) {
    coins += 1;
    currentCoin = null;
    // Anda dapat memanggil spawnCoin() di sini jika ingin segera memunculkan koin berikutnya
    // startCoinSpawnTimer();
  }

  // Cek jika pemain jatuh di bawah layar
  if (player.y - player.radius > canvas.height) {
    isGameOver = true;
  }
}

// Fungsi untuk memeriksa apakah koin berada di platform tertentu
function isCoinOnPlatform(coin, platform) {
  return (
    coin.x > platform.x &&
    coin.x < platform.x + platform.width &&
    Math.abs(coin.y - platform.y) <= 10 // dalam 10 piksel secara vertikal
  );
}

// Fungsi untuk memeriksa tabrakan antara pemain dan koin
function isColliding(player, coin) {
  const dx = player.x - coin.x;
  const dy = player.y - coin.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (player.collectRadius + coin.radius);
}

// Event listener untuk mouse click dan touch pada layar
canvas.addEventListener('click', () => {
  jump(); // Pemain akan melompat saat klik mouse atau tap di layar
});

// Fungsi untuk melompat
function jump() {
  if (jumpCount < maxJumps) {
    playerVelY = jumpStrength;
    jumpCount++;
  }
}

// Event listener untuk keydown (Space untuk lompat)
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    jump();
  }
});

// Fungsi untuk memperbarui posisi platform
function updatePlatforms() {
  platforms.forEach(platform => {
    platform.x -= platformSpeed;

    // Jika platform keluar layar, posisikan kembali di sebelah kanan
    if (platform.x + platform.width < 0) {
      platform.x = canvas.width + gap;
      platform.y = canvas.height - platformHeight - Math.random() * 100;
    }
  });

  // Memperbarui posisi koin sesuai dengan platform
  if (currentCoin) {
    // Pastikan koin tetap di platformnya
    currentCoin.x = currentCoin.platform.x + (currentCoin.x - currentCoin.platform.x - 20); // 20 adalah padding awal
    currentCoin.y = currentCoin.platform.y - 30; // Tetap 30 piksel di atas platform
  }
}

// Fungsi untuk menggambar HUD (Skor dan Koin)
function drawHUD() {
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Coins: ${coins}`, 20, 60);
}

// Game loop
let animationId;

function gameLoop() {
  if (isGameOver) {
    endGame();
    return;
  }

  if (!isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updatePlatforms();

    drawTrail();
    drawPlayer();
    platforms.forEach(drawPlatform);
    drawCoin(currentCoin);
    drawHUD();
  }

  animationId = requestAnimationFrame(gameLoop);
}

// Fungsi untuk memulai game
function startGame() {
  menuScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  pauseMenu.style.display = 'none';
  confirmationModal.style.display = 'none';
  canvas.style.display = 'block';
  pauseBtn.style.display = 'block';

  // Reset variabel game
  isGameOver = false;
  isPaused = false;
  score = 0;
  coins = 0;
  player.y = canvas.height / 2;
  playerVelY = 0;
  jumpCount = 0;
  trail = [];
  generateInitialPlatforms();

  gameLoop();
}

// Fungsi untuk merestart game
function restartGame() {
  // Reset variabel
  isGameOver = false;
  isPaused = false;
  score = 0;
  coins = 0;
  player.y = canvas.height / 2;
  playerVelY = 0;
  jumpCount = 0;
  trail = [];
  generateInitialPlatforms();

  gameOverScreen.style.display = 'none';
  canvas.style.display = 'block';
  pauseBtn.style.display = 'block';

  gameLoop();
}

// Fungsi untuk mengakhiri game
function endGame() {
  cancelAnimationFrame(animationId);
  canvas.style.display = 'none';
  pauseBtn.style.display = 'none';
  gameOverScreen.style.display = 'block';

  // Memperbarui high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }

  // Menampilkan skor akhir
  finalScore.textContent = `Score: ${score}`;
  finalHighScore.textContent = `High Score: ${highScore}`;
  finalCoins.textContent = `Coins: ${coins}`;

  // Membatalkan timer spawning koin
  cancelCoinSpawnTimer();
}

// Fungsi untuk menjeda game
function pauseGame() {
  isPaused = true;
  pauseMenu.style.display = 'block';
}

// Fungsi untuk melanjutkan game
function resumeGame() {
  isPaused = false;
  pauseMenu.style.display = 'none';
}

// Fungsi untuk menampilkan modal konfirmasi
function showConfirmationModal() {
  confirmationModal.style.display = 'block';
}

// Fungsi untuk menyembunyikan modal konfirmasi
function hideConfirmationModal() {
  confirmationModal.style.display = 'none';
}

// Fungsi untuk kembali ke menu utama
function goBackToMenu() {
  isGameOver = true; // Menghentikan game loop
  menuScreen.style.display = 'block';
  gameOverScreen.style.display = 'none';
  pauseMenu.style.display = 'none';
  confirmationModal.style.display = 'none';
  canvas.style.display = 'none';
  pauseBtn.style.display = 'none';
}

// Event listeners untuk tombol

// Tombol Start
startBtn.addEventListener('click', () => {
  startGame();
});

// Tombol Shop (placeholder)
shopBtn.addEventListener('click', () => {
  alert('Fungsi shop belum diimplementasikan.');
});

// Tombol Exit
exitBtn.addEventListener('click', () => {
  // Mencoba menutup window (mungkin tidak berfungsi di semua browser)
  window.close();
});

// Tombol Pause
pauseBtn.addEventListener('click', () => {
  pauseGame();
});

// Tombol Resume
resumeBtn.addEventListener('click', () => {
  resumeGame();
});

// Tombol Kembali ke Menu di Pause Menu
backToMenuBtn.addEventListener('click', () => {
  showConfirmationModal();
});

// Tombol Yes di Modal Konfirmasi
confirmYesBtn.addEventListener('click', () => {
  hideConfirmationModal();
  goBackToMenu();
});

// Tombol No di Modal Konfirmasi
confirmNoBtn.addEventListener('click', () => {
  hideConfirmationModal();
});

// Tombol Restart di Game Over Screen
restartBtn.addEventListener('click', () => {
  restartGame();
});

// Tombol Kembali ke Menu di Game Over Screen
gameOverMenuBtn.addEventListener('click', () => {
  goBackToMenu();
});

// Inisialisasi game untuk menampilkan menu utama
function initialize() {
  menuScreen.style.display = 'block';
  canvas.style.display = 'none';
  pauseBtn.style.display = 'none';
  pauseMenu.style.display = 'none';
  confirmationModal.style.display = 'none';
  gameOverScreen.style.display = 'none';
}

initialize();
