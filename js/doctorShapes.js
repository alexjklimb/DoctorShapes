const playerRadius = 50;
const playerBackground = "black";
const boardSize = 500;
const gameBackground = "lightblue";

var player;
var playerSpeed = 6;
var pX = boardSize / 2 - playerRadius/2;
var pY = boardSize / 2 - playerRadius/2;
var keys = {};


document.getElementById("startButton").addEventListener('click', function() {
    document.getElementById("startGamePage").style.display = "none";
    startGame();
})

function startGame() {
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


    // LOOP THAT RUNS ALL OF THE CODE!
    setInterval(function() {
        movePlayer();
    }, 10);















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
            pX += dx * (1 + playerSpeed/5);
            player.style.left = pX + "px";
        }
        if (pY + dy < boardSize - playerRadius && pY + dy > 0) {
            pY += dy * (1 + playerSpeed/5);
            player.style.top = pY + "px";
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
        }


        if (newObject.id) {
            div.id = newObject.id;
        }
        if (div.id == "player") {
            player = div;
        }
        if (newObject.id == "game") {
            document.body.appendChild(div);
        } else {
            document.getElementById("game").appendChild(div);
        }
    }
}