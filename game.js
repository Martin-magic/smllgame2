const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏设置
const GAME = {
  width: 800,
  height: 600,
  level: 1,
  score: 0,
  lives: 3,
  playerSpeed: 5,
  enemySpeed: 2,
  bulletSpeed: 8,
  spawnRate: 1000
};

// 玩家飞机
const player = {
  x: GAME.width / 2 - 25,
  y: GAME.height - 100,
  width: 50,
  height: 50,
  color: '#00ff00'
};

// 子弹数组
let bullets = [];
// 敌机数组
let enemies = [];

// 初始化游戏
function init() {
  canvas.width = GAME.width;
  canvas.height = GAME.height;
  document.addEventListener('keydown', keyDownHandler);
  gameLoop();
}

// 游戏主循环
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function update() {
  // 更新子弹
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) {
      bullets.splice(index, 1);
    }
  });

  // 更新敌机
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.y > GAME.height) {
      enemies.splice(index, 1);
      GAME.lives--;
      updateHUD();
    }
  });

  // 碰撞检测
  checkCollisions();
}

// 绘制游戏元素
function draw() {
  // 清空画布并绘制边框
  ctx.clearRect(0, 0, GAME.width, GAME.height);
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, GAME.width, GAME.height);

  // 绘制玩家
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // 绘制子弹
  bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // 绘制敌机
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

// 键盘控制
function keyDownHandler(e) {
  if (e.key === 'ArrowLeft' && player.x > 0) {
    player.x -= GAME.playerSpeed;
  } else if (e.key === 'ArrowRight' && player.x < GAME.width - player.width) {
    player.x += GAME.playerSpeed;
  } else if (e.key === ' ') {
    shoot();
  }
}

// 射击
function shoot() {
  bullets.push({
    x: player.x + player.width / 2 - 2.5,
    y: player.y,
    width: 5,
    height: 10,
    color: '#ff0000',
    speed: GAME.bulletSpeed
  });
}

// 生成敌机
function spawnEnemy() {
  enemies.push({
    x: Math.random() * (GAME.width - 50),
    y: -50,
    width: 50,
    height: 50,
    color: '#0000ff',
    speed: GAME.enemySpeed
  });
}

// 碰撞检测
function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {
        // 碰撞发生
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        GAME.score += 10;
        updateHUD();
      }
    });
  });
}

// 更新HUD
function updateHUD() {
  document.getElementById('score').textContent = GAME.score;
  document.getElementById('lives').textContent = GAME.lives;
  document.getElementById('level').textContent = GAME.level;
}

// 启动游戏
init();
setInterval(spawnEnemy, GAME.spawnRate);
