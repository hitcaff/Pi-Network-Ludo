class UIController {
    constructor(gameState) {
        this.gameState = gameState;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.updatePassTimers();
        
        // Start timer update interval
        setInterval(() => this.updatePassTimers(), 60000); // Update every minute
    }

    setupEventListeners() {
        // Game mode selection
        document.getElementById('practice-mode').addEventListener('click', () => {
            document.getElementById('practice-modal').classList.remove('hidden');
        });

        document.getElementById('multiplayer-mode').addEventListener('click', () => {
            document.getElementById('pool-selection').classList.remove('hidden');
        });

        // Practice mode setup
        document.querySelectorAll('.ai-count-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.ai-count-btn').forEach(btn => btn.classList.remove('bg-blue-700'));
                e.target.classList.add('bg-blue-700');
            });
        });

        document.querySelectorAll('.ai-difficulty-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.ai-difficulty-btn').forEach(btn => btn.classList.remove('ring-2'));
                e.target.classList.add('ring-2', 'ring-white');
            });
        });

        document.getElementById('start-practice').addEventListener('click', () => {
            const selectedCount = document.querySelector('.ai-count-btn.bg-blue-700')?.dataset.count || '3';
            const selectedDifficulty = document.querySelector('.ai-difficulty-btn.ring-2')?.dataset.difficulty || 'medium';
            
            this.startPracticeGame(parseInt(selectedCount), selectedDifficulty);
            document.getElementById('practice-modal').classList.add('hidden');
        });

        document.getElementById('close-practice-modal').addEventListener('click', () => {
            document.getElementById('practice-modal').classList.add('hidden');
        });

        // Room management
        document.getElementById('create-room').addEventListener('click', () => {
            const roomName = document.getElementById('room-name').value.trim();
            if (roomName) {
                this.createRoom(roomName);
            } else {
                piNetwork.showError('Please enter a room name');
            }
        });

        document.getElementById('join-room').addEventListener('click', () => {
            const roomName = document.getElementById('room-name').value.trim();
            if (roomName) {
                this.joinRoom(roomName);
            } else {
                piNetwork.showError('Please enter a room name');
            }
        });

        document.getElementById('close-room-modal').addEventListener('click', () => {
            document.getElementById('room-modal').classList.add('hidden');
        });

        // Pool selection
        document.querySelectorAll('.play-pool').forEach(button => {
            const poolType = button.dataset.pool;
            button.addEventListener('click', () => this.handlePoolSelection(poolType));
        });

        // Player count selection
        document.querySelectorAll('.player-count-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.player-count-btn').forEach(btn => btn.classList.remove('bg-blue-700'));
                e.target.classList.add('bg-blue-700');
                this.showRoomModal();
            });
        });

        // Slider navigation
        document.getElementById('slide-left').addEventListener('click', () => {
            const container = document.getElementById('pool-container');
            container.scrollBy({
                left: -container.offsetWidth,
                behavior: 'smooth'
            });
        });

        document.getElementById('slide-right').addEventListener('click', () => {
            const container = document.getElementById('pool-container');
            container.scrollBy({
                left: container.offsetWidth,
                behavior: 'smooth'
            });
        });

        // Game controls
        const rollDiceBtn = document.getElementById('roll-dice');
        if (rollDiceBtn) {
            rollDiceBtn.addEventListener('click', () => this.handleDiceRoll());
        }

        const leaveGameBtn = document.getElementById('leave-game');
        if (leaveGameBtn) {
            leaveGameBtn.addEventListener('click', () => this.handleLeaveGame());
        }

        // Canvas click for token movement
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    showRoomModal() {
        document.getElementById('room-modal').classList.remove('hidden');
    }

    async createRoom(roomName) {
        // Here you would integrate with your backend
        console.log('Creating room:', roomName);
        // For now, just start the game
        this.startMultiplayerGame(roomName);
    }

    async joinRoom(roomName) {
        // Here you would integrate with your backend
        console.log('Joining room:', roomName);
        // For now, just start the game
        this.startMultiplayerGame(roomName);
    }

    startPracticeGame(aiCount, difficulty) {
        const options = {
            playerCount: aiCount + 1,
            aiCount: aiCount,
            aiDifficulty: difficulty,
            isPracticeMode: true
        };

        this.gameState.startGame(options);
        document.getElementById('game-selection').classList.add('hidden');
        document.getElementById('game-board').classList.remove('hidden');
        this.initializeGame();
    }

    startMultiplayerGame(roomName) {
        const playerCount = document.querySelector('.player-count-btn.bg-blue-700')?.dataset.count || '4';
        const poolType = this.gameState.currentPool;

        const options = {
            poolType: poolType,
            playerCount: parseInt(playerCount),
            roomName: roomName,
            isPracticeMode: false
        };

        this.gameState.startGame(options);
        document.getElementById('room-modal').classList.add('hidden');
        document.getElementById('game-selection').classList.add('hidden');
        document.getElementById('game-board').classList.remove('hidden');
        this.initializeGame();
    }

    async handlePoolSelection(poolType) {
        if (!piNetwork.authenticated) {
            piNetwork.showError('Please authenticate first!');
            return;
        }

        // Check if player meets level requirement or has access pass
        if (!piNetwork.hasPoolAccess(poolType)) {
            const purchase = confirm(`You need to be level ${this.gameState.getPoolRequirements(poolType)} to access this pool. Would you like to purchase a 3-day access pass for 1 Pi?`);
            if (purchase) {
                const payment = await piNetwork.purchaseAccessPass(poolType);
                if (!payment) return;
            } else {
                return;
            }
        }

        // Pay entry fee and start game
        const payment = await piNetwork.enterPool(poolType);
        if (payment) {
            document.getElementById('game-selection').classList.add('hidden');
            document.getElementById('game-board').classList.remove('hidden');
            this.initializeGame(poolType);
        }
    }

    updatePassTimers() {
        const passes = JSON.parse(localStorage.getItem('poolAccessPasses') || '{}');
        const now = new Date();

        Object.entries(passes).forEach(([poolType, expiryDateStr]) => {
            const expiryDate = new Date(expiryDateStr);
            const timerElement = document.querySelector(`[data-pool="${poolType}"]`)
                .closest('.flex-none')
                .querySelector('.pass-timer');
            
            if (expiryDate > now) {
                const hours = Math.floor((expiryDate - now) / (1000 * 60 * 60));
                const minutes = Math.floor(((expiryDate - now) % (1000 * 60 * 60)) / (1000 * 60));
                
                timerElement.classList.remove('hidden');
                timerElement.querySelector('span').textContent = `${hours}h ${minutes}m`;
            } else {
                timerElement.classList.add('hidden');
                delete passes[poolType];
            }
        });

        localStorage.setItem('poolAccessPasses', JSON.stringify(passes));
    }

    initializeGame(poolType) {
        // Set up canvas size
        this.canvas.width = 600;
        this.canvas.height = 600;

        // Initialize game with 4 players
        const players = [
            { id: 'currentPlayer', name: 'You', color: 'red' },
            { id: 'player2', name: 'Player 2', color: 'green' },
            { id: 'player3', name: 'Player 3', color: 'yellow' },
            { id: 'player4', name: 'Player 4', color: 'blue' }
        ];

        this.gameState.startGame(poolType, players);
        this.renderBoard();
    }

    handleDiceRoll() {
        if (!this.gameState.gameStarted) return;

        const roll = this.gameState.rollDice();
        if (roll) {
            this.animateDiceRoll(roll);

            const currentPlayer = this.gameState.players[this.gameState.currentTurn];
            
            if (currentPlayer.isAI) {
                // AI's turn
                setTimeout(() => {
                    const tokenIndex = this.gameState.calculateAIMove(currentPlayer.id);
                    if (tokenIndex !== null) {
                        const tokenPos = this.gameState.boardState.tokens[currentPlayer.id].positions[tokenIndex];
                        const newPos = tokenPos + roll;
                        this.moveToken({
                            x: Math.floor(newPos % 15),
                            y: Math.floor(newPos / 15)
                        });
                    } else {
                        // AI has no valid moves, skip turn
                        this.gameState.currentTurn = (this.gameState.currentTurn + 1) % this.gameState.players.length;
                        if (this.gameState.players[this.gameState.currentTurn].isAI) {
                            // If next player is AI, trigger their turn
                            setTimeout(() => this.handleDiceRoll(), 1000);
                        }
                    }
                }, 1000); // Delay AI move by 1 second
            } else {
                // Human player's turn
                this.highlightValidMoves(roll);
            }
        }
    }

    handleLeaveGame() {
        if (confirm('Are you sure you want to leave the game? You will forfeit any potential rewards.')) {
            this.gameState.gameStarted = false;
            document.getElementById('game-board').classList.add('hidden');
            document.getElementById('game-selection').classList.remove('hidden');
        }
    }

    handleCanvasClick(event) {
        if (!this.gameState.gameStarted) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert click coordinates to board position
        const clickedPosition = this.getBoardPosition(x, y);
        
        // Check if clicked position contains a valid token move
        if (this.isValidTokenClick(clickedPosition)) {
            this.moveToken(clickedPosition);
        }
    }

    handleResize() {
        if (this.canvas && this.gameState.gameStarted) {
            // Maintain aspect ratio while fitting the container
            const container = this.canvas.parentElement;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const size = Math.min(containerWidth, containerHeight, 600);
            
            this.canvas.width = size;
            this.canvas.height = size;
            this.renderBoard();
        }
    }

    renderBoard() {
        if (!this.canvas || !this.gameState.gameStarted) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board background
        this.drawBoard();

        // Draw tokens
        this.drawTokens();

        // Draw current roll if any
        if (this.gameState.boardState.lastRoll) {
            this.drawDice(this.gameState.boardState.lastRoll);
        }
    }

    drawBoard() {
        // Draw the Ludo board layout
        // Implementation depends on specific board design
    }

    drawTokens() {
        // Draw all player tokens on the board
        Object.entries(this.gameState.boardState.tokens).forEach(([playerId, tokenData]) => {
            const player = this.gameState.players.find(p => p.id === playerId);
            tokenData.positions.forEach((position, index) => {
                this.drawToken(position, player.color);
            });
        });
    }

    drawToken(position, color) {
        const {x, y} = this.getTokenCoordinates(position);
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }

    drawDice(value) {
        const size = 40;
        const x = this.canvas.width - 60;
        const y = this.canvas.height - 60;

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, size, size);
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(x, y, size, size);

        this.ctx.fillStyle = 'black';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(value.toString(), x + size/2, y + size/2);
    }

    animateDiceRoll(finalValue) {
        // Implement dice roll animation
        this.drawDice(finalValue);
    }

    highlightValidMoves(roll) {
        // Highlight valid moves on the board
        const currentPlayer = this.gameState.players[this.gameState.currentTurn];
        const playerTokens = this.gameState.boardState.tokens[currentPlayer.id];
        
        playerTokens.positions.forEach((pos, index) => {
            if (this.gameState.isValidMove(currentPlayer.id, index, pos + roll)) {
                const {x, y} = this.getTokenCoordinates(pos + roll);
                this.ctx.beginPath();
                this.ctx.arc(x, y, 15, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'yellow';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    getTokenCoordinates(position) {
        // Convert board position to canvas coordinates
        // Implementation depends on board layout
        const gridSize = this.canvas.width / 15;
        return {
            x: (position % 15) * gridSize + gridSize/2,
            y: Math.floor(position / 15) * gridSize + gridSize/2
        };
    }

    getBoardPosition(x, y) {
        // Convert canvas coordinates to board position
        const gridSize = this.canvas.width / 15;
        return {
            x: Math.floor(x / gridSize),
            y: Math.floor(y / gridSize)
        };
    }

    isValidTokenClick(position) {
        // Check if clicked position contains a valid token move
        const currentPlayer = this.gameState.players[this.gameState.currentTurn];
        return this.gameState.boardState.tokens[currentPlayer.id].positions.some(
            (pos, index) => this.gameState.isValidMove(currentPlayer.id, index, position)
        );
    }

    moveToken(position) {
        // Handle token movement
        const currentPlayer = this.gameState.players[this.gameState.currentTurn];
        const tokenIndex = this.gameState.boardState.tokens[currentPlayer.id].positions.findIndex(
            pos => this.gameState.isValidMove(currentPlayer.id, pos, position)
        );

        if (tokenIndex !== -1) {
            this.gameState.moveToken(currentPlayer.id, tokenIndex);
            this.renderBoard();

            // Check for game over
            const gameOver = this.gameState.checkGameOver();
            if (gameOver) {
                this.handleGameOver(gameOver);
            }
        }
    }

    handleGameOver(result) {
        const message = `Game Over! ${result.winner === 'currentPlayer' ? 'You' : 'Player'} won ${result.reward} Pi!`;
        alert(message);
        
        document.getElementById('game-board').classList.add('hidden');
        document.getElementById('game-selection').classList.remove('hidden');
        this.gameState.gameStarted = false;
    }
}

// Initialize UI Controller when page loads
document.addEventListener('DOMContentLoaded', () => {
    const uiController = new UIController(gameState);
});
