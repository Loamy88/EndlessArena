// main.js (updated)

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let player, enemies = [], projectiles = [], particles = [], wave = 1, gold = 0, inShop = false;
let abilities = { melee: true }, stats = { health: 100, maxHealth: 100, speed: 2 };
let cooldown = false;

const hpDisplay = document.getElementById('hp');
const goldDisplay = document.getElementById('gold');
const waveDisplay = document.getElementById('wave');
const shopEl = document.getElementById('shop');
const upgradeSlots = document.getElementById('upgradeSlots');
const statsEl = document.getElementById('stats');
const attackBtn = document.getElementById('attackBtn');
const rerollBtn = document.getElementById('rerollBtn');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 20;
    this.color = 'white';
    this.speed = stats.speed;
    this.health = stats.health;
    this.maxHealth = stats.maxHealth;
    this.attackAnim = 0;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    if (this.attackAnim > 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 30, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();
      this.attackAnim--;
    }
  }
  update() {
    if (keys['ArrowUp'] || keys['w']) this.y -= this.speed;
    if (keys['ArrowDown'] || keys['s']) this.y += this.speed;
    if (keys['ArrowLeft'] || keys['a']) this.x -= this.speed;
    if (keys['ArrowRight'] || keys['d']) this.x += this.speed;
    this.draw();
  }
}

class Enemy {
  constructor(x, y, health, isBoss = false) {
    this.x = x;
    this.y = y;
    this.radius = isBoss ? 40 : 20;
    this.color = 'red';
    this.speed = isBoss ? 0.5 : 1 + Math.random();
    this.health = health;
    this.maxHealth = health;
    this.isBoss = isBoss;
    this.projectileCooldown = rand(90, 180);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
    if (this.projectileCooldown <= 0 && this.isBoss) {
      this.projectileCooldown = rand(90, 180);
      projectiles.push(new Projectile(this.x, this.y, player.x, player.y, Math.ceil(this.health / 3), true));
    } else {
      this.projectileCooldown--;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.radius + player.radius) {
      player.health -= 0.5;
    }

    this.draw();
  }
}

class Projectile {
  constructor(x, y, targetX, targetY, damage, enemy = false) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.damage = damage;
    this.color = enemy ? 'red' : 'white';
    this.speed = 5;
    const angle = Math.atan2(targetY - y, targetX - x);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.enemy = enemy;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (this.enemy && dist < player.radius) {
      player.health -= this.damage;
      this.x = -9999;
    }
  }
}

function spawnEnemies(wave) {
  const count = Math.floor(2 + wave * 1.5);
  for (let i = 0; i < count; i++) {
    const x = rand(0, canvas.width);
    const y = rand(0, canvas.height);
    const health = rand(5 + wave * 3, 10 + wave * 4);
    enemies.push(new Enemy(x, y, health));
  }
  if (wave % 3 === 0) {
    const x = rand(0, canvas.width);
    const y = rand(0, canvas.height);
    const bossHealth = rand(30 + wave * 5, 50 + wave * 7);
    enemies.push(new Enemy(x, y, bossHealth * 3, true));
  }
}

function drawUI() {
  hpDisplay.textContent = Math.max(0, Math.floor(player.health));
  goldDisplay.textContent = gold;
  waveDisplay.textContent = wave;
}

function attack() {
  if (cooldown) return;
  cooldown = true;
  attackBtn.classList.add('cooldown');
  player.attackAnim = 10;
  setTimeout(() => {
    cooldown = false;
    attackBtn.classList.remove('cooldown');
  }, 1000);

  for (let enemy of enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.radius + enemy.radius + 30) {
      enemy.health -= 10;
      gold += 2;
    }
  }
}

function nextWave() {
  inShop = false;
  shopEl.style.display = 'none';
  player.health = Math.min(player.maxHealth, player.health + 10);
  wave++;
  spawnEnemies(wave);
}

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);
attackBtn.addEventListener('click', attack);
rerollBtn.addEventListener('click', () => {
  if (gold >= 20) {
    gold -= 20;
    showShop();
  }
});

function startGame() {
  player = new Player();
  spawnEnemies(wave);
  gameLoop();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!inShop) {
    player.update();
    enemies = enemies.filter(e => e.health > 0);
    enemies.forEach(e => e.update());
    projectiles = projectiles.filter(p => p.x >= 0 && p.x <= canvas.width && p.y >= 0 && p.y <= canvas.height);
    projectiles.forEach(p => p.update());

    if (enemies.length === 0) {
      inShop = true;
      showShop();
    }
  }

  drawUI();
  requestAnimationFrame(gameLoop);
}

startGame();
