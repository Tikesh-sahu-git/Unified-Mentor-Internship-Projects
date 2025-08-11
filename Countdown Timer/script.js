document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const targetDateInput = document.getElementById('target-date');
    const targetTimeInput = document.getElementById('target-time');
    const flipCards = {
        days: document.querySelector('.flip-card.days'),
        hours: document.querySelector('.flip-card.hours'),
        minutes: document.querySelector('.flip-card.minutes'),
        seconds: document.querySelector('.flip-card.seconds')
    };
    const messageElement = document.getElementById('message');
    const tickSound = document.getElementById('tick-sound');
    const completeSound = document.getElementById('complete-sound');
    
    let countdownInterval;
    let previousValues = {};
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    targetDateInput.setAttribute('min', today);
    
    startBtn.addEventListener('click', startCountdown);
    resetBtn.addEventListener('click', resetCountdown);
    
    function startCountdown() {
        // Clear any existing countdown
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        // Hide message if shown
        messageElement.classList.remove('active');
        
        // Get user input
        const targetDate = targetDateInput.value;
        const targetTime = targetTimeInput.value;
        
        if (!targetDate || !targetTime) {
            showMessage('Please select both date and time');
            return;
        }
        
        // Combine date and time and create target date object
        const targetDateTime = new Date(`${targetDate}T${targetTime}`);
        
        // Check if target time is in the future
        if (targetDateTime <= new Date()) {
            showMessage('Please select a future date and time');
            return;
        }
        
        // Initialize previous values
        previousValues = {
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00'
        };
        
        // Start the countdown
        updateCountdown(targetDateTime);
        countdownInterval = setInterval(() => updateCountdown(targetDateTime), 1000);
    }
    
    function updateCountdown(targetDateTime) {
        const now = new Date();
        const timeRemaining = targetDateTime - now;
        
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            displayComplete();
            return;
        }
        
        // Calculate days, hours, minutes, seconds
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        // Format with leading zeros
        const formattedDays = formatTime(days);
        const formattedHours = formatTime(hours);
        const formattedMinutes = formatTime(minutes);
        const formattedSeconds = formatTime(seconds);
        
        // Update display with flip animation if value changed
        updateFlipCard('days', formattedDays);
        updateFlipCard('hours', formattedHours);
        updateFlipCard('minutes', formattedMinutes);
        updateFlipCard('seconds', formattedSeconds);
        
        // Play tick sound for seconds
        if (formattedSeconds !== previousValues.seconds) {
            playTickSound();
        }
        
        // Store current values for next comparison
        previousValues = {
            days: formattedDays,
            hours: formattedHours,
            minutes: formattedMinutes,
            seconds: formattedSeconds
        };
    }
    
    function updateFlipCard(type, newValue) {
        if (previousValues[type] !== newValue) {
            const card = flipCards[type];
            const front = card.querySelector('.flip-card-front span');
            const back = card.querySelector('.flip-card-back span');
            
            // Set the new value on the back before flipping
            back.textContent = newValue;
            
            // Trigger flip animation
            card.classList.add('flip');
            
            // After animation completes, update front and reset
            setTimeout(() => {
                front.textContent = newValue;
                card.classList.remove('flip');
            }, 600);
        }
    }
    
    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }
    
    function displayComplete() {
        showMessage('COUNTDOWN COMPLETE!');
        playCompleteSound();
        triggerConfetti();
    }
    
    function resetCountdown() {
        clearInterval(countdownInterval);
        messageElement.classList.remove('active');
        
        // Reset all flip cards to 00
        Object.values(flipCards).forEach(card => {
            const front = card.querySelector('.flip-card-front span');
            const back = card.querySelector('.flip-card-back span');
            front.textContent = '00';
            back.textContent = '00';
            card.classList.remove('flip');
        });
        
        // Reset previous values
        previousValues = {
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00'
        };
    }
    
    function showMessage(text) {
        messageElement.textContent = text;
        messageElement.classList.add('active');
    }
    
    function playTickSound() {
        tickSound.currentTime = 0;
        tickSound.play().catch(e => console.log('Audio playback prevented:', e));
    }
    
    function playCompleteSound() {
        completeSound.currentTime = 0;
        completeSound.play().catch(e => console.log('Audio playback prevented:', e));
    }
    
    function triggerConfetti() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            spread: 90,
            ticks: 100
        };
        
        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }
        
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
        
        // Continue confetti for 5 seconds
        const duration = 5 * 1000;
        const end = Date.now() + duration;
        
        const interval = setInterval(() => {
            if (Date.now() > end) {
                return clearInterval(interval);
            }
            
            confetti({
                ...defaults,
                particleCount: 10,
                scalar: 0.75,
                shapes: ['circle', 'square']
            });
        }, 250);
    }
});