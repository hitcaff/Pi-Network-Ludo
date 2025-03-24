class PiNetwork {
    constructor() {
        this.sdk = window.Pi;
        this.initialized = false;
        this.authenticated = false;
    }

    isPiBrowser() {
        return /PiBrowser/i.test(navigator.userAgent);
    }

    async init() {
        if (!this.isPiBrowser()) {
            this.showError("Please open this app in Pi Browser");
            return false;
        }

        try {
            await this.sdk.init({
                version: "2.0",
                sandbox: false  // Set to false for production
            });
            this.initialized = true;
            console.log("Pi Network SDK initialized in sandbox mode");
            return true;
        } catch (error) {
            console.error("Pi Network SDK initialization failed:", error);
            this.showError("Failed to initialize Pi Network. Please try again.");
            return false;
        }
    }

    async authenticate() {
        if (!this.isPiBrowser()) {
            this.showError("Please open this app in Pi Browser");
            return null;
        }

        if (!this.initialized) {
            const initialized = await this.init();
            if (!initialized) return null;
        }
        
        try {
            const auth = await this.sdk.authenticate();
            if (auth) {
                this.authenticated = true;
                this.showSuccess("Successfully authenticated with Pi Network!");
                document.getElementById("auth-section").classList.add("hidden");
                document.getElementById("game-selection").classList.remove("hidden");
                return auth;
            }
        } catch (error) {
            console.error("Authentication failed:", error);
            this.showError("Authentication failed. Please try again.");
            return null;
        }
    }

    async makePayment(amount, poolType, paymentType = 'entry') {
        if (!this.isPiBrowser()) {
            this.showError("Please open this app in Pi Browser");
            return null;
        }

        if (!this.authenticated) {
            this.showError("Please authenticate first!");
            return null;
        }

        try {
            const metadata = {
                gameType: "ludo",
                poolType: poolType,
                paymentType: paymentType,
                timestamp: Date.now()
            };

            const memo = paymentType === 'entry' 
                ? `Entry fee for ${poolType} pool game`
                : `3-day access pass for ${poolType} pool`;

            const payment = await this.sdk.createPayment({
                amount: amount,
                memo: memo,
                metadata: metadata
            }, {
                onReadyForServerApproval: function(paymentId) {
                    console.log('Ready for server approval:', paymentId);
                },
                onReadyForServerCompletion: function(paymentId, txid) {
                    console.log('Ready for completion:', paymentId, txid);
                },
                onCancel: function(paymentId) {
                    console.log('Payment cancelled:', paymentId);
                },
                onError: function(error, payment) {
                    console.error('Payment error:', error);
                }
            });

            if (payment && payment.status === "completed") {
                if (paymentType === 'access') {
                    // Store access pass with expiry date (3 days from now)
                    const passes = JSON.parse(localStorage.getItem('poolAccessPasses') || '{}');
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 3);
                    passes[poolType] = expiryDate.toISOString();
                    localStorage.setItem('poolAccessPasses', JSON.stringify(passes));
                    this.showSuccess(`Access pass purchased for ${poolType} pool!`);
                } else {
                    this.showSuccess(`Entry fee paid for ${poolType} pool!`);
                }
                return payment;
            } else {
                this.showError("Payment incomplete. Please try again.");
                return null;
            }
        } catch (error) {
            console.error("Payment failed:", error);
            this.showError("Payment failed. Please try again.");
            return null;
        }
    }

    // Pool access and level management
    getPlayerLevel() {
        const progress = JSON.parse(localStorage.getItem('ludoNovaProgress') || '{}');
        return Math.floor((progress.tokensHome || 0) / 20);
    }

    hasPoolAccess(poolType) {
        const poolLevels = {
            'bronze': 0,
            'silver': 5,
            'gold': 10,
            'platinum': 20,
            'diamond': 30
        };

        // Check player level
        const playerLevel = this.getPlayerLevel();
        if (playerLevel >= poolLevels[poolType]) {
            return true;
        }

        // Check access pass
        const passes = JSON.parse(localStorage.getItem('poolAccessPasses') || '{}');
        if (passes[poolType]) {
            const expiryDate = new Date(passes[poolType]);
            if (expiryDate > new Date()) {
                return true;
            }
            // Remove expired pass
            delete passes[poolType];
            localStorage.setItem('poolAccessPasses', JSON.stringify(passes));
        }

        return false;
    }

    async purchaseAccessPass(poolType) {
        return await this.makePayment(1, poolType, 'access');
    }

    async enterPool(poolType) {
        const poolFees = {
            'bronze': 0.5,
            'silver': 1,
            'gold': 2,
            'platinum': 5,
            'diamond': 10
        };

        return await this.makePayment(poolFees[poolType], poolType, 'entry');
    }

    showError(message) {
        const notification = document.createElement("div");
        notification.className = "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        const notification = document.createElement("div");
        notification.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showPiBrowserInstructions() {
        const instructions = document.createElement("div");
        instructions.className = "fixed bottom-4 left-4 right-4 bg-white text-black p-6 rounded-lg shadow-lg z-50 max-w-2xl mx-auto";
        instructions.innerHTML = `
            <h3 class="text-xl font-bold mb-4">How to Open in Pi Browser:</h3>
            <ol class="list-decimal pl-4 space-y-2">
                <li>Open Pi Browser on your mobile device</li>
                <li>Copy this URL: <code class="bg-gray-100 px-2 py-1 rounded">${window.location.href}</code></li>
                <li>Paste the URL in Pi Browser's address bar</li>
                <li>The game will automatically connect to Pi Network</li>
            </ol>
            <button class="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onclick="this.parentElement.remove()">Got it!</button>
        `;
        document.body.appendChild(instructions);
    }
}

const piNetwork = new PiNetwork();

document.addEventListener("DOMContentLoaded", () => {
    if (!piNetwork.isPiBrowser()) {
        const warningBanner = document.createElement("div");
        warningBanner.className = "fixed top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-3 text-center font-bold";
        warningBanner.innerHTML = `
            <strong>⚠️ Warning:</strong> This app must be opened in Pi Browser to function properly. 
            <button onclick="piNetwork.showPiBrowserInstructions()" class="ml-2 bg-black text-white px-3 py-1 rounded hover:bg-gray-800">
                Show Instructions
            </button>
        `;
        document.body.prepend(warningBanner);
        piNetwork.showPiBrowserInstructions();
    }

    document.getElementById("authenticate").addEventListener("click", async () => {
        const auth = await piNetwork.authenticate();
        if (auth) {
            console.log("Authentication successful:", auth);
        }
    });

    document.querySelector(".play-ludo").addEventListener("click", async () => {
        const payment = await piNetwork.makePayment(0.5);
        if (payment) {
            document.getElementById("game-selection").classList.add("hidden");
            document.getElementById("game-board").classList.remove("hidden");
            gameUI.initializeLudoBoard();
        }
    });

    document.querySelector(".play-snake-ladder").addEventListener("click", async () => {
        const payment = await piNetwork.makePayment(0.5);
        if (payment) {
            document.getElementById("game-selection").classList.add("hidden");
            document.getElementById("game-board").classList.remove("hidden");
            gameUI.initializeSnakeLadderBoard();
        }
    });

    document.getElementById("leave-game").addEventListener("click", () => {
        document.getElementById("game-board").classList.add("hidden");
        document.getElementById("game-selection").classList.remove("hidden");
    });
});
