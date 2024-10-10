// Mendapatkan elemen DOM 
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menuScreen');
const startBtn = document.getElementById('startBtn');
const shopBtn = document.getElementById('shopBtn'); // Tombol Shop
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
const cheatNotification = document.getElementById('cheatNotification');

// Definisikan Skins dan Trails yang Tersedia
const skins = [
  { id: 'default', name: 'Default', color: '#00ff00', cost: 0 }, // Skin default, gratis
  { id: 'red', name: 'Red', color: '#ff0000', cost: 10 },
  { id: 'blue', name: 'Blue', color: '#0000ff', cost: 15 },
  { id: 'yellow', name: 'Yellow', color: '#ffff00', cost: 20 },
  // Tambahkan lebih banyak skins sesuai kebutuhan
];

const trails = [
  { id: 'default', name: 'Default', color: '#00ff00', cost: 0 }, // Trail default, gratis
  { id: 'maroon', name: 'Maroon', color: '#620000', cost: 5 },
  { id: 'cyan', name: 'Cyan', color: '#00ffff', cost: 10 },
  { id: 'orange', name: 'Orange', color: '#ffa500', cost: 15 },
  // Tambahkan lebih banyak trails sesuai kebutuhan
];

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

  // Inisialisasi Skins dan Trails saat game dimulai
  initializeSkins();
  initializeTrails();
}

// Tambahkan elemen loading screen dan progress bar ke dalam variabel
const loadingScreen = document.getElementById('loadingScreen');
const loadingProgress = document.getElementById('loadingProgress');
const loadingTip = document.getElementById('loadingTip');

// Daftar tips yang akan ditampilkan secara acak
const tips = [
  "Tip: If you're fall that's your fault",
  "Tip: Timing your jumps is key!",
  "Tip: If you're wanted to discuss just tell me what do you want for this game.",
  "Tip: This game is still under Development."
];

// Fungsi untuk memulai loading screen
function startLoadingScreen(callback) {
  // Tampilkan loading screen
  loadingScreen.style.display = 'flex';

  // Pilih tip secara acak
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  loadingTip.innerText = randomTip;

  // Simulasikan progres loading
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += 10; // Tambahkan progres setiap interval
    loadingProgress.style.width = progress + '%';

    if (progress >= 100) {
      clearInterval(loadingInterval);
      // Sembunyikan loading screen
      loadingScreen.style.display = 'none';

      // Panggil fungsi callback untuk memulai game setelah loading selesai
      callback();
    }
  }, 300); // Interval setiap 300ms (3 detik total untuk 100%)
}

// Memulai game dengan loading screen saat tombol "Start" diklik
startBtn.addEventListener('click', () => {
  menuScreen.style.display = 'none'; // Sembunyikan menu screen
  pauseBtn.style.display = 'block'; // Tampilkan tombol pause

  // Mulai loading screen dan setelah selesai, panggil fungsi untuk memulai game
  startLoadingScreen(() => {
    canvas.style.display = 'block'; // Tampilkan game canvas
    startGame(); // Mulai game setelah loading selesai
  });
});

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
let currentTrailColor = '#00ff00'; // Warna trail default

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
  ctx.fillStyle = player.color; // Menggunakan warna skin
  ctx.fill();
  ctx.closePath();
}

