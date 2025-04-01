const canvas = document.getElementById('tdboard');
const ctx = canvas.getContext('2d');
const coinCounter = document.getElementById('coinCounter');
const upgradeButton = document.getElementById('upgradeButton');
const cooldownTimer = document.getElementById('cooldownTimer');
const addCoinsButton = document.getElementById('addCoinsButton');
const spawnEnemyButton = document.getElementById('spawnEnemyButton');

canvas.width = window.innerWidth * 0.9; // Reduced width from 0.95 to 0.9
canvas.height = window.innerHeight * 0.7; // Reduced height from 0.85 to 0.8

const character = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    color: 'red',
    speed: 5,
    angle: 0
};

const gun = {
    width: 20,
    height: 10,
    color: 'gray'
};

const coin = {
    x: Math.random() * (canvas.width - 20),
    y: Math.random() * (canvas.height - 20),
    width: 30,
    height: 30,
    color: 'gold',
    innerCircleColor: 'orange'
};

const enemies = [];
const enemySpeed = 3;

let score = 0;
let hasGun = false;
let canShoot = true;

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - (character.x + character.width / 2);
    const dy = mouseY - (character.y + character.height / 2);
    character.angle = Math.atan2(dy, dx);
});

canvas.addEventListener('click', (e) => {
    if (hasGun && canShoot) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        shootProjectile(mouseX, mouseY);
        startCooldown();
    }
});

function startCooldown() {
    canShoot = false;
    let cooldown = 0;
    cooldownTimer.textContent = cooldown;
    cooldownTimer.style.display = 'inline';

    const interval = setInterval(() => {
        cooldown--;
        cooldownTimer.textContent = cooldown;

        if (cooldown <= 0) {
            clearInterval(interval);
            canShoot = true;
            cooldownTimer.style.display = 'none';
        }
    }, 1000);
}

function updateCharacterPosition() {
    if (keys['ArrowUp'] || keys['w']) character.y -= character.speed;
    if (keys['ArrowDown'] || keys['s']) character.y += character.speed;
    if (keys['ArrowLeft'] || keys['a']) character.x -= character.speed;
    if (keys['ArrowRight'] || keys['d']) character.x += character.speed;

    character.x = Math.max(0, Math.min(canvas.width - character.width, character.x));
    character.y = Math.max(0, Math.min(canvas.height - character.height, character.y));
}

function drawCharacter() {
    ctx.save();
    ctx.translate(character.x + character.width / 2, character.y + character.height / 2);
    ctx.rotate(character.angle);
    ctx.fillStyle = character.color;
    ctx.fillRect(-character.width / 2, -character.height / 2, character.width, character.height);

    if (hasGun) {
        ctx.fillStyle = gun.color;
        ctx.fillRect(
            -gun.width / 2,
            -character.height / 2 - gun.height - 10,
            gun.width,
            gun.height
        );
    }
    ctx.restore();
}

function drawCoin() {
    ctx.fillStyle = coin.color;
    ctx.fillRect(coin.x, coin.y, coin.width, coin.height);

    ctx.fillStyle = coin.innerCircleColor;
    ctx.beginPath();
    ctx.arc(
        coin.x + coin.width / 2,
        coin.y + coin.height / 2,
        Math.min(coin.width, coin.height) / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function updateEnemyPositions() {
    enemies.forEach((enemy) => {
        const dx = character.x - enemy.x;
        const dy = character.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        enemy.x += (dx / distance) * enemySpeed;
        enemy.y += (dy / distance) * enemySpeed;
    });
}

function checkCoinCollision() {
    if (
        character.x < coin.x + coin.width &&
        character.x + character.width > coin.x &&
        character.y < coin.y + coin.height &&
        character.y + character.height > coin.y
    ) {
        score++;
        coinCounter.textContent = score;
        generateNewCoin();
        updateUpgradeButton();
    }
}

function checkEnemyCollision() {
    enemies.forEach((enemy) => {
        if (
            character.x < enemy.x + enemy.width &&
            character.x + character.width > enemy.x &&
            character.y < enemy.y + enemy.height &&
            character.y + character.height > enemy.y
        ) {
            score = Math.max(0, score - 1);
            coinCounter.textContent = score;
            updateUpgradeButton();
        }
    });
}

function generateNewCoin() {
    coin.x = Math.random() * (canvas.width - coin.width);
    coin.y = Math.random() * (canvas.height - coin.height);
}

function spawnEnemy() {
    enemies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 30,
        height: 30,
        color: 'blue'
    });
}

