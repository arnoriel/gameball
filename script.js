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
const shopScreen = document.getElementById('shopScreen');
const shopCoins = document.getElementById('shopCoins');
const shopItems = document.querySelectorAll('.shopItem');
const backToMenuFromShopBtn = document.getElementById('backToMenuFromShopBtn');

window.onload = () => {
  const intro = document.getElementById('intro');
  const arnoriel = document.getElementById('arnoriel');
  const html5 = document.getElementById('html5');
  const javascript = document.getElementById('javascript');
  const chatgpt = document.getElementById('chatgpt');

  // Hide pause button and menu screen initially
  pauseBtn.style.display = 'none';
  menuScreen.style.display = 'none';

  // Helper function to handle fade-in and fade-out effects
  function fadeInOut(element, delayIn, delayOut) {
    setTimeout(() => {
      element.classList.add('fade-in');
    }, delayIn);

    setTimeout(() => {
      element.classList.remove('fade-in');
      element.classList.add('fade-out');
    }, delayOut);
  }

  // Sequence the fade-in/out effects for each intro
  fadeInOut(arnoriel, 0, 2000);            // Arnoriel: Fade-in at 0s, fade-out at 2s
  fadeInOut(html5, 3000, 5000);           // HTML5: Fade-in at 3s, fade-out at 5s
  fadeInOut(javascript, 6000, 8000);      // JavaScript: Fade-in at 6s, fade-out at 8s
  fadeInOut(chatgpt, 9000, 11000);        // ChatGPT: Fade-in at 9s, fade-out at 11s

  // Ensure the menu only shows after the entire intro sequence is finished
  setTimeout(() => {
    intro.style.display = 'none';          // Hide the intro screen
    menuScreen.style.display = 'block';    // Show the menu screen
  }, 12000); // Show menu after all intros (12 seconds)

  // Add event listener to show the pause button only after the game starts
  startBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';     // Hide menu screen
    pauseBtn.style.display = 'block';      // Show pause button after starting the game
    canvas.style.display = 'block';        // Show game canvas

    // Mulai game
    startGame();
  });
}

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

// Variabel untuk timer koin
let coinTimer = null;
const coinInterval = 40000; // 40 detik dalam milidetik
let coinRate = 1; // Jumlah koin yang ditambahkan setiap interval

// Ambil totalCoinsCollected dari localStorage atau set ke 0 jika belum ada
let totalCoinsCollected = parseInt(localStorage.getItem('totalCoinsCollected')) || 0;

// Objek pemain
const player = {
  x: 100,
  y: canvas.height / 2,
  radius: 20,
  color: '#00ff00',
  collectRadius: 15 // untuk deteksi koleksi koin (tidak lagi digunakan)
};

// Array untuk jejak pemain
let trail = [];

// Array untuk platform
let platforms = [];
const platformWidth = 200;
const platformHeight = 20;
const gap = 150;
const platformSpeed = 3;

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
    ctx.fillStyle = `rgba(0, 255, 0, ${1 - index * 0.1})`; // Perbaiki penggunaan backticks
    ctx.fill();
    ctx.closePath();
  });
}

// Fungsi untuk menggambar platform
function drawPlatform(platform) {
  ctx.fillStyle = '#654321'; // Warna coklat
  ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}

// Fungsi untuk memperbarui posisi pemain
function updatePlayer(deltaTime) {
  playerVelY += gravity * (deltaTime / 16); // Menyesuaikan gravity berdasarkan deltaTime
  player.y += playerVelY * (deltaTime / 16);

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
    }
  });

  // Cek jika pemain jatuh di bawah layar
  if (player.y - player.radius > canvas.height) {
    isGameOver = true;
  }
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
function updatePlatforms(deltaTime) {
  const adjustedSpeed = platformSpeed * (deltaTime / 16); // Menyesuaikan kecepatan platform

  platforms.forEach(platform => {
    platform.x -= adjustedSpeed;

    // Jika platform keluar layar, posisikan kembali di sebelah kanan
    if (platform.x + platform.width < 0) {
      platform.x = canvas.width + gap;
      platform.y = canvas.height - platformHeight - Math.random() * 100;
    }
  });
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
let lastTime = 0;

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  if (isGameOver) {
    endGame();
    return;
  }

  if (!isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer(deltaTime);
    updatePlatforms(deltaTime);

    drawTrail();
    drawPlayer();
    platforms.forEach(drawPlatform);
    drawHUD();
  }

  animationId = requestAnimationFrame(gameLoop);
}

