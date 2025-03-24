class GameState {
    constructor() {
        this.playerLevel = 0;
        this.tokensHome = 0;
        this.currentPool = null;
        this.players = [];
        this.currentTurn = 0;
        this.gameStarted = false;
        this.isPracticeMode = false;
        this.aiDifficulty = 'medium';
        this.roomName = null;
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
    startGame(options) {
        const {
            poolType = null,
            playerCount = 4,
            aiCount = 0,
            aiDifficulty = 'medium',
            roomName = null,
            isPracticeMode = false
        } = options;

        this.currentPool = poolType;
        this.isPracticeMode = isPracticeMode;
        this.aiDifficulty = aiDifficulty;
        this.roomName = roomName;
        this.players = [];
        this.currentTurn = 0;
        this.gameStarted = true;

        // Initialize game board state
        this.boardState = {
            tokens: {},
            dice: null,
            lastRoll: null
        };

        // Add human player
        this.players.push({
            id: 'currentPlayer',
            name: 'You',
            color: 'red',
            isAI: false
        });

        // Add other players (AI or empty slots for multiplayer)
        for (let i = 1; i < playerCount; i++) {
            if (i < aiCount + 1) {
                // Add AI player
                this.players.push({
                    id: `ai_${i}`,
                    name: `AI Player ${i}`,
                    color: ['green', 'yellow', 'blue'][i - 1],
                    isAI: true,
                    difficulty: aiDifficulty
                });
            } else {
                // Add empty slot for potential human player
                this.players.push({
                    id: `player_${i}`,
                    name: `Player ${i + 1}`,
                    color: ['green', 'yellow', 'blue'][i - 1],
                    isAI: false
                });
            }
        }

        // Initialize tokens for each player
        this.players.forEach(player => {
            this.boardState.tokens[player.id] = {
                positions: [0, 0, 0, 0], // 4 tokens starting at home
                tokensHome: 0
            };
        });

        return this.boardState;
    }

    // AI move calculation
    calculateAIMove(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || !player.isAI) return null;

        const tokens = this.boardState.tokens[playerId];
        const roll = this.boardState.lastRoll;
        
        // Different strategies based on difficulty
        switch (player.difficulty) {
            case 'easy':
                return this.calculateEasyAIMove(tokens, roll);
            case 'medium':
                return this.calculateMediumAIMove(tokens, roll);
            case 'hard':
                return this.calculateHardAIMove(tokens, roll);
            default:
                return this.calculateMediumAIMove(tokens, roll);
        }
    }

    calculateEasyAIMove(tokens, roll) {
        // Simple strategy: Move the first valid token
        for (let i = 0; i < tokens.positions.length; i++) {
            if (this.isValidMove(tokens.positions[i], roll)) {
                return i;
            }
        }
        return null;
    }

    calculateMediumAIMove(tokens, roll) {
        // Medium strategy: Prefer tokens that can reach home or avoid being captured
        let bestMove = null;
        let bestScore = -1;

        tokens.positions.forEach((pos, index) => {
            if (!this.isValidMove(pos, roll)) return;

            let score = 0;
            const newPos = pos + roll;

            // Prefer moves that reach home
            if (this.hasReachedHome(newPos)) score += 100;
            
            // Prefer moves that avoid being captured
            if (this.isTokenSafe(newPos)) score += 50;

            // Prefer moving tokens closer to home
            score += newPos;

            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        });

        return bestMove;
    }

    calculateHardAIMove(tokens, roll) {
        // Hard strategy: Consider multiple factors and look ahead
        let bestMove = null;
        let bestScore = -1;

        tokens.positions.forEach((pos, index) => {
            if (!this.isValidMove(pos, roll)) return;

            let score = 0;
            const newPos = pos + roll;

            // Reaching home is highest priority
            if (this.hasReachedHome(newPos)) score += 1000;
            
            // Safety is second priority
            if (this.isTokenSafe(newPos)) score += 500;

            // Consider capturing opponent tokens
            if (this.canCapture(newPos)) score += 300;

            // Consider blocking opponent tokens
            if (this.canBlock(newPos)) score += 200;

            // Progress towards home
            score += (newPos / 57) * 100;

            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        });

        return bestMove;
    }

    isTokenSafe(position) {
        // Check if token is on a safe square or with another token
        return position === 0 || // Home
               position === 57 || // Final square
               this.isSafeSquare(position) || // Safe squares
               this.hasOwnTokenOnSquare(position); // Stacked tokens
    }

    isSafeSquare(position) {
        // Define safe squares (e.g., starting squares, star squares)
        const safeSquares = [1, 9, 14, 22, 27, 35, 40, 48];
        return safeSquares.includes(position);
    }

    canCapture(position) {
        // Check if moving to this position would capture an opponent's token
        return Object.entries(this.boardState.tokens)
            .some(([playerId, tokens]) => {
                if (playerId === this.currentTurn) return false;
                return tokens.positions.some(pos => pos === position && !this.isTokenSafe(pos));
            });
    }

    canBlock(position) {
        // Check if this position would block opponent's tokens
        return Object.entries(this.boardState.tokens)
            .some(([playerId, tokens]) => {
                if (playerId === this.currentTurn) return false;
                return tokens.positions.some(pos => 
                    pos < position && pos + 6 >= position && !this.isTokenSafe(pos)
                );
            });
    }

    hasOwnTokenOnSquare(position) {
        // Check if player has another token on this square
        const currentTokens = this.boardState.tokens[this.currentTurn];
        return currentTokens.positions.filter(pos => pos === position).length > 1;
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
