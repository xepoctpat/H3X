/**
 * H3X Node Neural Dashboard Core Functions
 * Handles neural processing and outcome generation
 */

class NodeNeuralDashboard {
    constructor() {
        this.intentInput = document.getElementById('intentInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.result = document.getElementById('result');
        this.currencySymbol = document.getElementById('currencySymbol');
        
        this.initializeEventListeners();
        this.initializeNeuralSymbols();
    }

    initializeEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateOutcome());
        this.intentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateOutcome();
            }
        });
    }

    initializeNeuralSymbols() {
        const symbols = ['⬡', '◊', '⬢', '◈', '⬟', '◇'];
        let currentIndex = 0;
        
        setInterval(() => {
            this.currencySymbol.textContent = symbols[currentIndex];
            currentIndex = (currentIndex + 1) % symbols.length;
        }, 2000);
    }

    generateOutcome() {
        const intent = this.intentInput.value.trim();
        
        if (!intent) {
            this.result.textContent = 'Please enter an intention for neural processing.';
            return;
        }

        // Show processing state
        this.result.textContent = 'Neural processing in progress...';
        this.generateBtn.disabled = true;

        // Simulate neural processing
        setTimeout(() => {
            const outcome = this.processIntent(intent);
            this.result.innerHTML = `
                <div class="outcome-title">Neural Outcome Generated:</div>
                <div class="outcome-text">${outcome}</div>
                <div class="accuracy">Confidence: ${this.calculateAccuracy()}%</div>
            `;
            this.generateBtn.disabled = false;
        }, 1500);
    }

    processIntent(intent) {
        const outcomes = [
            `⬡ Hexagonal energy matrix activated for: "${intent}"`,
            `◊ Neural pathway optimized for intention: "${intent}"`,
            `⬢ Quantum resonance field aligned with: "${intent}"`,
            `◈ Symbolic transformation initiated for: "${intent}"`,
            `⬟ Neural convergence pattern established for: "${intent}"`,
            `◇ Intention crystallized into actionable form: "${intent}"`
        ];

        return outcomes[Math.floor(Math.random() * outcomes.length)];
    }

    calculateAccuracy() {
        return Math.floor(Math.random() * 20) + 75; // 75-95% range
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NodeNeuralDashboard();
});

// Add some CSS for the outcome display
const style = document.createElement('style');
style.textContent = `
    .outcome-title {
        font-weight: bold;
        color: #00ffff;
        margin-bottom: 10px;
    }
    .outcome-text {
        font-size: 1.1em;
        margin-bottom: 10px;
    }
    .accuracy {
        font-size: 0.9em;
        color: rgba(0, 255, 255, 0.8);
        font-style: italic;
    }
`;
document.head.appendChild(style);