// Fungsi untuk menggambar jejak pemain
function drawTrail() {
  trail.forEach((pos, index) => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, player.radius - (index * 2), 0, Math.PI * 2);
    ctx.fillStyle = currentTrailColor; // Menggunakan warna trail yang dipilih
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
    console.log(`${coinRate} coin(s) added via timer. Total coins: ${totalCoinsCollected}`);
    localStorage.setItem('totalCoinsCollected', totalCoinsCollected);
    // Update HUD saat koin ditambahkan
    shopCoins.innerText = totalCoinsCollected;
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
  coins = totalCoinsCollected; // Set coins berdasarkan totalCoinsCollected
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

  // Muat skin dan trail yang dipilih
  loadCurrentSkin();
  loadCurrentTrail();

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
  coins = totalCoinsCollected; // Set coins berdasarkan totalCoinsCollected
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

  // Muat skin dan trail yang dipilih
  loadCurrentSkin();
  loadCurrentTrail();

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
  finalCoins.textContent = `Coins: ${totalCoinsCollected}`;

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
  shopCoins.innerText = totalCoinsCollected; // Display total coins
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
  item.addEventListener('click', () => { // Perbaikan di sini
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
    if (totalCoinsCollected >= cost) {
      totalCoinsCollected -= cost;
      coins -= cost;
      jumpStrength -= 5;  // Membuat loncatan lebih kuat
      successMessage = 'You purchased Jump Boost!';
      console.log(`Purchased Jump Boost. Remaining coins: ${totalCoinsCollected}`);
    }
  } else if (item === 'extraLife') {
    cost = 10;
    if (totalCoinsCollected >= cost) {
      totalCoinsCollected -= cost;
      coins -= cost;
      // Tambahkan logika extra life di sini
      successMessage = 'You purchased Extra Life!';
      console.log(`Purchased Extra Life. Remaining coins: ${totalCoinsCollected}`);
    }
  } 
  // Penanganan pembelian atau pemilihan skin
  else if (item.startsWith('skin_')) {
    const skinId = item.split('_')[1];
    const selectedSkin = skins.find(skin => skin.id === skinId);

    if (selectedSkin) {
      if (selectedSkin.cost === 0) {
        // Skin gratis, langsung pilih
        localStorage.setItem('currentSkin', skinId);
        player.color = selectedSkin.color;
        successMessage = `You selected ${selectedSkin.name}!`;
        console.log(`Selected ${selectedSkin.name}.`);
      } else {
        // Periksa apakah skin sudah dibeli
        let purchasedSkins = JSON.parse(localStorage.getItem('purchasedSkins')) || [];
        if (purchasedSkins.includes(skinId)) {
          // Jika sudah dibeli, langsung pilih
          localStorage.setItem('currentSkin', skinId);
          player.color = selectedSkin.color;
          successMessage = `You selected ${selectedSkin.name}!`;
          console.log(`Selected ${selectedSkin.name}.`);
        } else {
          // Jika belum dibeli, coba beli
          cost = selectedSkin.cost;
          if (totalCoinsCollected >= cost) {
            totalCoinsCollected -= cost;
            coins -= cost;
            purchasedSkins.push(skinId);
            localStorage.setItem('purchasedSkins', JSON.stringify(purchasedSkins));
            localStorage.setItem('currentSkin', skinId);
            player.color = selectedSkin.color;
            successMessage = `You purchased and selected ${selectedSkin.name}!`;
            console.log(`Purchased ${selectedSkin.name}. Remaining coins: ${totalCoinsCollected}`);
          }
        }
      }
    } else {
      console.log(`Skin with id ${skinId} not found.`);
      return;
    }
  }
  // Penanganan pembelian atau pemilihan trail
  else if (item.startsWith('trail_')) {
    const trailId = item.split('_')[1];
    const selectedTrail = trails.find(trail => trail.id === trailId);

    if (selectedTrail) {
      if (selectedTrail.cost === 0) {
        // Trail gratis, langsung pilih
        localStorage.setItem('currentTrail', trailId);
        currentTrailColor = selectedTrail.color;
        successMessage = `You selected ${selectedTrail.name} Trail!`;
        console.log(`Selected ${selectedTrail.name} Trail.`);
      } else {
        // Periksa apakah trail sudah dibeli
        let purchasedTrails = JSON.parse(localStorage.getItem('purchasedTrails')) || [];
        if (purchasedTrails.includes(trailId)) {
          // Jika sudah dibeli, langsung pilih
          localStorage.setItem('currentTrail', trailId);
          currentTrailColor = selectedTrail.color;
          successMessage = `You selected ${selectedTrail.name} Trail!`;
          console.log(`Selected ${selectedTrail.name} Trail.`);
        } else {
          // Jika belum dibeli, coba beli
          cost = selectedTrail.cost;
          if (totalCoinsCollected >= cost) {
            totalCoinsCollected -= cost;
            coins -= cost;
            purchasedTrails.push(trailId);
            localStorage.setItem('purchasedTrails', JSON.stringify(purchasedTrails));
            localStorage.setItem('currentTrail', trailId);
            currentTrailColor = selectedTrail.color;
            successMessage = `You purchased and selected ${selectedTrail.name} Trail!`;
            console.log(`Purchased ${selectedTrail.name} Trail. Remaining coins: ${totalCoinsCollected}`);
          }
        }
      }
    } else {
      console.log(`Trail with id ${trailId} not found.`);
      return;
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

  // Update totalCoinsCollected di localStorage setelah pembelian
  localStorage.setItem('totalCoinsCollected', totalCoinsCollected);

  // Update displayed coin count setelah pembelian
  shopCoins.innerText = totalCoinsCollected;

  // Re-inisialisasi skins dan trails untuk memperbarui status
  initializeSkins();
  initializeTrails();
}

// Fungsi untuk inisialisasi skins yang sudah dibeli dan skin yang dipilih
function initializeSkins() {
  // Ambil skins yang sudah dibeli dari localStorage
  const purchasedSkins = JSON.parse(localStorage.getItem('purchasedSkins')) || [];

  // Ambil skin yang saat ini dipilih
  const currentSkinId = localStorage.getItem('currentSkin') || 'default';
  const currentSkin = skins.find(skin => skin.id === currentSkinId) || skins[0];
  player.color = currentSkin.color;

  // Tampilkan indikator skin yang sudah dibeli
  shopItems.forEach(item => {
    const itemType = item.getAttribute('data-item');
    if (itemType.startsWith('skin_')) {
      const skinId = itemType.split('_')[1];
      const selectedSkin = skins.find(skin => skin.id === skinId);
      if (selectedSkin) {
        if (purchasedSkins.includes(skinId) || skinId === 'default') {
          // Tampilkan sebagai sudah dibeli
          item.classList.add('purchased');
          // Cek apakah sudah ada label "Owned"
          if (!item.querySelector('.owned-label')) {
            const ownedLabel = document.createElement('span');
            ownedLabel.classList.add('owned-label');
            ownedLabel.innerText = 'Owned';
            item.appendChild(ownedLabel);
          }
        } else {
          // Jika belum dibeli, pastikan tidak ada label "Owned"
          const ownedLabel = item.querySelector('.owned-label');
          if (ownedLabel) {
            ownedLabel.remove();
          }
          item.classList.remove('purchased');
        }
      }
    }
  });
}

// Fungsi untuk inisialisasi trails yang sudah dibeli dan trail yang dipilih
function initializeTrails() {
  // Ambil trails yang sudah dibeli dari localStorage
  const purchasedTrails = JSON.parse(localStorage.getItem('purchasedTrails')) || [];

  // Ambil trail yang saat ini dipilih
  const currentTrailId = localStorage.getItem('currentTrail') || 'default';
  const currentTrail = trails.find(trail => trail.id === currentTrailId) || trails[0];
  currentTrailColor = currentTrail.color;

  // Tampilkan indikator trail yang sudah dibeli
  shopItems.forEach(item => {
    const itemType = item.getAttribute('data-item');
    if (itemType.startsWith('trail_')) {
      const trailId = itemType.split('_')[1];
      const selectedTrail = trails.find(trail => trail.id === trailId);
      if (selectedTrail) {
        if (purchasedTrails.includes(trailId) || trailId === 'default') {
          // Tampilkan sebagai sudah dibeli
          item.classList.add('purchased');
          // Cek apakah sudah ada label "Owned"
          if (!item.querySelector('.owned-label')) {
            const ownedLabel = document.createElement('span');
            ownedLabel.classList.add('owned-label');
            ownedLabel.innerText = 'Owned';
            item.appendChild(ownedLabel);
          }
        } else {
          // Jika belum dibeli, pastikan tidak ada label "Owned"
          const ownedLabel = item.querySelector('.owned-label');
          if (ownedLabel) {
            ownedLabel.remove();
          }
          item.classList.remove('purchased');
        }
      }
    }
  });
}

// Fungsi untuk memuat skin yang dipilih saat game dimulai
function loadCurrentSkin() {
  const currentSkinId = localStorage.getItem('currentSkin') || 'default';
  const currentSkin = skins.find(skin => skin.id === currentSkinId) || skins[0];
  player.color = currentSkin.color;
}

// Fungsi untuk memuat trail yang dipilih saat game dimulai
function loadCurrentTrail() {
  const currentTrailId = localStorage.getItem('currentTrail') || 'default';
  const currentTrail = trails.find(trail => trail.id === currentTrailId) || trails[0];
  currentTrailColor = currentTrail.color;
}

// Inisialisasi game untuk menampilkan menu utama
function initialize() {
  menuScreen.style.display = 'block';
  canvas.style.display = 'none';
  pauseBtn.style.display = 'none';
  pauseMenu.style.display = 'none';
  confirmationModal.style.display = 'none';
  gameOverScreen.style.display = 'none';
  
  // Inisialisasi skins dan trails
  initializeSkins();
  initializeTrails();

  // Muat skin dan trail yang dipilih
  loadCurrentSkin();
  loadCurrentTrail();
}

initialize();

// Tambahkan Logika Cheat Code "addcoins"
let cheatCode = 'addcoins';
let inputBuffer = '';

window.addEventListener('keydown', (e) => {
  // Tambahkan karakter yang ditekan ke buffer
  inputBuffer += e.key.toLowerCase();

  // Pastikan buffer tidak lebih panjang dari cheatCode
  if (inputBuffer.length > cheatCode.length) {
    inputBuffer = inputBuffer.slice(-cheatCode.length); // Potong ke panjang yang sesuai
  }

  // Cek apakah cheatCode terdeteksi
  if (inputBuffer === cheatCode) {
    // Tambahkan 1 koin
    coins += 1;
    totalCoinsCollected += 1;
    console.log('Cheat activated, added +1 coins');
    localStorage.setItem('totalCoinsCollected', totalCoinsCollected);
    shopCoins.innerText = totalCoinsCollected;

    // Tampilkan notifikasi cheat
    cheatNotification.style.display = 'block';

    // Sembunyikan notifikasi setelah 2 detik
    setTimeout(() => {
      cheatNotification.style.display = 'none';
    }, 2000);

    // Reset inputBuffer
    inputBuffer = '';
  }
});
