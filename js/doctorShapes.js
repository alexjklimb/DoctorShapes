const playerRadius = 50;
const startingHealth = 50;
const playerBackground = "url(./images/ship.png)";
const boardSize = 1000;
const gameBackground = 'black';
const waveSpeed = 10000 //miliseconds
const enemySize = 20;
const enemyBackground = "lightgreen";
const centerX = window.innerWidth / 2 - playerRadius*2;
const centerY = window.innerHeight / 2 - playerRadius*2;
//MUSIC
const gameMusic = sound('./music/background.wav');


//BOARD
let board = null;
let bX = window.innerWidth / 2 - boardSize/2;
let bY = window.innerHeight / 2 - boardSize/2;
//PLAYER
let player;
let health = startingHealth;
let healthBar;
let extraHealthBar;
let playerSpeed = 6;
let pX = boardSize / 2 - playerRadius/2;
let pY = boardSize / 2 - playerRadius/2;
let bullets = [];
let bulletRadius = 10;
let bulletSpeed = 6;
//ENEMY
let trackTime = 0;
let breakTime = false;
let waveSpawns = 10;
let spawns = 0;
let spawnTime = 500; //20 seconds
let enemies = [];
let enemyAmount = 2;

let keys = {};


document.getElementById("startButton").addEventListener('click', function() {
    document.getElementById("startGamePage").style.display = "none";
    startGame();
})

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
    return this.sound;
  }

