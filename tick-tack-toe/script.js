const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const suggestButton = document.getElementById('suggestButton');
let isXTurn = true;
let gameActive = true;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Minimax algorithm implementation
function minimax(board, depth, isMaximizing, player) {
    const scores = {
        X: 1,
        O: -1,
        draw: 0
    };

    // Check terminal states
    const result = getGameResult();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].textContent === '') {
                cells[i].textContent = player;
                cells[i].classList.add(player.toLowerCase());
                const score = minimax(board, depth + 1, false, player === 'X' ? 'O' : 'X');
                cells[i].textContent = '';
                cells[i].classList.remove(player.toLowerCase());
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].textContent === '') {
                cells[i].textContent = player;
                cells[i].classList.add(player.toLowerCase());
                const score = minimax(board, depth + 1, true, player === 'X' ? 'O' : 'X');
                cells[i].textContent = '';
                cells[i].classList.remove(player.toLowerCase());
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function getGameResult() {
    if (checkWin('x')) return 'X';
    if (checkWin('o')) return 'O';
    if (isDraw()) return 'draw';
    return null;
}

function findBestMove() {
    const currentPlayer = isXTurn ? 'X' : 'O';
    let bestScore = isXTurn ? -Infinity : Infinity;
    let bestMove = -1;

    for (let i = 0; i < cells.length; i++) {
        if (cells[i].textContent === '') {
            cells[i].textContent = currentPlayer;
            cells[i].classList.add(currentPlayer.toLowerCase());
            const score = minimax(board, 0, !isXTurn, currentPlayer === 'X' ? 'O' : 'X');
            cells[i].textContent = '';
            cells[i].classList.remove(currentPlayer.toLowerCase());

            if (isXTurn && score > bestScore) {
                bestScore = score;
                bestMove = i;
            } else if (!isXTurn && score < bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function suggestMove() {
    if (!gameActive) return;
    
    const bestMove = findBestMove();
    if (bestMove !== -1) {
        // Remove any existing suggestions
        cells.forEach(cell => cell.classList.remove('suggested'));
        // Add new suggestion
        cells[bestMove].classList.add('suggested');
        setTimeout(() => {
            cells[bestMove].classList.remove('suggested');
        }, 1500);
    }
}

function handleCellClick(e) {
    const cell = e.target;
    const currentClass = isXTurn ? 'x' : 'o';

    if (cell.textContent !== '' || !gameActive) return;

    placeMark(cell, currentClass);
    
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        updateStatus();
    }
}

function placeMark(cell, currentClass) {
    cell.textContent = currentClass.toUpperCase();
    cell.classList.add(currentClass);
}

function swapTurns() {
    isXTurn = !isXTurn;
}

function updateStatus() {
    status.textContent = `Player ${isXTurn ? 'X' : 'O'}'s turn`;
}

function checkWin(currentClass) {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function getWinningCombination(currentClass) {
    return winningCombinations.find(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function highlightWinningCells(winningCombination) {
    winningCombination.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.textContent !== '';
    });
}

function endGame(draw) {
    gameActive = false;
    if (draw) {
        status.textContent = 'Game ended in a draw!';
    } else {
        const winningCombination = getWinningCombination(isXTurn ? 'x' : 'o');
        highlightWinningCells(winningCombination);
        status.textContent = `Player ${isXTurn ? 'X' : 'O'} wins!`;
    }
}

function restartGame() {
    isXTurn = true;
    gameActive = true;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });
    updateStatus();
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);
suggestButton.addEventListener('click', suggestMove); 