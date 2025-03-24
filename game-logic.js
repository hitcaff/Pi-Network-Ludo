class GameState {
    constructor() {
        this.playerLevel = 0;
        this.tokensHome = 0;
        this.currentPool = null;
        this.players = [];
        this.currentTurn = 0;
        this.gameStarted = false;
        this.poolRewards = {
            'bronze': {
                entry: 0.5,
                pool: 2,
                rewards: [0.8, 0.4, 0.2, 0.1]
            },
            'silver': {
                entry: 1,
                pool: 4,
                rewards: [1.6, 0.8, 0.4, 0.2]
            },
            'gold': {
                entry: 2,
                pool: 8,
                rewards: [3.2, 1.6, 0.8, 0.4]
            },
            'platinum': {
                entry: 5,
                pool: 20,
                rewards: [8, 4, 2, 1]
            },
            'diamond': {
                entry: 10,
                pool: 40,
                rewards: [16, 8, 4, 2]
            }
        };
    }

    // Level calculation (1 level per 20 tokens brought home)
    calculateLevel() {
        this.playerLevel = Math.floor(this.tokensHome / 20);
        const levelElement = document.getElementById('player-level');
        if (levelElement) {
            levelElement.textContent = this.playerLevel;
        }
        return this.playerLevel;
    }

    // Add tokens brought home and update level
    addTokensHome(count) {
        this.tokensHome += count;
        this.calculateLevel();
        // Store progress
        this.saveProgress();
    }

    // Save progress to localStorage
    saveProgress() {
        localStorage.setItem('ludoNovaProgress', JSON.stringify({
            tokensHome: this.tokensHome,
            playerLevel: this.playerLevel,
            lastUpdated: new Date().toISOString()
        }));
    }

    // Load saved progress
    loadProgress() {
        const saved = JSON.parse(localStorage.getItem('ludoNovaProgress') || '{}');
        if (saved.tokensHome) {
            this.tokensHome = saved.tokensHome;
            this.calculateLevel();
        }
    }

    // Get pool requirements
    getPoolRequirements(poolType) {
        const requirements = {
            'bronze': 0,
            'silver': 5,
            'gold': 10,
            'platinum': 20,
            'diamond': 30
        };
        return requirements[poolType] || 0;
    }

    // Check if player meets pool requirements
    meetsPoolRequirements(poolType) {
        return this.playerLevel >= this.getPoolRequirements(poolType);
    }

    // Get pool rewards
    getPoolRewards(poolType) {
        return this.poolRewards[poolType] || this.poolRewards.bronze;
    }

    // Calculate potential rewards based on current position
    calculatePotentialReward(poolType, position) {
        const rewards = this.getPoolRewards(poolType).rewards;
        return position < rewards.length ? rewards[position] : 0;
    }

    // Initialize a new game
    startGame(poolType, players) {
        this.currentPool = poolType;
        this.players = players;
        this.currentTurn = 0;
        this.gameStarted = true;
        
        // Initialize game board state
        this.boardState = {
            tokens: {},
            dice: null,
            lastRoll: null
        };

        // Initialize tokens for each player
        players.forEach(player => {
            this.boardState.tokens[player.id] = {
                positions: [0, 0, 0, 0], // 4 tokens starting at home
                tokensHome: 0
            };
        });

        return this.boardState;
    }

    // Handle dice roll
    rollDice() {
        if (!this.gameStarted) return null;
        const roll = Math.floor(Math.random() * 6) + 1;
        this.boardState.lastRoll = roll;
        return roll;
    }

    // Move token
    moveToken(playerId, tokenIndex) {
        if (!this.gameStarted || this.currentTurn !== this.players.findIndex(p => p.id === playerId)) {
            return false;
        }

        const playerTokens = this.boardState.tokens[playerId];
        const currentPos = playerTokens.positions[tokenIndex];
        const newPos = currentPos + this.boardState.lastRoll;

        // Check if move is valid
        if (this.isValidMove(playerId, tokenIndex, newPos)) {
            playerTokens.positions[tokenIndex] = newPos;
            
            // Check if token reached home
            if (this.hasReachedHome(newPos)) {
                playerTokens.tokensHome++;
                // Update player's overall progress
                if (playerId === 'currentPlayer') {
                    this.addTokensHome(1);
                }
            }

            // Move to next player's turn
            this.currentTurn = (this.currentTurn + 1) % this.players.length;
            return true;
        }

        return false;
    }

    // Validate move
    isValidMove(playerId, tokenIndex, newPosition) {
        // Basic validation - can be expanded based on game rules
        return newPosition <= 57; // Standard Ludo board has 57 spaces
    }

    // Check if token has reached home
    hasReachedHome(position) {
        return position === 57;
    }

    // Check if game is over and distribute rewards
    checkGameOver() {
        if (!this.gameStarted) return false;

        // Check if any player has all tokens home
        for (const playerId in this.boardState.tokens) {
            if (this.boardState.tokens[playerId].tokensHome === 4) {
                // Get player's position (0-based index)
                const position = this.players.findIndex(p => p.id === playerId);
                
                // Calculate reward based on position and pool type
                const reward = this.calculatePotentialReward(this.currentPool, position);
                
                // If current player won, update their progress
                if (playerId === 'currentPlayer') {
                    this.addTokensHome(4);
                }

                return {
                    winner: playerId,
                    position: position + 1,
                    reward: reward
                };
            }
        }

        return false;
    }
}

// Initialize game state
const gameState = new GameState();

// Load saved progress when page loads
document.addEventListener('DOMContentLoaded', () => {
    gameState.loadProgress();
});
