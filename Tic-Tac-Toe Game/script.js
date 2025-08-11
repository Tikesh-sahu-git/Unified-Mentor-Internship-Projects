// Game Variables
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const gameStatus = document.getElementById('gameStatus');
const resetButton = document.getElementById('resetButton');
const confettiContainer = document.getElementById('confettiContainer');

// Audio Elements
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');

// Winning Conditions
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize the game board
function initializeBoard() {
    gameBoard.innerHTML = '';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    gameStatus.textContent = `Player ${currentPlayer}'s turn`;
    gameStatus.className = 'game-status';
    confettiContainer.innerHTML = '';
    
    // Create cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
}

// Handle cell click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    // If cell is already filled or game is not active, ignore the click
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Play click sound
    clickSound.currentTime = 0;
    clickSound.play();
    
    // Update game state and UI
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    
    // Check for win or draw
    checkGameResult();
}

// Check game result after each move
function checkGameResult() {
    let roundWon = false;
    
    // Check all winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        
        if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
            roundWon = true;
            highlightWinningCells([a, b, c]);
            break;
        }
    }
    
    // If won, update status and end game
    if (roundWon) {
        gameStatus.innerHTML = `<span class="victory-message">Player ${currentPlayer} wins! 🎉</span>`;
        gameActive = false;
        winSound.currentTime = 0;
        winSound.play();
        createConfetti();
        return;
    }
    
    // If all cells are filled (draw)
    if (!gameState.includes('')) {
        gameStatus.textContent = "Game ended in a draw!";
        gameActive = false;
        drawSound.currentTime = 0;
        drawSound.play();
        return;
    }
    
    // If game continues, switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatus.textContent = `Player ${currentPlayer}'s turn`;
}

// Highlight winning cells
function highlightWinningCells(cells) {
    cells.forEach(index => {
        document.querySelector(`.cell[data-index="${index}"]`).classList.add('winner');
    });
}

// Create confetti effect
function createConfetti() {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        
        // Apply styles
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${left}%`;
        confetti.style.animationDuration = `${animationDuration}s`;
        confetti.style.animationDelay = `${delay}s`;
        
        // Random shape
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        confettiContainer.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, (animationDuration + delay) * 1000);
    }
}

// Reset game
function resetGame() {
    initializeBoard();
}

// Event Listeners
resetButton.addEventListener('click', resetGame);

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initializeBoard);