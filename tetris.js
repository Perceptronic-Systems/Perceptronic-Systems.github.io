const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');

// 1. Get the exact bounding box of the canvas as defined by your CSS layout
const rect = canvas.getBoundingClientRect();
const dynamicWidth = rect.width;
const dynamicHeight = rect.height;

// 2. Set an approximate size for your blocks (e.g., aiming for ~35px blocks)
const targetBlockSize = 40;

// 3. Calculate exactly how many blocks can fit horizontally and vertically
const gridWidth = Math.floor(dynamicWidth / targetBlockSize);
const gridHeight = Math.floor(dynamicHeight / targetBlockSize);

// 4. Handle High-DPI / Retina displays
const dpr = window.devicePixelRatio || 1;
canvas.width = dynamicWidth * dpr;
canvas.height = dynamicHeight * dpr;
canvas.style.width = `${dynamicWidth}px`;
canvas.style.height = `${dynamicHeight}px`;

context.scale(dpr, dpr);

// 5. STRETCH SCALE: Calculate the exact fractional block size 
// so the calculated grid matrix fills 100% of the available pixel space
const exactBlockWidth = dynamicWidth / gridWidth;
const exactBlockHeight = dynamicHeight / gridHeight;

// Scale the context independently for X and Y so they perfectly hit the canvas edges
context.scale(exactBlockWidth, exactBlockHeight);

// Keep images smooth
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = 'high';

let staticMatrix = [];
let last = 0;

function getIcon(path) {
    const icon = new Image();
    icon.src = path;
    return icon;
}

const archIcon = getIcon("/icons/archIcon.png");
const javascriptIcon = getIcon("/icons/javascriptIcon.png");
const linuxIcon = getIcon("/icons/linuxIcon.png");
const nodejsIcon = getIcon("/icons/nodejsIcon.png");
const numpyIcon = getIcon("/icons/numpyIcon.png");
const opencvIcon = getIcon("/icons/opencvIcon.png");
const pythonIcon = getIcon("/icons/pythonIcon.png");
const pytorchIcon = getIcon("/icons/pytorchIcon.png");
const tensorflowIcon = getIcon("/icons/tensorflowIcon.png");
const cssIcon = getIcon("/icons/cssIcon.png");
const htmlIcon = getIcon("/icons/htmlIcon.png");
const dockerIcon = getIcon("/icons/dockerIcon.png");
const huggingfaceIcon = getIcon("/icons/huggingfaceIcon.png");
const ollamaIcon = getIcon("/icons/ollamaIcon.png");
const bashIcon = getIcon("/icons/bashIcon.png");
const cppIcon = getIcon("/icons/cppIcon.png");
const debianIcon = getIcon("/icons/debianIcon.png");
const fastapiIcon = getIcon("/icons/fastapiIcon.png");
const flaskIcon = getIcon("/icons/flaskIcon.png");
const nginxIcon = getIcon("/icons/nginxIcon.png");

function createPiece() {
    const pieces = ["S", "Z", "T", "J", "O", "I", "L"];
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    const color = Math.floor(Math.random() * (colors.length - 1)) + 1;
    let matrix;
    if (type === 'I') {
        matrix = [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        matrix = [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
        ];
    } else if (type === 'J') {
        matrix = [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0],
        ];
    } else if (type === 'O') {
        matrix = [
            [1, 1],
            [1, 1],
        ];
    } else if (type === 'Z') {
        matrix = [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        matrix = [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        matrix = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    }
    matrix = matrix.map(row => row.map(value => value = value * color));
    return matrix;
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

const colors = [
        {icon: null, color: null},
        {icon: archIcon, color: "#1c7891"},
        {icon: javascriptIcon, color: "#a7a521"},
        {icon: linuxIcon, color: "#ca28bf"},
        {icon: nodejsIcon, color: "#217921"},
        {icon: numpyIcon, color: "#2e7d93"},
        {icon: opencvIcon, color: "#848789"},
        {icon: pythonIcon, color: "#3e9d2e"},
        {icon: pytorchIcon, color: "#c79436"},
        {icon: tensorflowIcon, color: "#c66e2b"},
        {icon: cssIcon, color: "#1f7ab3"},
        {icon: htmlIcon, color: "#d17727"},
        {icon: huggingfaceIcon, color: "#d6b244"},
        {icon: ollamaIcon, color: "#1c2abf"},
        {icon: flaskIcon, color: "#1659ac"},
        {icon: fastapiIcon, color: "#226c7b"},
        {icon: bashIcon, color: "#505377"},
        {icon: cppIcon, color: "#2c3b87"},
        {icon: nginxIcon, color: "#5fbb5b"},
        {icon: debianIcon, color: "#af2372"}

    ]
opencvIcon
pythonIcon
pytorchIcon
tensorflowIcon
function drawMatrix(matrix, offset={x: 0, y: 0}) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value].color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                const img = colors[value].icon;
                const padding = 0.1; 
                const maxSpace = 1 - (padding * 2); // The maximum width/height available

                // 1. Calculate the aspect ratio of the source image
                const imageRatio = img.width / img.height;

                let drawWidth, drawHeight;

                if (imageRatio > 1) {
                    // Image is wider than it is tall (landscape)
                    drawWidth = maxSpace;
                    drawHeight = maxSpace / imageRatio;
                } else {
                    // Image is taller than it is wide (portrait) or already perfect square
                    drawHeight = maxSpace;
                    drawWidth = maxSpace * imageRatio;
                }

                // 2. Center the image inside the allocated padded slot
                const offsetXInsideSquare = (maxSpace - drawWidth) / 2;
                const offsetYInsideSquare = (maxSpace - drawHeight) / 2;

                const finalX = x + offset.x + padding + offsetXInsideSquare;
                const finalY = y + offset.y + padding + offsetYInsideSquare;

                // 3. Draw the smooth, perfectly proportioned square icon
                context.drawImage(img, finalX, finalY, drawWidth, drawHeight);
            }
        })
    })
}

