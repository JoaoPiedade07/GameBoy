const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let bot = { x: -1, y: -1 };
let direction = { x: 0, y: 0};
let score = 0;
let botCount = 0;
let gameOver = false;
let isPause = false;

function gameLoop() {
    update();
    draw();
    if(!gameOver && isPause) {
        setTimeout(gameLoop, 100); //Call gameloop again after 100ms

    }
} 

//Draw the game 
function draw() {
    
    //Clear the canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff00";

    //Draw the Snake
    snake.forEach(segment =>{
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    //Draw the food
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    //Draw the bot
    if(bot.x !== -1 && bot.y !== -1) {
        ctx.fillStyle = "#00ffff";
        ctx.fillRect(bot.x * gridSize, bot.y * gridSize, gridSize, gridSize);
    }

    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("bot-count"),innerText = botCount;
}

//Update the game state
function update() {
    if(gameOver || isPause) return;

    // Calculate the new head position
    const head = { x:snake[0].x + direction.x, y: snake[0].y + direction.y };

    //check for wall collision
    if(head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        alert(`Game over! You score: ${score}`);
        resetGame();
        return;
    }

    //check for self-collection (ignore the head)
    if(snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)){
        gameOver = true;
        alert(`Game over! You score: ${score}`);
        resetGame();
        return;
    }

    //add the new snake to the snake
    snake.unshift(head);

    //check if the snake eats the food
    if(head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else if(head.x === bot.x && head.y === bot.y){
        botCount++;
        score += 5;
        bot = { x: -1, y: 1 };
        //set timeout place bot
        setTimeout(placeBot, 5000);
    } else {
        snake.pop(); //remove the tail if no food or bot eaten
    }
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    // ensure food doesn't spawn on the snake
    if(snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        placeFood();
    }
}

function placeBot() {
    bot.x = Math.floor(Math.random() * tileCount);
    bot.y = Math.floor(Math.random() * tileCount);

    // ensure food doesn't spawn on the snake
    if(snake.some(segment => segment.x === bot.x && segment.y === bot.y) || (food.x === bot.x & food.y === bot.y)) {
        placeBot();
    }
}

//reset the game
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0 , y: 0};
    score = 0;
    botCount = 0;
    gameOver = false;
    isPause = false;
    bot = { x: -1, y: -1 };
    placeFood();
    setTimeout(placeBot, 5000);
}

//Handle the keyboard input
document.addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowUp":
            if(direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if(direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if(direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if(direction.x === 0) direction = { x: 1, y: 0 };
            break;
        case " ": //Spacebar to pause/resume
            break;
    }
});

document.getElementById("up").addEventListener("click", () => {
    if(direction.y === 0) direction = { x: 0, y: -1 };
});
document.getElementById("down").addEventListener("click", () => {
    if(direction.y === 0) direction = { x: 0, y: 1 };
});
document.getElementById("left").addEventListener("click", () => {
    if(direction.y === 0) direction = { x: -1, y: 0 };
});
document.getElementById("right").addEventListener("click", () => {
    if(direction.y === 0) direction = { x: 1, y: 0 };
});

// handle the pause/resume button
document.getElementById("pause-button").addEventListener("click", () => {
    isPause = !isPause;
    document.getElementById("pause-button").innerText = isPause ? "Resume" : "Pause";
}) 

//handle the reset button
document.getElementById("reset-button").addEventListener("click", resetGame);

//start the game
placeFood();
setTimeout(placeBot, 5000);
gameLoop();