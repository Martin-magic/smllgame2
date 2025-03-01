const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// 游戏状态
let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;

// 玩家飞机
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 5,
  bullets: [],
  draw() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

// 敌人
const enemies = [];
const enemySpeed = 2 + level * 0.5;
let enemySpawnRate = 1000 - level * 100;
let lastEnemySpawn = 0;

function spawnEnemy() {
  const size = 30 + Math.random() * 20;
  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: enemySpeed
  });
}

// 控制
document.getElementById('leftBtn').addEventListener('click', () => {
  player.x = Math.max(0, player.x - player.speed);
});
document.getElementById('rightBtn').addEventListener('click', () => {
  player.x = Math.min(canvas.width - player.width, player.x + player.speed);
});
document.getElementById('shootBtn').addEventListener('click', () => {
  player.bullets.push({
    x: player.x + player.width / 2 - 2.5,
    y: player.y,
    width: 5,
    height: 10,
    speed: 8
  });
});

// 游戏循环
function gameLoop() {
  if (gameOver) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制玩家
  player.draw();
  
  // 生成敌人
  if (Date.now() - lastEnemySpawn > enemySpawnRate) {
    spawnEnemy();
    lastEnemySpawn = Date.now();
  }

  // 更新游戏状态
  update();
  
  // 请求下一帧
  requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function update() {
  // 更新子弹
  player.bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    // 移除超出屏幕的子弹
    if (bullet.y + bullet.height < 0) {
      player.bullets.splice(index, 1);
    }
  });
  
  // 更新敌人
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // 碰撞检测
    player.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {
        // 击中敌人
        enemies.splice(index, 1);
        player.bullets.splice(bulletIndex, 1);
        score += 10;
        // 检查关卡升级
        if (score >= level * 1000) {
          level++;
          enemySpawnRate = Math.max(300, 1000 - level * 100);
          document.getElementById('level').textContent = level;
          alert('恭喜！进入第' + level + '关');
        }
      }
    });
    
    // 敌人到达底部
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
        alert('游戏结束！你的得分：' + score);
        // 重置游戏
        document.getElementById('restartBtn').style.display = 'block';
      }
    }
  });

  // 更新HUD
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = level;
}

// 重置游戏
function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  gameOver = false;
  enemies.length = 0;
  player.bullets.length = 0;
  player.x = canvas.width / 2 - 25;
  document.getElementById('restartBtn').style.display = 'none';
  gameLoop();
}

// 重置按钮
document.getElementById('restartBtn').addEventListener('click', resetGame);

// 开始游戏
resetGame();
