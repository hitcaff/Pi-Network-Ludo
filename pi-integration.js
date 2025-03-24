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

    async makePayment(amount) {
        if (!this.isPiBrowser()) {
            this.showError("Please open this app in Pi Browser");
            return null;
        }

        if (!this.authenticated) {
            this.showError("Please authenticate first!");
            return null;
        }

        try {
            const payment = await this.sdk.createPayment({
                amount: amount,
                memo: "Game entry fee",
                metadata: { gameType: "ludo", timestamp: Date.now() }
            });

            if (payment.status === "completed") {
                this.showSuccess(`Payment of ${amount} Pi successful!`);
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
