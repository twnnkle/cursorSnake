const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');

let gridSize = 20;
let tileCount = 20;

// Добавляем градиент для змейки
const snakeGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
snakeGradient.addColorStop(0, '#00ff00');
snakeGradient.addColorStop(1, '#008800');

let snake = [
    { x: 10, y: 10 }
];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};
let dx = 0;
let dy = 0;
let score = 0;

// Добавляем эффект частиц
let particles = [];

// В начало файла добавляем переменные для отслеживания свайпов
let touchStartX = null;
let touchStartY = null;

// Добавляем обработчики для сенсорного управления
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(event) {
    event.preventDefault();
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    event.preventDefault();
    
    let touchEndX = event.touches[0].clientX;
    let touchEndY = event.touches[0].clientY;

    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;

    // Минимальное расстояние для определения свайпа
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        // Определяем основное направление свайпа
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Горизонтальный свайп
            if (deltaX > 0 && dx !== -1) { // Свайп вправо
                dx = 1;
                dy = 0;
            } else if (deltaX < 0 && dx !== 1) { // Свайп влево
                dx = -1;
                dy = 0;
            }
        } else {
            // Вертикальный свайп
            if (deltaY > 0 && dy !== -1) { // Свайп вниз
                dx = 0;
                dy = 1;
            } else if (deltaY < 0 && dy !== 1) { // Свайп вверх
                dx = 0;
                dy = -1;
            }
        }
        
        // Сбрасываем начальные координаты
        touchStartX = null;
        touchStartY = null;
    }
}

// Добавляем мета-тег для мобильных устройств в HTML
document.head.insertAdjacentHTML('beforeend', 
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'
);

// Функция для адаптации размера canvas под мобильные устройства
function resizeCanvas() {
    if (window.innerWidth <= 768) {
        canvas.width = 300;
        canvas.height = 300;
    } else {
        canvas.width = 400;
        canvas.height = 400;
    }
    
    // Пересчитываем размер сетки, сохраняя количество клеток
    gridSize = canvas.width / tileCount;
    
    // Обновляем градиент
    snakeGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    snakeGradient.addColorStop(0, '#00ff00');
    snakeGradient.addColorStop(1, '#008800');
    
    // Проверяем, не вышла ли еда или змейка за пределы поля
    if (food.x >= tileCount) food.x = tileCount - 1;
    if (food.y >= tileCount) food.y = tileCount - 1;
    
    snake = snake.map(segment => ({
        x: Math.min(segment.x, tileCount - 1),
        y: Math.min(segment.y, tileCount - 1)
    }));
}

// Вызываем функцию при загрузке и изменении размера окна
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function drawGame() {
    clearCanvas();
    updateParticles();
    drawParticles();
    moveSnake();
    drawSnake();
    drawFood();
    
    if (gameOver()) {
        showGameOver();
        return;
    }
    
    setTimeout(drawGame, 100);
}

function clearCanvas() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Добавляем сетку
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    for(let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = snakeGradient;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
    });
}

function drawFood() {
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function createParticles(x, y) {
    for(let i = 0; i < 10; i++) {
        particles.push({
            x: x * gridSize + gridSize/2,
            y: y * gridSize + gridSize/2,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        return p.life > 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = `rgba(0, 255, 0, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        createParticles(food.x, food.y);
        generateFood();
    } else {
        snake.pop();
    }
}

function showGameOver() {
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
    setTimeout(() => {
        gameOverScreen.style.display = 'none';
        resetGame();
    }, 2000);
}

function generateFood() {
    food.x = Math.floor(Math.random() * (tileCount - 1));
    food.y = Math.floor(Math.random() * (tileCount - 1));
}

function gameOver() {
    const head = snake[0];
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    dx = 0;
    dy = 0;
    score = 0;
    particles = [];
    scoreElement.textContent = score;
    drawGame();
}

drawGame();
