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
const enemySpeed = 2 + level * 0.8;  // 增加速度提升幅度
let enemySpawnRate = Math.max(200, 1000 - level * 150);  // 增加生成频率
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
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

// 键盘事件
document.addEventListener('keydown', (e) => {
  if (e.code in keys) {
    keys[e.code] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
  }
});

// 移动控制
function handleMovement() {
  if (keys.ArrowLeft) {
    player.x = Math.max(0, player.x - player.speed);
  }
  if (keys.ArrowRight) {
    player.x = Math.min(canvas.width - player.width, player.x + player.speed);
  }
  if (keys.Space) {
    player.bullets.push({
      x: player.x + player.width / 2 - 2.5,
      y: player.y,
      width: 5,
      height: 10,
      speed: 8
    });
    keys.Space = false; // 防止连续射击
  }
}

// 按钮控制（保留移动端支持）
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
  
  // 绘制敌人
  enemies.forEach(enemy => {
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
  
  // 生成敌人
  if (Date.now() - lastEnemySpawn > enemySpawnRate) {
    spawnEnemy();
    lastEnemySpawn = Date.now();
  }

  // 处理移动
  handleMovement();
  
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
        if (score >= level * 500) {
          level++;
          enemySpawnRate = Math.max(200, 1000 - level * 150);
          enemySpeed += 0.8;  // 增加速度提升幅度
          // 每3关增加一个生命
          if (level % 3 === 0) {
            lives++;
            document.getElementById('lives').textContent = lives;
          }
          document.getElementById('level').textContent = level;
          // 关卡过渡效果
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '40px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('关卡 ' + level, canvas.width/2, canvas.height/2);
          
          // 增加难度
          enemySpeed += 0.5;
          enemySpawnRate = Math.max(100, 800 - level * 100);
          setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }, 1500);
        }
      }
    });
    
    // 敌人到达底部
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
      // 检测与玩家碰撞
      // 绘制碰撞区域调试框
      ctx.strokeStyle = 'yellow';
      ctx.strokeRect(player.x, player.y, player.width, player.height);
      ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // 增强型碰撞检测
      const collisionMargin = 10; // 进一步优化碰撞容差
      const enemyRect = {
        left: enemy.x + collisionMargin,
        right: enemy.x + enemy.width - collisionMargin,
        top: enemy.y + collisionMargin,
        bottom: enemy.y + enemy.height - collisionMargin
      };
      const playerRect = {
        left: player.x + collisionMargin,
        right: player.x + player.width - collisionMargin,
        top: player.y + collisionMargin,
        bottom: player.y + player.height - collisionMargin
      };
      
      // 绘制碰撞区域调试框
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.strokeRect(enemyRect.left, enemyRect.top, 
        enemyRect.right - enemyRect.left, 
        enemyRect.bottom - enemyRect.top);
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.strokeRect(playerRect.left, playerRect.top, 
        playerRect.right - playerRect.left, 
        playerRect.bottom - playerRect.top);
      
      // 使用更精确的矩形相交检测
      const isColliding = 
        enemyRect.left < playerRect.right &&
        enemyRect.right > playerRect.left &&
        enemyRect.top < playerRect.bottom &&
        enemyRect.bottom > playerRect.top;
        
      if (isColliding) {
        console.log('碰撞发生，当前生命值：', lives);
        console.log('碰撞区域重叠：', {
          horizontal: enemyRect.left < playerRect.right && enemyRect.right > playerRect.left,
          vertical: enemyRect.top < playerRect.bottom && enemyRect.bottom > playerRect.top,
          overlapX: Math.min(enemyRect.right, playerRect.right) - Math.max(enemyRect.left, playerRect.left),
          overlapY: Math.min(enemyRect.bottom, playerRect.bottom) - Math.max(enemyRect.top, playerRect.top)
        });
        lives--;
        console.log('扣除后生命值：', lives);
        document.getElementById('lives').textContent = lives;
        console.log('界面生命值更新为：', document.getElementById('lives').textContent);
        if (lives <= 0) {
          gameOver = true;
          // 游戏结束界面
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = 'white';
          ctx.font = '40px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('游戏结束', canvas.width/2, canvas.height/2 - 60);
          
          ctx.font = '30px Arial';
          ctx.fillText('得分: ' + score, canvas.width/2, canvas.height/2 - 20);
          ctx.fillText('最高关卡: ' + level, canvas.width/2, canvas.height/2 + 20);
          
          ctx.font = '20px Arial';
          ctx.fillText('按 R 重新开始', canvas.width/2, canvas.height/2 + 60);
          
          // 保存记录
          updateHistory(score, level);
          
          // 显示重新开始按钮
          document.getElementById('restartBtn').style.display = 'block';
          
          // 添加键盘重新开始监听
          document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
              resetGame();
            }
          });
        }
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

// 历史记录
let history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
const maxRecords = 5;

function updateHistory(score, level) {
  // 添加新记录
  history.push({score, level, date: new Date().toLocaleString()});
  
  // 按分数排序并保留前5名
  history.sort((a, b) => b.score - a.score);
  history = history.slice(0, maxRecords);
  
  // 保存到localStorage
  localStorage.setItem('gameHistory', JSON.stringify(history));
  
  // 更新显示
  showHistory();
}

function showHistory() {
  const highScore = history.length ? history[0].score : 0;
  const maxLevel = history.length ? Math.max(...history.map(h => h.level)) : 0;
  
  document.getElementById('highScore').textContent = highScore;
  document.getElementById('maxLevel').textContent = maxLevel;
  
  const topScores = document.getElementById('topScores');
  topScores.innerHTML = history
    .map((h, i) => `<li>${i+1}. 分数: ${h.score} 关卡: ${h.level} (${h.date})</li>`)
    .join('');
}

// 历史记录按钮
document.getElementById('historyBtn').addEventListener('click', () => {
  const panel = document.getElementById('historyPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

// 重置按钮
document.getElementById('restartBtn').addEventListener('click', () => {
  if (confirm('确定要重新开始游戏吗？')) {
    resetGame();
  }
});

// 开始按钮
document.getElementById('startBtn').addEventListener('click', () => {
  // 隐藏开始按钮
  document.getElementById('startBtn').style.display = 'none';
  
  // 启用控制按钮
  document.getElementById('leftBtn').disabled = false;
  document.getElementById('rightBtn').disabled = false;
  document.getElementById('shootBtn').disabled = false;
  
  // 开始游戏
  resetGame();
});
