class GameUI {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.game = null;
        this.boardSize = 600;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = this.boardSize;
        this.canvas.height = this.boardSize;
        this.canvas.style.backgroundColor = "white";
    }

    initializeLudoBoard() {
        this.game = new LudoGame();
        this.game.initializeGame(4);
        this.drawLudoBoard();
    }

    initializeSnakeLadderBoard() {
        this.game = new SnakeLadderGame();
        this.game.initializeGame(4);
        this.drawSnakeLadderBoard();
    }

    drawLudoBoard() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);

        // Draw board sections
        const colors = ["red", "blue", "yellow", "green"];
        const sectionSize = this.boardSize / 3;

        colors.forEach((color, index) => {
            const x = (index % 2) * 2 * sectionSize;
            const y = Math.floor(index / 2) * 2 * sectionSize;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, sectionSize, sectionSize);
        });

        // Draw center paths
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(sectionSize, 0, sectionSize, this.boardSize);
        this.ctx.fillRect(0, sectionSize, this.boardSize, sectionSize);

        // Draw grid lines
        this.ctx.strokeStyle = "#000";
        const cellSize = sectionSize / 6;

        // Draw vertical lines
        for (let i = 0; i <= this.boardSize; i += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.boardSize);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let i = 0; i <= this.boardSize; i += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.boardSize, i);
            this.ctx.stroke();
        }
    }

    drawSnakeLadderBoard() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);

        const cellSize = this.boardSize / 10;

        // Draw grid and numbers
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const x = j * cellSize;
                const y = (9 - i) * cellSize;
                
                // Draw cell
                this.ctx.strokeStyle = "#000";
                this.ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Add numbers
                const number = i * 10 + j + 1;
                this.ctx.fillStyle = "#000";
                this.ctx.font = "20px Arial";
                this.ctx.fillText(number.toString(), x + cellSize/3, y + cellSize/2);
            }
        }

        // Draw snakes
        Object.entries(this.game.snakes).forEach(([start, end]) => {
            this.drawSnake(parseInt(start), end);
        });

        // Draw ladders
        Object.entries(this.game.ladders).forEach(([start, end]) => {
            this.drawLadder(parseInt(start), end);
        });
    }

    drawSnake(start, end) {
        const startPos = this.getPositionFromNumber(start);
        const endPos = this.getPositionFromNumber(end);
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.stroke();
    }

    drawLadder(start, end) {
        const startPos = this.getPositionFromNumber(start);
        const endPos = this.getPositionFromNumber(end);
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.stroke();
    }

    getPositionFromNumber(number) {
        const cellSize = this.boardSize / 10;
        const row = Math.floor((number - 1) / 10);
        const col = (number - 1) % 10;
        return {
            x: col * cellSize + cellSize/2,
            y: (9 - row) * cellSize + cellSize/2
        };
    }
}

// Initialize UI controller
const gameUI = new GameUI();

// Add event listeners
document.querySelector(".play-ludo").addEventListener("click", () => {
    document.getElementById("game-selection").classList.add("hidden");
    document.getElementById("game-board").classList.remove("hidden");
    gameUI.initializeLudoBoard();
});

document.querySelector(".play-snake-ladder").addEventListener("click", () => {
    document.getElementById("game-selection").classList.add("hidden");
    document.getElementById("game-board").classList.remove("hidden");
    gameUI.initializeSnakeLadderBoard();
});