function updateUpgradeButton() {
    if (score >= 15 && !hasGun) {
        upgradeButton.disabled = false;
    } else {
        upgradeButton.disabled = true;
    }
}

upgradeButton.addEventListener('click', () => {
    if (score >= 15) {
        score -= 15;
        coinCounter.textContent = score;
        hasGun = true;
        upgradeButton.disabled = true;
    }
});

addCoinsButton.addEventListener('click', () => {
    score += 10000;
    coinCounter.textContent = score;
    updateUpgradeButton();
});

spawnEnemyButton.addEventListener('click', () => {
    spawnEnemy();
});

let isPaused = false;
let projectiles = [];
let playerHealth = 100;
const powerUps = [];
const powerUpTypes = ['invincibility', 'speedBoost', 'multiShot'];

const pauseMenu = document.getElementById('pauseMenu');
const resumeButton = document.getElementById('resumeButton');
const restartButton = document.getElementById('restartButton');
const achievementList = document.getElementById('achievementList');

let maxProjectiles = 10;
let maxEnemies = 10;
let achievements = [];

// Pause/Resume functionality
resumeButton.addEventListener('click', () => {
    isPaused = false;
    pauseMenu.style.display = 'none';
    gameLoop();
});

restartButton.addEventListener('click', () => {
    window.location.reload();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
        isPaused = !isPaused;
        pauseMenu.style.display = isPaused ? 'block' : 'none';
    }
});

// Adjust canvas size dynamically
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth * 0.9; // Reduced width from 0.95 to 0.9
    canvas.height = window.innerHeight * 0.8; // Reduced height from 0.85 to 0.8
});

// Draw health bar
function drawHealthBar() {
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, playerHealth * 2, 20);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(10, 10, 200, 20);
}

// Handle power-ups
function spawnPowerUp() {
    powerUps.push({
        x: Math.random() * (canvas.width - 30),
        y: Math.random() * (canvas.height - 30),
        width: 30,
        height: 30,
        type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
        color: 'green'
    });
}

