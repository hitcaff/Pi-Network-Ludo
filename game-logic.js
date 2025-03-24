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
        return this.players.find(player => player.tokensHome === 4);
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
        return this.players.find(player => player.position === 100);
    }
}

// Export game classes
window.LudoGame = LudoGame;
window.SnakeLadderGame = SnakeLadderGame;
