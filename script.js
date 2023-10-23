document.addEventListener('DOMContentLoaded', function() {
    let score = 0;
    let timer = 10;
    let level = 1;
    let lives = 3;
    let isGameRunning = false;
    let timerInterval;
    let colorChangeInterval;

    const grid = document.getElementById('grid');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const livesDisplay = document.getElementById('lives');

    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');

    function getRandomColor() {
        const colors = ['red', 'green', 'blue', 'yellow'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function changeColor() {
        const randomGridIndex = Math.floor(Math.random() * 16);
        grid.children[randomGridIndex].style.backgroundColor = getRandomColor();
        grid.children[randomGridIndex].dataset.color = grid.children[randomGridIndex].style.backgroundColor;
    }

    function createGrid() {
        grid.innerHTML = '';
        let colorChangeCount = level * 5 + 10000; 

        for (let i = 0; i < 16; i++) {
            const gridItem = document.createElement('div');
            gridItem.style.backgroundColor = getRandomColor();
            gridItem.dataset.color = gridItem.style.backgroundColor;
            gridItem.addEventListener('click', handleGridClick);
            grid.appendChild(gridItem);

            gridItem.addEventListener('click', function() {
                this.style.backgroundColor = getRandomColor();
                this.dataset.color = this.style.backgroundColor;
            });
        }

        colorChangeInterval = 2500 - (level - 1) * 500;

        let changeColorCounter = 0;
        const maxChangeColorCount = colorChangeCount;

        function changeColorLoop() {
            if (changeColorCounter < maxChangeColorCount) {
                changeColor();
                changeColorCounter++;
                setTimeout(changeColorLoop, colorChangeInterval);
            }
        }

        changeColorLoop();
    }

    function handleGridClick() {
        if (isGameRunning) {
            if (this.dataset.color === 'green') {
                score += 200;
            } else if (this.dataset.color === 'blue') {
                score -= 100;
            } else if (this.dataset.color === 'yellow') {
                score -= 100;
                for (let i = 0; i < 20; i++) {
                    changeColor();
                }
            } else if (this.dataset.color === 'red') {
                if (lives > 0) {
                    lives--;
                    score -= 200;
                    for (let i = 0; i < 20; i++) {
                        changeColor();
                    }
                } else {
                    endGame();
                    return;
                }
            }
            score = Math.max(score, 0);
            scoreDisplay.textContent = score;
            livesDisplay.textContent = lives;
        }
    }

    function startGame() {
    
        isGameRunning = true;
        startButton.disabled = true;
    
        timerInterval = setInterval(function() {
            timer--;
            timerDisplay.textContent = timer;
    
            if (timer === 0) {
                clearInterval(timerInterval);
                isGameRunning = false;
                startButton.disabled = false;
    
                if (level < 5) {
                    level++;
                    timer = 10;
                    document.getElementById('level').textContent = level;
                    createGrid();
                    startGame();
                } else {
                    endGame();
                }
            }
        }, 1000);
    }

    function endGame() {
        const username = document.getElementById('username').value;
        
        isGameRunning = false;
        startButton.disabled = false;
        resetButton.disabled = false;
    
        alert('Game Over! Your final score is: ' + score);
    
        var userToken = localStorage.getItem('userToken');
        fetch('https://ets-pemrograman-web-f.cyclic.app/scores/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userToken
            },
            body: JSON.stringify({
                nama: username,
                score: score.toString() 
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Terjadi kesalahan:', error);
        });
    
        resetGame();
    }    

    function resetGame() {
        clearInterval(timerInterval);
        let allTimeouts = setTimeout(function() {});
        while (allTimeouts--) clearTimeout(allTimeouts);
        isGameRunning = false;
        startButton.disabled = false;
        resetButton.disabled = false;
        score = 0;
        level = 1;
        timer = 10;
        lives = 3;
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timer;
        createGrid();
    }

    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);

    createGrid();
});

document.getElementById('rules').addEventListener('click', function() {
    document.getElementById('rulesContent').style.display = 'block';
});

document.getElementById('closeRules').addEventListener('click', function() {
    document.getElementById('rulesContent').style.display = 'none';
});