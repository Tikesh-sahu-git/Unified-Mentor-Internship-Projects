document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameBoard = document.getElementById('game-board');
    const movesDisplay = document.getElementById('moves');
    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const newGameBtn = document.getElementById('new-game-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const finalScore = document.getElementById('final-score');
    const starsContainer = document.getElementById('stars');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Game state
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let pairsFound = 0;
    let timer;
    let seconds = 0;
    let gameStarted = false;
    let currentDifficulty = 'easy';
    let score = 0;
    let maxPairs = 8; // Default for easy mode

    // Emoji sets for different difficulties
    const emojiSets = {
        easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
        medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐮'],
        hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐮', '🐷', '🐸']
    };

    // Initialize game
    function initGame() {
        // Reset game state
        moves = 0;
        pairsFound = 0;
        seconds = 0;
        score = 0;
        gameStarted = false;
        updateDisplay();
        
        // Clear board and timer
        gameBoard.innerHTML = '';
        clearInterval(timer);
        
        // Set grid class based on difficulty
        gameBoard.className = 'game-board';
        gameBoard.classList.add(`grid-${currentDifficulty}`);
        
        // Get emoji set for current difficulty
        const emojis = emojiSets[currentDifficulty];
        maxPairs = emojis.length;
        
        // Create pairs of cards
        const cardValues = [...emojis, ...emojis];
        
        // Shuffle cards
        shuffleArray(cardValues);
        
        // Create card elements
        cards = cardValues.map((value, index) => createCard(value, index));
        
        // Add cards to board
        cards.forEach(card => gameBoard.appendChild(card));
        
        // Hide win message
        winMessage.classList.remove('show');
    }

    // Create a card element
    function createCard(value, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.dataset.index = index;
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        cardFront.textContent = value;
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', flipCard);
        
        return card;
    }

    // Flip a card
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (this.classList.contains('matched')) return;
        
        // Start timer on first move
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        
        this.classList.add('flipped');
        
        if (!hasFlippedCard) {
            // First click
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second click
        secondCard = this;
        moves++;
        updateScore();
        updateDisplay();
        checkForMatch();
    }

    // Check for match
    function checkForMatch() {
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;
        
        if (isMatch) {
            disableCards();
            pairsFound++;
            
            // Check if game is over
            if (pairsFound === maxPairs) {
                endGame();
            }
        } else {
            unflipCards();
        }
    }

    // Disable matched cards
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        resetBoard();
    }

    // Unflip non-matching cards
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            resetBoard();
        }, 1000);
    }

    // Reset board state
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Update display
    function updateDisplay() {
        movesDisplay.textContent = moves;
        timeDisplay.textContent = `${seconds}s`;
        scoreDisplay.textContent = score;
    }

    // Update score based on moves and time
    function updateScore() {
        // Base score calculation
        let baseScore = 1000;
        
        // Penalty for moves (more moves = lower score)
        const movePenalty = moves * 5;
        
        // Bonus for time (faster completion = higher score)
        const timeBonus = Math.max(0, 300 - seconds);
        
        // Calculate final score
        score = Math.max(0, baseScore - movePenalty + timeBonus);
        
        // Ensure score doesn't go below 0
        score = Math.max(0, score);
    }

    // Start timer
    function startTimer() {
        clearInterval(timer);
        seconds = 0;
        updateDisplay();
        
        timer = setInterval(() => {
            seconds++;
            updateDisplay();
        }, 1000);
    }

    // End game
    function endGame() {
        clearInterval(timer);
        
        // Calculate star rating (1-5 stars)
        const starRating = calculateStarRating();
        
        // Show final stats
        finalMoves.textContent = moves;
        finalTime.textContent = seconds;
        finalScore.textContent = score;
        
        // Display stars
        starsContainer.innerHTML = '';
        for (let i = 0; i < starRating; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.innerHTML = '★';
            starsContainer.appendChild(star);
        }
        
        // Show win message
        winMessage.classList.add('show');
    }

    // Calculate star rating based on performance
    function calculateStarRating() {
        // Efficiency ratio (lower is better)
        const efficiency = moves / maxPairs;
        
        // Determine star rating
        if (efficiency <= 1.5) return 5;
        if (efficiency <= 2) return 4;
        if (efficiency <= 2.5) return 3;
        if (efficiency <= 3) return 2;
        return 1;
    }

    // Event listeners
    newGameBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
    
    // Difficulty selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
            initGame();
        });
    });

    // Initialize game on load
    initGame();
});