function combineMatrix(matrix, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) matrix[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function checkCollision(matrix, player) {
    let colliding = false;
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0 && player.pos.y + y >= gridHeight) {
                colliding = true;
            } else {
                if (value > 0 && matrix[y + player.pos.y]?.[x + player.pos.x] > 0) {
                    colliding = true;
                }
                if (value > 0 && (player.pos.x + x >= gridWidth || player.pos.x + x < 0)) {
                    colliding = true;
                }
            }
        });
    });
    return colliding;
}

function clearLines() {
    let rowCount = 1;
    for (let y = gridHeight - 1; y >= 0; y--) {
        if (staticMatrix[y].every(value => value !== 0)) {
            const row = staticMatrix.splice(y, 1)[0];
            staticMatrix.unshift(new Array(gridWidth).fill(0));
            y++;

            player.score += rowCount * 100;
            rowCount *= 2; 
        }
    }
}

async function move() {
    if (lose === false) {
        player.pos.y += 1;
        if (checkCollision(staticMatrix, player)) {
            player.pos.y -= 1;
            combineMatrix(staticMatrix, player);
            clearLines();
            player.pos.y = 0;
            player.pos.x = 4;
            player.matrix = createPiece();
        }
    }
}

const loseDisplay = document.getElementById('lose-display');
function restartGame() {
    lose = false;
    loseDisplay.style.visibility = 'hidden';
    loseDisplay.style.opacity = 0;
    tick = 0;
    player = {
        pos: { x: Math.floor(gridWidth / 2) - 1, y: 0 },
        matrix: null,
        score: 0
    };
    for (let h = 0; h < gridHeight; h++) {
        staticMatrix[h] = [];
        for (let w = 0; w < gridWidth; w++) {
            staticMatrix[h][w] = 0;
        }
    }
    player.matrix = createPiece();
}

const score = document.getElementById('score');
const loseScore = document.getElementById('end-score');
let tick = 0;

let player;

let speed = 50;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let lose;
restartGame();
let isVisible = false;
let lastTime = 0;

async function animate() {
    if (!isVisible) return;
    if (tick > speed) {
        move();
        tick = 0;
    } else {
        tick++;
    }
    if (checkCollision(staticMatrix, player) && player.pos.y < 1){
        lose = true;
        loseDisplay.style.opacity = 1;
        loseDisplay.style.visibility = 'visible';
        loseScore.textContent = "Score: " + player.score;
    }
    context.fillStyle = "#171717";
    context.fillRect(0, 0, gridWidth, gridHeight);
    drawMatrix(staticMatrix);
    drawMatrix(player.matrix, player.pos);
    score.textContent = "Score:  " + player.score;
    await delay(1);
    requestAnimationFrame(animate);
}

animate();

const observerOptions = {
    root: null, // defaults to the browser viewport
    threshold: 0.1 // Triggers when at least 10% of the canvas is visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Game is now in view
            if (!isVisible) {
                isVisible = true;
                lastTime = performance.now();
                requestAnimationFrame(animate);
                console.log("Game resumed");
            }
        } else {
            isVisible = false;
        }
    });
}, observerOptions);

observer.observe(canvas);

document.addEventListener('keydown', (e) => {
    if (lose) return;
    e.preventDefault();
    switch (e.key.toLowerCase()) {
        case "arrowleft":
        case "a":
            player.pos.x -= 1;
            if (checkCollision(staticMatrix, player)) player.pos.x += 1;
            break;
        case "arrowright":
        case "d":
            player.pos.x += 1;
            if (checkCollision(staticMatrix, player)) player.pos.x -= 1;
            break;
        case "arrowup":
        case "w":
            rotate(player.matrix, 1);
            if (checkCollision(staticMatrix, player)) rotate(player.matrix, -1);
            break;
        case 'arrowdown':
        case "s":
            speed = 1;
            break;
    }
})

document.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case "arrowdown":
        case "s":
            speed = 50;
            break;
    }
})

const retryButton = document.getElementById('restart-game');
retryButton.addEventListener('click', (e) => {
    restartGame();
});