function startGame() {
    //Creates the music
    gameMusic.play();
    //CREATES THE LISTENER FOR KEY EVENTS
    document.addEventListener("keydown", function(e) {
        keys[e.key] = true;
    })
    document.addEventListener("keyup", function(e) {
        keys[e.key] = false;
    })
    // CREATES THE GAME!
    createObject({
        height: boardSize,
        width: boardSize,
        background: gameBackground,
        left: window.innerWidth / 2 - boardSize/2,
        top: window.innerHeight / 2 - boardSize/2,
        id: "game"
    })

    //CREATES THE HEALTHBAR 
    healthBar = document.createElement('div');
    healthBar.style.height = "10px";
    healthBar.style.width = "50px";
    healthBar.style.background = "transparent";
    healthBar.style.border = "2px solid black";
    healthBar.style.borderRadius = "5px";
    healthBar.style.position = "absolute";
    healthBar.style.top = "60px";
    healthBar.style.left = "0px";
    extraHealthBar = document.createElement('div');
    extraHealthBar.style.height = "6px";
    extraHealthBar.style.width = "50px";
    extraHealthBar.style.background = "lightgreen";
    extraHealthBar.style.borderRight = "2px solid orange";
    extraHealthBar.style.borderRadius = "5px";
    extraHealthBar.style.position = "absolute";
    extraHealthBar.style.top = "62px";
    extraHealthBar.style.left = "2px";
    // CREATES THE CHARACTER!
    createObject({
        height: playerRadius,
        width: playerRadius,
        background: playerBackground,
        left: pX,
        top: pY,
        id: "player",
        type: "circle",
    })

    //STARTS THE FIRST WAVE
    newWave();

    // LOOP THAT RUNS ALL OF THE CODE!
    setInterval(function() {
        movePlayer();
        moveEnemies();
        moveBullets();
        checkCollision();
        if (trackTime >= spawnTime && !breakTime) {
            trackTime = 0;
            spawns += 1;
            newWave();
            if (spawns > waveSpawns) {
                breakTime = true;
            }
        } else if (breakTime) {
            spawns = 0;
            if (trackTime >= 2000) {
                breakTime = false;
            }
        }
        trackTime += 1;
    }, 10);
    
    document.addEventListener('click', function(e) {
        console.log("CLICKED")
        let mouseX = e.clientX - centerX - playerRadius*2;
        let mouseY = e.clientY - centerY - playerRadius*2;
        if (mouseX > 0) {
            mouseDX = Math.cos(Math.atan(mouseY / mouseX));
            mouseDY = Math.sin(Math.atan(mouseY / mouseX));
        } else {
            mouseDX = -Math.cos(Math.atan(mouseY / mouseX));
            mouseDY = -Math.sin(Math.atan(mouseY / mouseX));
        }
        x = pX + playerRadius/2;
        y = pY + playerRadius/2;
        shootBullet(x, y, mouseDX, mouseDY);
    })
}
function shootBullet(x, y, dx, dy) {
    bullet = document.createElement("div");
    bullet.style.left = x + "px";
    bullet.style.top = y + "px";
    bullet.style.height = bulletRadius + "px";
    bullet.style.width = bulletRadius + "px";
    bullet.style.backgroundColor = "red";
    bullet.style.borderRadius = "50%";
    bullet.style.position = "absolute";
    bullets.push({
      bullet: bullet,
      x: x,
      y: y,
      dx: dx,
      dy: dy,
      radius: bulletRadius/2,
    });
    board.appendChild(bullet);
}
function moveBullets() {
    bullets = bullets.map(bullet => {
        bullet.x += bullet.dx * bulletSpeed; 
        bullet.y += bullet.dy * bulletSpeed; 
        bullet.bullet.style.left = bullet.x + "px";
        bullet.bullet.style.top = bullet.y + "px";
        return bullet
    });
}
function moveEnemies() {
    for (enemy of enemies) {
        enemyDirection = moveTowardsPlayer(enemy.x, enemy.y);
        enemy.x -= enemyDirection.dx;
        enemy.y -= enemyDirection.dy;
        enemy.enemy.style.left = enemy.x + "px";
        enemy.enemy.style.top = enemy.y + "px";
        var newDegrees = Math.abs(enemyDirection.degrees) * enemyDirection.degrees/Math.abs(enemyDirection.degrees);
        enemy.enemy.style.transform = "rotate(" + newDegrees + "deg)";
    };
}
function checkCollision() {
    enemies.forEach( (enemy, eInd, eArr) => {
        if (bullets.length > 0) {
            //BULLET COLLISION
            bullets.forEach((bullet, bInd, bArr) => {
                if (circleCollision(bullet.x, enemy.x, bullet.y, enemy.y, bullet.radius, enemy.radius)) {
                    board.removeChild(enemy.enemy);
                    enemies.splice(eInd, 1);
                    board.removeChild(bullet.bullet);
                    bullets.splice(bInd, 1);
                }
            });
            //PLAYER COLLISION
            if (circleCollision(enemy.x - 15, pX, enemy.y - 15, pY, enemy.radius, playerRadius/2)) {
                health -= enemy.damage;
                extraHealthBar.style.width = Math.round(health / startingHealth * 100 / 2) + 'px';
                board.removeChild(enemy.enemy);
                enemies.splice(eInd, 1);
                if (health <= 0) {
                    board.removeChild(player);
                }
            }
        }
    })
}
function circleCollision(cx1, cx2, cy1, cy2, cr1, cr2) {
    cx1 += cr1;
    cx2 += cr2;
    cy1 += cr1;
    cy2 += cr2
    distanceBetweenCirclesSquared =
      (cx2 - cx1) * (cx2 - cx1) + (cy2 - cy1) * (cy2 - cy1);
    if (distanceBetweenCirclesSquared < (cr1 + cr2) ** 2) {
      return true;
    } else {
      return false;
    }
}
function newWave() {
    for (var i  = 0; i < enemyAmount;i++) {
        let enemyLeft = 0;
        let enemyTop = 0;
        if (Math.random() > 0.5) {
            if (Math.random() > 0.5) {
                enemyTop = boardSize;
            } else {
                enemyTop = 0 - enemySize;
            }
            enemyLeft = Math.random() * boardSize;
        } else {
            if (Math.random() > 0.5) {
                enemyLeft = boardSize;
            } else {
                enemyLeft = 0 - enemySize;
            }
            enemyTop = Math.random() * boardSize;
        }
        enemy = {
            height: enemySize,
            width: enemySize,
            background: './images/enemy1.png',
            x: enemyLeft,
            y: enemyTop,
            type: "triangle",
            radius: 12,
            damage: 10,
        }
        divEnemy = createObject(enemy);
        enemies.push(enemy);
        enemy['enemy'] = divEnemy;
    }
}
function movePlayer() {
    var dx = 0;
    var dy = 0;
    if (keys['w']) {
        dy += -1;
    }
    if (keys['s']) {
        dy += 1;
    }
    if (dy == 0) {
        if (keys['d']) {
            dx += 1;
        }
        if (keys['a']) {
            dx += -1;
        }
    }
    else {
        let startingDy = dy;
        if (keys['d']) {
            dx += Math.cos(Math.PI / 4);
            dy *= Math.cos(Math.PI / 4);
        }
        if (keys['a']) {
            dx += -Math.cos(Math.PI / 4);
            dy *= Math.cos(Math.PI / 4);
        }
        if (dx == 0) {
            dy = startingDy;
        }
    }
    if (pX + dx < boardSize - playerRadius && pX + dx > 0) {
        changeAmount = dx * (1 + playerSpeed/5);
        pX += changeAmount;
        bX -= changeAmount;
        player.style.left = pX + "px";
        board.style.left = bX + "px";
    }
    if (pY + dy < boardSize - playerRadius && pY + dy > 0) {
        changeAmount = dy * (1 + playerSpeed/5);
        pY += changeAmount;
        bY -= changeAmount;
        player.style.top = pY + "px";
        board.style.top = bY + "px";
    }
};
function createObject(newObject) {
    var div = document.createElement("div");
    div.style.height = newObject.height + "px";
    div.style.width = newObject.width + "px";
    div.style.position = "absolute";
    div.style.top = newObject.top + 'px';
    div.style.left = newObject.left + "px";
    div.style.background = newObject.background;
    if (newObject.type == "circle") {
        div.style.borderRadius = "50%";
    } else if (newObject.type == "triangle") {
        div.style.width = newObject.width+'px';
        div.style.height = newObject.height+'px';
        let img = document.createElement("img");
        img.style.width = newObject.width+'px';
        img.style.height = newObject.height + 5 + 'px';
        img.style.backgroundPositionY = "-100px";
        img.setAttribute('src', newObject.background);
        div.appendChild(img);
        div.style.overflow = "visible";
        div.style.backgroundRepeat = "no-repeat";
    }


    if (newObject.id) {
        div.id = newObject.id;
    }
    if (div.id == "player") {
        div.style.backgroundSize = "cover";
        player = div;
        player.appendChild(extraHealthBar)
        player.appendChild(healthBar);
    }
    if (newObject.id == "game") {
        div.style.backgroundSize = "10%";
        board = div;
        document.body.appendChild(div);
    } else {
        document.getElementById("game").appendChild(div);
    }
    return div;
}
function moveTowardsPlayer(x, y) {
    let distanceX = x + enemySize/2 - pX - playerRadius/2;
    let distanceY = y + enemySize/2 - pY - playerRadius/2;
    let dx;
    let dy;
    let degrees = 0;
    if (distanceX >= 0) {
    dx = Math.cos(Math.atan(distanceY / distanceX));
    dy = Math.sin(Math.atan(distanceY / distanceX));
    degrees = Math.atan(distanceY / distanceX) * (180 / Math.PI) - 90;
    } else {
    dx = -Math.cos(Math.atan(distanceY / distanceX));
    dy = -Math.sin(Math.atan(distanceY / distanceX));
    degrees = -Math.atan(distanceY / -distanceX) * (180 / Math.PI) + 90;
    }
    return { dx: dx, dy: dy, degrees: Math.round(degrees)};
};
