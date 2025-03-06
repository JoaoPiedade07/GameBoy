const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const foodImage = new Image();
foodImage.src = "/snake_game/images/apple.png"

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let isPause = false;
let lastUpdateTime = 0;
let speed = 5; // Velocidade de movimento suave
let targetPosition = { ...snake[0] };

function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const deltaTime = timestamp - lastUpdateTime;
    lastUpdateTime = timestamp;

    update(deltaTime);
    draw();

    if (!gameOver && !isPause) {
        requestAnimationFrame(gameLoop);
    }
}

function drawGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "28px 'Press Start 2P', sans-serif"; // Garantir fallback
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Centralizar corretamente o texto
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}



// Desenhar o jogo
function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff00";
    snake.forEach((segment, index) => {
        ctx.beginPath();
        ctx.arc(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = "#ff0000";
    // Desenhar a comida
    ctx.drawImage(foodImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    foodImage.onload = () => {
        console.log("Imagem da comida carregada!");
    };

    document.getElementById("score").innerText = `Score: ${score}`;

    if (gameOver) {
        drawGameOver();
    }
}

// Atualizar o estado do jogo
function update(deltaTime) {
    if (gameOver || isPause) return;

    let head = snake[0];
    let speedFactor = (speed * deltaTime) / 1000;
    head.x += direction.x * speedFactor;
    head.y += direction.y * speedFactor;

    // Arredondar posição para verificar colisão
    let roundedX = Math.round(head.x);
    let roundedY = Math.round(head.y);

    // Verifica se a cabeça chegou ao próximo bloco
    if (roundedX !== targetPosition.x || roundedY !== targetPosition.y) {
        targetPosition = { x: roundedX, y: roundedY };
        snake.unshift({ ...targetPosition });

        if (targetPosition.x === food.x && targetPosition.y === food.y) {
            score++;
            placeFood();
        } else {
            snake.pop();
        }
    }

    // Verifica colisões
    if (targetPosition.x < 0 || targetPosition.x >= tileCount || targetPosition.y < 0 || targetPosition.y >= tileCount || 
        snake.slice(1).some(segment => segment.x === targetPosition.x && segment.y === targetPosition.y)) {
        gameOver = true;
        //mostrarPopup(`Game over! Seu score: ${score}`);
        if (gameOver) {
            setTimeout(resetGame, 3000); // Espera 3 segundos antes de resetar
            return;
        }
    }
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        placeFood();
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    isPause = false;
    placeFood();
    requestAnimationFrame(gameLoop);
}

function mostrarPopup(mensagem) {
    let popup = document.createElement("div");
    popup.className = "popup-alert";
    popup.innerText = mensagem;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("mostrar");
    }, 100);

    setTimeout(() => {
        popup.classList.remove("mostrar");
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

document.addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowUp":
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
});

placeFood();
requestAnimationFrame(gameLoop);