// Fungsi untuk memulai timer koin setiap 40 detik
function startCoinTimer() {
  if (coinTimer !== null) return; // Prevent multiple timers

  coinTimer = setInterval(() => {
    coins += coinRate;
    totalCoinsCollected += coinRate;
    console.log(`${coinRate} coin(s) added via timer. Total coins: ${coins}`);
    localStorage.setItem('totalCoinsCollected', totalCoinsCollected);
    // Update HUD saat koin ditambahkan
    shopCoins.innerText = coins;
  }, coinInterval); // 40 detik
}

// Fungsi untuk menghentikan timer koin
function stopCoinTimer() {
  if (coinTimer !== null) {
    clearInterval(coinTimer);
    coinTimer = null;
  }
}

// Fungsi untuk menentukan coinRate berdasarkan totalCoinsCollected
function determineCoinRate() {
  // Contoh logika: Set coinRate berdasarkan totalCoinsCollected
  // Misalnya, setiap 10 koin, tambah 1 coinRate
  coinRate = Math.floor(totalCoinsCollected / 10) + 1;
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

  // Tentukan coinRate berdasarkan totalCoinsCollected
  determineCoinRate();
  console.log(`Coin Rate set to: ${coinRate}`);

  // Mulai timer koin
  startCoinTimer();

  // Reset time
  lastTime = 0;

  // Mulai game loop
  animationId = requestAnimationFrame(gameLoop);
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

  // Tentukan coinRate berdasarkan totalCoinsCollected
  determineCoinRate();
  console.log(`Coin Rate set to: ${coinRate}`);

  gameOverScreen.style.display = 'none';
  canvas.style.display = 'block';
  pauseBtn.style.display = 'block';

  // Mulai timer koin
  startCoinTimer();

  // Reset time
  lastTime = 0;

  // Mulai game loop
  animationId = requestAnimationFrame(gameLoop);
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

  // Memperbarui totalCoinsCollected
  localStorage.setItem('totalCoinsCollected', totalCoinsCollected);

  // Menampilkan skor akhir
  finalScore.textContent = `Score: ${score}`;
  finalHighScore.textContent = `High Score: ${highScore}`;
  finalCoins.textContent = `Coins: ${coins}`;

  // Menghentikan timer koin
  stopCoinTimer();
}

// Fungsi untuk menjeda game
function pauseGame() {
  isPaused = true;
  pauseMenu.style.display = 'block';
  // Menghentikan timer koin
  stopCoinTimer();
}

// Fungsi untuk melanjutkan game
function resumeGame() {
  isPaused = false;
  pauseMenu.style.display = 'none';
  // Melanjutkan timer koin
  startCoinTimer();
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

  // Menghentikan timer koin
  stopCoinTimer();
}

// Event listeners untuk tombol

// Tombol Shop
shopBtn.addEventListener('click', () => {
  menuScreen.style.display = 'none';     // Hide main menu
  shopScreen.style.display = 'block';    // Show shop screen
  shopCoins.innerText = coins;           // Display the current coins
  canvas.style.display = 'none';         // Sembunyikan game canvas saat di shop
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

// Tombol Back to Menu di Shop
backToMenuFromShopBtn.addEventListener('click', () => {
  shopScreen.style.display = 'none';     // Hide shop screen
  menuScreen.style.display = 'block';    // Show main menu
  canvas.style.display = 'none';         // Hide game canvas
  console.log('Back to menu from shop clicked.');
});

// Menambahkan Event Listeners pada Shop Items
shopItems.forEach(item => {
  const buyButton = item.querySelector('button');
  buyButton.addEventListener('click', () => {
    const itemType = item.getAttribute('data-item');
    handlePurchase(itemType);
  });
});

// Fungsi untuk handle pembelian item di shop
function handlePurchase(item) {
  console.log(`Attempting to purchase: ${item}`);
  let cost = 0;
  let successMessage = '';
  let failureMessage = 'Not enough coins!';

  if (item === 'jumpBoost') {
    cost = 5;
    if (coins >= cost) {
      coins -= cost;
      jumpStrength -= 5;  // Membuat loncatan lebih kuat
      successMessage = 'You purchased Jump Boost!';
      console.log(`Purchased Jump Boost. Remaining coins: ${coins}`);
    }
  } else if (item === 'extraLife') {
    cost = 10;
    if (coins >= cost) {
      coins -= cost;
      // Tambahkan logika extra life di sini
      successMessage = 'You purchased Extra Life!';
      console.log(`Purchased Extra Life. Remaining coins: ${coins}`);
    }
  } else {
    console.log(`Unknown item type: ${item}`);
    return;
  }

  if (successMessage) {
    alert(successMessage);
  } else {
    alert(failureMessage);
  }

  // Update displayed coin count setelah pembelian
  shopCoins.innerText = coins;
}

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