function drawPowerUps() {
    powerUps.forEach((powerUp) => {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
}

function checkPowerUpCollision() {
    powerUps.forEach((powerUp, index) => {
        if (
            character.x < powerUp.x + powerUp.width &&
            character.x + character.width > powerUp.x &&
            character.y < powerUp.y + powerUp.height &&
            character.y + character.height > powerUp.y
        ) {
            applyPowerUp(powerUp.type);
            powerUps.splice(index, 1);
        }
    });
}

function applyPowerUp(type) {
    if (type === 'invincibility') {
        character.color = 'yellow';
        setTimeout(() => (character.color = 'red'), 5000);
    } else if (type === 'speedBoost') {
        character.speed *= 2;
        setTimeout(() => (character.speed /= 2), 5000);
    } else if (type === 'multiShot') {
        character.multiShot = true;
        setTimeout(() => (character.multiShot = false), 5000);
    }
}

// Centralized projectile management
function updateProjectiles() {
    projectiles = projectiles.slice(0, maxProjectiles);
    projectiles.forEach((projectile, index) => {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;

        ctx.fillStyle = projectile.color;
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);

        enemies.forEach((enemy, enemyIndex) => {
            if (
                projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y
            ) {
                enemies.splice(enemyIndex, 1);
                projectiles.splice(index, 1);
            }
        });

        if (
            projectile.x < 0 ||
            projectile.x > canvas.width ||
            projectile.y < 0 ||
            projectile.y > canvas.height
        ) {
            projectiles.splice(index, 1);
        }
    });
}

function shootProjectile(targetX, targetY) {
    const gunOffsetX = Math.cos(character.angle) * (character.width / 2 + gun.height + 10);
    const gunOffsetY = Math.sin(character.angle) * (character.height / 2 + gun.height + 10);

    const baseProjectile = {
        x: character.x + character.width / 2 + gunOffsetX,
        y: character.y + character.height / 2 + gunOffsetY,
        width: 10,
        height: 5,
        color: 'orange',
        speed: 10
    };

    const dx = targetX - baseProjectile.x;
    const dy = targetY - baseProjectile.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    baseProjectile.vx = (dx / distance) * baseProjectile.speed;
    baseProjectile.vy = (dy / distance) * baseProjectile.speed;

    projectiles.push(baseProjectile);

    if (character.multiShot) {
        for (let angleOffset of [-0.2, 0.2]) {
            const multiProjectile = { ...baseProjectile };
            multiProjectile.vx = Math.cos(character.angle + angleOffset) * baseProjectile.speed;
            multiProjectile.vy = Math.sin(character.angle + angleOffset) * baseProjectile.speed;
            projectiles.push(multiProjectile);
        }
    }
}

// Enemy guns
function updateEnemyGuns() {
    enemies.forEach((enemy) => {
        if (Math.random() < 0.01) {
            const dx = character.x - enemy.x;
            const dy = character.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const enemyProjectile = {
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                width: 10,
                height: 5,
                color: 'purple',
                speed: 5,
                vx: (dx / distance) * 5,
                vy: (dy / distance) * 5
            };

            projectiles.push(enemyProjectile);
        }
    });
}

function checkPlayerHealth() {
    projectiles.forEach((projectile, index) => {
        if (
            projectile.color === 'purple' &&
            projectile.x < character.x + character.width &&
            projectile.x + projectile.width > character.x &&
            projectile.y < character.y + character.height &&
            projectile.y + projectile.height > character.y
        ) {
            playerHealth -= 10;
            projectiles.splice(index, 1);
        }
    });

    if (playerHealth <= 0) {
        alert('Game Over!');
        window.location.reload();
    }
}

// Upgrades
function openUpgradeMenu() {
    const upgradeMenu = document.createElement('div');
    upgradeMenu.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px;';
    upgradeMenu.innerHTML = `
        <h3>Upgrades</h3>
        <button id="healthUpgrade">+20 Health (10 Coins)</button>
        <button id="speedUpgrade">+2 Speed (15 Coins)</button>
        <button id="projectileUpgrade">+5 Max Projectiles (20 Coins)</button>
        <button id="enemyLimitUpgrade">+5 Max Enemies (25 Coins)</button>
        <button id="closeUpgradeMenu">Close</button>
    `;
    document.body.appendChild(upgradeMenu);

    document.getElementById('healthUpgrade').addEventListener('click', () => {
        if (score >= 10) {
            score -= 10;
            playerHealth = Math.min(100, playerHealth + 20);
            coinCounter.textContent = score;
        }
    });

    document.getElementById('speedUpgrade').addEventListener('click', () => {
        if (score >= 15) {
            score -= 15;
            character.speed += 2;
            coinCounter.textContent = score;
        }
    });

    document.getElementById('projectileUpgrade').addEventListener('click', () => {
        if (score >= 20) {
            score -= 20;
            maxProjectiles += 5;
            coinCounter.textContent = score;
        }
    });

    document.getElementById('enemyLimitUpgrade').addEventListener('click', () => {
        if (score >= 25) {
            score -= 25;
            maxEnemies += 5;
            coinCounter.textContent = score;
        }
    });

    document.getElementById('closeUpgradeMenu').addEventListener('click', () => {
        document.body.removeChild(upgradeMenu);
    });
}

document.getElementById('upgradeButton').addEventListener('click', openUpgradeMenu);

// Achievements
function unlockAchievement(name) {
    if (!achievements.includes(name)) {
        achievements.push(name);
        const li = document.createElement('li');
        li.textContent = name;
        achievementList.appendChild(li);
    }
}

function checkAchievements() {
    if (score >= 50) unlockAchievement('Coin Collector: Collect 50 Coins');
    if (enemies.length === 0) unlockAchievement('Survivor: Defeat All Enemies');
    if (playerHealth === 100) unlockAchievement('Iron Man: Maintain Full Health');
}

// Updated game loop
function gameLoop() {
    if (isPaused) return;

    ctx.fillStyle = 'darkgray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateCharacterPosition();
    drawCharacter();
    drawCoin();
    drawEnemies();
    drawPowerUps();
    drawHealthBar();
    updateProjectiles();
    updateEnemyPositions();
    updateEnemyGuns();

    checkCoinCollision();
    checkEnemyCollision();
    checkPowerUpCollision();
    checkPlayerHealth();
    checkAchievements();

    requestAnimationFrame(gameLoop);
}

// Spawn power-ups periodically
setInterval(spawnPowerUp, 20000);

for (let i = 0; i < 3; i++) {
    spawnEnemy();
}

setInterval(generateNewCoin, 30000);
setInterval(spawnEnemy, 30000);

gameLoop();
