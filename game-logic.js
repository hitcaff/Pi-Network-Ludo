class GameState {
    constructor() {
        this.players = [];
        this.currentPlayer = 0;
        this.gameType = null;
        this.board = null;
        this.dice = null;
    }
}

class LudoGame extends GameState {
    constructor() {
        super();
        this.gameType = "ludo";
        this.tokenPositions = {};
        this.tokensHome = {};
    }

    initializeGame(playerCount) {
        for (let i = 0; i < playerCount; i++) {
            this.players.push({
                id: i,
                tokens: [0, 0, 0, 0], // 4 tokens per player
                tokensHome: 0
            });
            this.tokenPositions[i] = new Array(4).fill(-1); // -1 means token is in starting position
        }
    }

    rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    moveToken(playerId, tokenId, steps) {
        // Implementation for token movement
        // Returns true if move is valid
        return true;
    }

    checkWinner() {
        const winner = this.players.find(player => player.tokensHome === 4);
        if (winner) {
            // Dispatch win event for the winning player
            const gameCompletedEvent = new CustomEvent('gameCompleted', {
                detail: {
                    isWinner: winner.id === 0, // Player 0 is the current user
                    gameType: 'ludo',
                    tokensHome: winner.tokensHome
                }
            });
            document.dispatchEvent(gameCompletedEvent);
        }
        return winner;
    }
}

class SnakeLadderGame extends GameState {
    constructor() {
        super();
        this.gameType = "snakeLadder";
        this.playerPositions = {};
        this.snakes = {
            16: 6, 47: 26, 49: 11, 56: 53,
            62: 19, 64: 60, 87: 24, 93: 73,
            95: 75, 98: 78
        };
        this.ladders = {
            1: 38, 4: 14, 9: 31, 21: 42,
            28: 84, 36: 44, 51: 67, 71: 91,
            80: 100
        };
    }

    initializeGame(playerCount) {
        for (let i = 0; i < playerCount; i++) {
            this.players.push({
                id: i,
                position: 0
            });
            this.playerPositions[i] = 0;
        }
    }

    movePlayer(playerId, steps) {
        let newPosition = this.playerPositions[playerId] + steps;
        
        if (this.snakes[newPosition]) {
            newPosition = this.snakes[newPosition];
        }
        
        if (this.ladders[newPosition]) {
            newPosition = this.ladders[newPosition];
        }
        
        this.playerPositions[playerId] = newPosition;
        return newPosition;
    }

    checkWinner() {
        const winner = this.players.find(player => player.position === 100);
        if (winner) {
            // Dispatch win event for the winning player
            const gameCompletedEvent = new CustomEvent('gameCompleted', {
                detail: {
                    isWinner: winner.id === 0, // Player 0 is the current user
                    gameType: 'snakeLadder',
                    position: winner.position
                }
            });
            document.dispatchEvent(gameCompletedEvent);
        }
        return winner;
    }
}

// Export game classes
window.LudoGame = LudoGame;
window.SnakeLadderGame = SnakeLadderGame;

// Add game completion listener
document.addEventListener('gameCompleted', (event) => {
    if (event.detail.isWinner && window.levelSystem) {
        // Update level system on win
        window.levelSystem.addWin();
        
        // Show winning notification with pool info
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        
        const progress = window.levelSystem.getProgress();
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-trophy text-yellow-300 text-2xl"></i>
                <div>
                    <div class="font-bold">Congratulations! You Won!</div>
                    <div class="text-sm">
                        Level ${progress.level} • ${progress.wins} Wins • 
                        ${progress.winsToNextLevel} wins to next level
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
});
