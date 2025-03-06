// Inicialização do jogo
console.groupCollapsed('Inicialização do Jogo');
console.log('%cDOM carregado - Configurando jogo...', 'color: #2ecc71');

const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
console.log(`Canvas configurado: ${canvas.width}x${canvas.height}px`);
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const foodImage = new Image();
foodImage.src = "/snake_game/images/apple.png";
foodImage.onload = () => {
    console.log('Sprites carregados com sucesso');
};
foodImage.onerror = (e) => {
    console.error('Erro ao carregar sprite:', e);
};

document.addEventListener("DOMContentLoaded", function () {
    const h3 = document.querySelector("h3");
    const texts = ["Made by João Piedade", "Enjoy it!"]; // Adicione quantas frases quiser
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentText = texts[textIndex]; // Frase atual

        if (!isDeleting && charIndex < currentText.length) {
            h3.textContent += currentText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 100); // Velocidade ao escrever
        } else if (isDeleting && charIndex > 0) {
            h3.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            setTimeout(typeWriter, 50); // Velocidade ao apagar
        } else {
            isDeleting = !isDeleting; // Alterna entre escrever/apagar
            
            if (!isDeleting) {
                textIndex = (textIndex + 1) % texts.length; // Muda para a próxima frase
            }
            
            setTimeout(typeWriter, 2000); // Pausa antes de recomeçar
        }
    }

    h3.textContent = ""; // Começa com o texto vazio
    typeWriter(); // Inicia o efeito
});

console.groupCollapsed('Sistema de Jogo');
let snake = [{ x: 10, y: 10 }];
console.log('Cobra inicializada na posição:', snake[0]);
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let isPause = false;
let lastUpdateTime = 0;
let speed = 5; // Velocidade de movimento suave
let targetPosition = { ...snake[0] };
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

document.getElementById("bestOf").innerText = `Best score: ${bestScore}`;

function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    console.log('Primeiro frame do game loop iniciado');
    const deltaTime = timestamp - lastUpdateTime;
    lastUpdateTime = timestamp;

    update(deltaTime);
    draw();

    if (!gameOver && !isPause) {
        requestAnimationFrame(gameLoop);
    }
}

function checkCollisions() {
    const head = snake[0];
    const wallCollision = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
    const selfCollision = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    
    if(wallCollision) console.warn('Colisão com parede detectada!');
    if(selfCollision) console.warn('Colisão com corpo detectada!');
    
    return wallCollision || selfCollision;
}

// Handle keyboard "A" key
document.addEventListener("keydown", function (event) {
    if (gameOver && event.key.toLowerCase() === "a") {
        handleReset();
    }
});

// Handle on-screen "A" button click
document.getElementById("a-button").addEventListener("click", () => {
    if (gameOver) handleReset();
});

function handleReset() {
    gameOver = false;
    resetGame();
    requestAnimationFrame(gameLoop);
}

function drawGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "28px 'Press Start 2P', sans-serif"; // Fonte para "GAME OVER"
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Mantém alinhado corretamente

    // Desenha "GAME OVER"
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

    // Define uma fonte menor para o Score e o "Press A to continue"
    ctx.font = "18px 'Press Start 2P', sans-serif"; 

    // Desenha o Score
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    // Desenha "Press A to continue" um pouco abaixo do Score
    ctx.font = "14px 'Press Start 2P', sans-serif"; 
    ctx.fillText("Press A to continue", canvas.width / 2, canvas.height / 2 + 40);
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
    }

    if(score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById("bestOf").innerText = `Best score: ${bestScore}`;
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
    console.warn('--- REINICIANDO JOGO ---');
    console.log('Estado anterior:', {snake, score});
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    isPause = false;
    placeFood();
    console.log('Novo estado:', {snake, score});
    if(score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById("bestOf").innerText = `Best score: ${bestScore}`;
    }
    //requestAnimationFrame(gameLoop);
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

document.getElementById("up").addEventListener("click", () => {
    if (direction.y === 0) direction = { x: 0, y: -1 };
});
document.getElementById("down").addEventListener("click", () => {
    if (direction.y === 0) direction = { x: 0, y: 1 };
});
document.getElementById("left").addEventListener("click", () => {
    if (direction.x === 0) direction = { x: -1, y: 0 };
});
document.getElementById("right").addEventListener("click", () => {
    if (direction.x === 0) direction = { x: 1, y: 0 };
});

placeFood();
requestAnimationFrame(gameLoop);
