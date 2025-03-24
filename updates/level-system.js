class LevelSystem {
    constructor() {
        this.wins = 0;
        this.level = 0;
        this.loadProgress();
        this.initializeEventListeners();
    }

    loadProgress() {
        try {
            const savedWins = localStorage.getItem('userWins');
            const savedLevel = localStorage.getItem('userLevel');
            if (savedWins && savedLevel) {
                this.wins = parseInt(savedWins);
                this.level = parseInt(savedLevel);
            }
            this.updateLevelDisplay();
        } catch (error) {
            console.error('Error loading level progress:', error);
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('userWins', this.wins.toString());
            localStorage.setItem('userLevel', this.level.toString());
        } catch (error) {
            console.error('Error saving level progress:', error);
        }
    }

    addWin() {
        this.wins++;
        if (this.wins % 5 === 0) {
            this.level++;
            this.showLevelUpNotification();
        }
        this.saveProgress();
        this.updateLevelDisplay();
        
        // Update pool availability if pool system exists
        if (window.poolSystem) {
            window.poolSystem.updatePoolAvailability();
        }
    }

    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-level-up-alt text-xl"></i>
                <span>Level Up! You are now level ${this.level}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    updateLevelDisplay() {
        const userInfoElem = document.getElementById('user-info');
        if (userInfoElem) {
            const levelInfo = document.createElement('div');
            levelInfo.className = 'text-sm mt-2 flex items-center justify-center space-x-2';
            levelInfo.innerHTML = `
                <div class="bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                    <i class="fas fa-star mr-1"></i>Level ${this.level}
                </div>
                <div class="bg-green-100 text-green-600 px-3 py-1 rounded-full">
                    <i class="fas fa-trophy mr-1"></i>${this.wins} Wins
                </div>
                <div class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                    <i class="fas fa-arrow-up mr-1"></i>${5 - (this.wins % 5)} to next level
                </div>
            `;
            
            // Replace existing level info or append new one
            const existingLevelInfo = userInfoElem.querySelector('.text-sm');
            if (existingLevelInfo) {
                existingLevelInfo.replaceWith(levelInfo);
            } else {
                userInfoElem.appendChild(levelInfo);
            }
        }
    }

    initializeEventListeners() {
        // Listen for game completion events
        document.addEventListener('gameCompleted', (event) => {
            if (event.detail && event.detail.isWinner) {
                this.addWin();
            }
        });
    }

    getRequiredLevel(poolType) {
        const requirements = {
            'bronze': 0,
            'silver': 5,
            'gold': 10,
            'platinum': 20,
            'diamond': 30
        };
        return requirements[poolType.toLowerCase()] || 0;
    }

    isEligibleForPool(poolType) {
        const requiredLevel = this.getRequiredLevel(poolType);
        return this.level >= requiredLevel;
    }

    getProgress() {
        return {
            level: this.level,
            wins: this.wins,
            winsToNextLevel: 5 - (this.wins % 5),
            totalWinsRequired: (this.level + 1) * 5
        };
    }
}

// Initialize level system
document.addEventListener('DOMContentLoaded', () => {
    window.levelSystem = new LevelSystem();
});