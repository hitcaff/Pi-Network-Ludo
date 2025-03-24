class PoolSystem {
    constructor() {
        this.currentSlide = 0;
        this.slider = document.getElementById('pool-slider');
        this.slides = document.querySelectorAll('.pool-card');
        this.totalSlides = this.slides.length;
        this.slideWidth = 100; // percentage
        this.userLevel = 0;
        this.wins = 0;

        // Initialize from localStorage if available
        this.loadUserProgress();
        this.initializeEventListeners();
        this.updateSliderPosition();
    }

    loadUserProgress() {
        try {
            const savedWins = localStorage.getItem('userWins');
            if (savedWins) {
                this.wins = parseInt(savedWins);
                this.userLevel = Math.floor(this.wins / 5);
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    saveUserProgress() {
        try {
            localStorage.setItem('userWins', this.wins.toString());
        } catch (error) {
            console.error('Error saving user progress:', error);
        }
    }

    initializeEventListeners() {
        // Navigation buttons
        document.getElementById('prev-pool').addEventListener('click', () => this.prevSlide());
        document.getElementById('next-pool').addEventListener('click', () => this.nextSlide());

        // Touch events for mobile swipe
        let touchStartX = 0;
        let touchEndX = 0;

        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.slider.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        });

        this.slider.addEventListener('touchend', () => {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
                if (swipeDistance > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            }
        });

        // Show pool selection after authentication
        document.getElementById('authenticate').addEventListener('click', () => {
            setTimeout(() => {
                const poolSelection = document.getElementById('pool-selection');
                if (poolSelection) {
                    poolSelection.classList.remove('hidden');
                }
            }, 1000); // Wait for authentication to complete
        });
    }

    updateSliderPosition() {
        if (!this.slider) return;
        const offset = -this.currentSlide * this.slideWidth;
        this.slider.style.transform = `translateX(${offset}%)`;
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prev-pool');
        const nextButton = document.getElementById('next-pool');

        if (prevButton) {
            prevButton.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
            prevButton.style.cursor = this.currentSlide === 0 ? 'not-allowed' : 'pointer';
        }

        if (nextButton) {
            nextButton.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.5' : '1';
            nextButton.style.cursor = this.currentSlide === this.totalSlides - 1 ? 'not-allowed' : 'pointer';
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSliderPosition();
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this.updateSliderPosition();
        }
    }

    addWin() {
        this.wins++;
        this.userLevel = Math.floor(this.wins / 5);
        this.saveUserProgress();
        this.updateLevelDisplay();
        return this.userLevel;
    }

    updateLevelDisplay() {
        const userInfoElem = document.getElementById('user-info');
        if (userInfoElem) {
            const levelInfo = document.createElement('div');
            levelInfo.className = 'text-sm mt-1';
            levelInfo.innerHTML = `
                <span class="text-purple-600">
                    <i class="fas fa-star mr-1"></i>Level ${this.userLevel} 
                    (${this.wins} wins)
                </span>
            `;
            
            // Only append if it doesn't exist
            if (!userInfoElem.querySelector('.text-sm')) {
                userInfoElem.appendChild(levelInfo);
            } else {
                userInfoElem.querySelector('.text-sm').replaceWith(levelInfo);
            }
        }
    }

    checkPoolEligibility(poolType) {
        const requirements = {
            'bronze': 0,
            'silver': 5,
            'gold': 10,
            'platinum': 20,
            'diamond': 30
        };

        return this.userLevel >= requirements[poolType.toLowerCase()];
    }

    getLeftoverPi() {
        // Calculate leftover Pi from pool rewards
        // This can be implemented based on specific game rules
        return 0; // Placeholder
    }
}

// Initialize pool system
document.addEventListener('DOMContentLoaded', () => {
    window.poolSystem = new PoolSystem();
});