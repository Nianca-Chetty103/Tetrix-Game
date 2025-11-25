document.addEventListener("keydown", handleKeys);
   
function handleKeys(e) {   
    if (!timer) return;

    if (e.key === "ArrowLeft" || e.key === "a") moveLeft();
    if (e.key === "ArrowRight" || e.key === "d") moveRight();
    if (e.key === "ArrowUp" || e.key === "w") rotate();
    if (e.key === "ArrowDown" || e.key === "s") moveDown();
     if (e.code === "Space") {
        e.preventDefault(); 
        rotate();
     }
}

const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("start-button");
const restartBtn = document.getElementById("restart-button");

restartBtn.addEventListener("click", restartGame);

let squares = [];
let timer = null;
let score = 0;
const width = 10;

/* -------------------------------
   CREATE GRID (200 visible cells)
--------------------------------*/
for (let i = 0; i < 200; i++) {
    const div = document.createElement("div");
    div.classList.add("square");
    grid.appendChild(div);
    squares.push(div);
}

/* -------------------------------
   ADD 10 "TAKEN" squares at bottom
--------------------------------*/
for (let i = 0; i < 10; i++) {
    const div = document.createElement("div");
    div.classList.add("taken");
    grid.appendChild(div);
    squares.push(div);
}

/* -------------------------------
   TETROMINO SHAPES
--------------------------------*/
const L = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
];

const Z = [
    [0, 1, width + 1, width + 2],
    [2, width + 1, width + 2, width * 2 + 1],
    [0, 1, width + 1, width + 2],
    [2, width + 1, width + 2, width * 2 + 1],
];

const T = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width + 1],
    [1, width, width + 1, width * 2 + 1]
];

const O = [
    [0, 1, width, width + 1],
];

const I = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
];

const tetrominoes = [L, Z, T, O, I];
const colors = ["#f44336", "#e91e63", "#2196f3", "#ffeb3b", "#4caf50"];

/* -------------------------------
   CURRENT PIECE
--------------------------------*/
let currentPos = 4;
let currentRotation = 0;
let random = Math.floor(Math.random() * tetrominoes.length);
let current = tetrominoes[random][currentRotation];
let currentColor = colors[random];

/* -------------------------------
   DRAW FUNCTIONS
--------------------------------*/
function draw() {
    current.forEach(i => {
        squares[currentPos + i].classList.add("tetromino");
        squares[currentPos + i].style.setProperty("--color", currentColor);
    });
}

function undraw() {
    current.forEach(i => squares[currentPos + i].classList.remove("tetromino"));
}

/* -------------------------------
   MOVE DOWN
--------------------------------*/
function moveDown() {
    undraw();
    currentPos += width;
    draw();
    freeze();
}

/* -------------------------------
   FREEZE & SPAWN NEW PIECE
--------------------------------*/
function freeze() {
    if (current.some(i => squares[currentPos + i + width].classList.contains("taken"))) {
        current.forEach(i => squares[currentPos + i].classList.add("taken"));
        newTetromino();
        checkLines();
    }
}

function newTetromino() {
    random = Math.floor(Math.random() * tetrominoes.length);
    currentRotation = 0;
    current = tetrominoes[random][currentRotation];
    currentColor = colors[random];
    currentPos = 4;

    if (current.some(i => squares[currentPos + i].classList.contains("taken"))) {
        gameOver();
        return;
    }

    draw();
}

function gameOver() {
    clearInterval(timer);
    timer = null;

    const gameOverScreen = document.getElementById("game-over");
    gameOverScreen.classList.add("show"); // show animation

    startBtn.textContent = "Start";

    // Disable key controls
    document.removeEventListener("keydown", handleKeys);
}

/* -------------------------------
   CLEAR LINES
--------------------------------*/
function checkLines() {
    for (let i = 0; i < 200; i += width) {
        const row = [...Array(width).keys()].map(x => i + x);

        if (row.every(index => squares[index].classList.contains("taken"))) {
            score += 10;
            scoreDisplay.textContent = score;

            row.forEach(index => {
                squares[index].className = "square";
            });

            const removed = squares.splice(i, width);
            squares = removed.concat(squares);

            squares.forEach(s => grid.appendChild(s));
        }
    }
}

/* -------------------------------
   MOVEMENT
--------------------------------*/
document.addEventListener("keydown", e => {
    if (!timer) return;

    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
    if (e.key === "ArrowUp") rotate();
    if (e.key === "ArrowDown") moveDown();
});

function moveLeft() {
    undraw();
    const atLeft = current.some(i => (currentPos + i) % width === 0);
    if (!atLeft) currentPos -= 1;
    draw();
}

function moveRight() {
    undraw();
    const atRight = current.some(i => (currentPos + i) % width === width - 1);
    if (!atRight) currentPos += 1;
    draw();
}

function rotate() {
   undraw(); // remove the current tetromino from the grid

    const prevRotation = currentRotation; // save old rotation
    const prevPos = currentPos;           // save old position

    // move to next rotation
    currentRotation = (currentRotation + 1) % tetrominoes[random].length;
    current = tetrominoes[random][currentRotation];

    // WALL KICK: prevent going out of left/right edges
    const leftEdge = current.some(i => (currentPos + i) % width === 0);
    const rightEdge = current.some(i => (currentPos + i) % width === width - 1);

    if (leftEdge) currentPos += 1;
    if (rightEdge) currentPos -= 1;

    // COLLISION CHECK: if rotated piece overlaps "taken", cancel rotation
    if (current.some(i => squares[currentPos + i].classList.contains("taken"))) {
        currentRotation = prevRotation; // revert rotation
        current = tetrominoes[random][currentRotation];
        currentPos = prevPos;  
    }

    draw(); // draw the tetromino with new rotation    
}

/* -------------------------------
   START / PAUSE BUTTON
--------------------------------*/
startBtn.addEventListener("click", () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
        startBtn.textContent = "Start";
    } else {
        draw();
        timer = setInterval(moveDown, 500);
        startBtn.textContent = "Pause";
    }
});


function restartGame() {
   
    clearInterval(timer);
    timer = null;

   
    score = 0;
    scoreDisplay.textContent = score;

    squares.forEach(square => {
        square.classList.remove("tetromino");
        square.classList.remove("taken");
        square.className = "square";   // reset to default
    });

    for (let i = 200; i < 210; i++) {
        squares[i].classList.add("taken");
    }

 
    currentPos = 4;
    currentRotation = 0;
    random = Math.floor(Math.random() * tetrominoes.length);
    current = tetrominoes[random][currentRotation];
    currentColor = colors[random];


    startBtn.textContent = "Start";
    draw();
}