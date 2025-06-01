/**
 * H3X Cortex Current Real-time Interface Core
 * 
 * Advanced neural intention processing with real-time symbolic outcomes
 * Integrates with LMStudio AI and H3X neural networks
 */

class CortexCurrentCore {
    constructor() {
        this.intentionHistory = [];
        this.neuralMetrics = {
            totalIntentions: 0,
            avgConfidence: 80,
            neuralCoherence: 94,
            realitySync: true
        };
        this.currentMode = 'symbolic';
        this.isProcessing = false;
        this.init();
    }

    init() {
        console.log('🧠 Cortex Current Neural Interface initializing...');
        this.bindEvents();
        this.initializeVisualEffects();
        this.startRealTimeSync();
        this.loadSuggestions();
    }

    bindEvents() {
        // Main processing button
        const generateBtn = document.getElementById('generateBtn');
        const intentInput = document.getElementById('intentInput');
        
        if (generateBtn && intentInput) {
            generateBtn.addEventListener('click', () => this.processIntention());
            intentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.processIntention();
            });
            intentInput.addEventListener('input', () => this.updateSuggestions());
        }

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Intensity slider
        const intensitySlider = document.getElementById('intensitySlider');
        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                document.querySelector('.intensity-value').textContent = e.target.value;
            });
        }

        // History controls
        const clearHistory = document.getElementById('clearHistory');
        const exportHistory = document.getElementById('exportHistory');
        
        if (clearHistory) clearHistory.addEventListener('click', () => this.clearHistory());
        if (exportHistory) exportHistory.addEventListener('click', () => this.exportSession());
    }

    async processIntention() {
        const intentInput = document.getElementById('intentInput');
        const intention = intentInput.value.trim();
        
        if (!intention) return;
        
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        this.showProcessing(true);
        
        try {
            const intensity = document.getElementById('intensitySlider').value;
            const result = await this.generateNeuralResponse(intention, intensity);
            
            this.displayResult(result);
            this.addToHistory(intention, result);
            this.updateMetrics();
            
            intentInput.value = '';
        } catch (error) {
            console.error('Neural processing error:', error);
            this.displayError('Neural pathway disrupted. Please try again.');
        } finally {
            this.isProcessing = false;
            this.showProcessing(false);
        }
    }

    async generateNeuralResponse(intention, intensity) {
        // Simulate neural processing with realistic delay
        await this.delay(1500 + Math.random() * 1000);
        
        const confidence = Math.floor(75 + Math.random() * 20); // 75-95%
        
        const responses = {
            symbolic: this.generateSymbolicResponse(intention, intensity),
            analytical: this.generateAnalyticalResponse(intention, intensity),
            intuitive: this.generateIntuitiveResponse(intention, intensity)
        };

        return {
            intention,
            intensity,
            mode: this.currentMode,
            confidence,
            responses,
            timestamp: new Date().toISOString()
        };
    }

    generateSymbolicResponse(intention, intensity) {
        const symbols = ['⬡', '◊', '⚡', '🌊', '🔮', '💫', '⭐', '🌀', '🔥', '❄️'];
        const patterns = ['ascending', 'flowing', 'pulsing', 'spiraling', 'radiating'];
        
        const baseSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        return `${baseSymbol} Neural pathway ${pattern} with intensity ${intensity}/10 → ${this.generateIntentionSymbol(intention)}`;
    }

    generateAnalyticalResponse(intention, intensity) {
        const analysisTypes = ['cognitive', 'emotional', 'behavioral', 'systemic'];
        const type = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
        
        return `${type.charAt(0).toUpperCase() + type.slice(1)} analysis indicates ${intensity >= 7 ? 'high' : intensity >= 4 ? 'moderate' : 'low'} neural activation for "${intention}". Suggested optimization pathways available.`;
    }

    generateIntuitiveResponse(intention, intensity) {
        const intuitions = [
            'Deep resonance detected in neural field',
            'Synchronistic patterns emerging',
            'Quantum coherence stabilizing',
            'Archetypal activation in progress',
            'Energetic alignment confirmed'
        ];
        
        return intuitions[Math.floor(Math.random() * intuitions.length)] + ` (${intention})`;
    }

    generateIntentionSymbol(intention) {
        const words = intention.toLowerCase().split(' ');
        const symbolMap = {
            'energy': '⚡', 'create': '🎨', 'focus': '🎯', 'peace': '☮️',
            'love': '💖', 'power': '🔥', 'wisdom': '🦉', 'flow': '🌊',
            'grow': '🌱', 'heal': '💚', 'connect': '🔗', 'transform': '🦋'
        };
        
        for (const word of words) {
            if (symbolMap[word]) return symbolMap[word];
        }
        return '◊';
    }

    displayResult(result) {
        const symbolicResult = document.getElementById('symbolicResult');
        const analyticalResult = document.getElementById('analyticalResult');
        const confidenceFill = document.getElementById('confidenceFill');
        const confidenceText = document.getElementById('confidenceText');
        
        if (symbolicResult) symbolicResult.textContent = result.responses.symbolic;
        if (analyticalResult) analyticalResult.textContent = result.responses.analytical;
        
        if (confidenceFill && confidenceText) {
            confidenceFill.style.width = `${result.confidence}%`;
            confidenceText.textContent = `${result.confidence}%`;
        }
        
        this.animateSymbol();
    }

    addToHistory(intention, result) {
        this.intentionHistory.unshift({
            time: new Date().toLocaleTimeString(),
            intention,
            result: result.responses[this.currentMode],
            confidence: result.confidence
        });
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = this.intentionHistory.slice(0, 10).map(item => `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-time">${item.time}</span>
                    <span class="history-confidence">${item.confidence}%</span>
                </div>
                <div class="history-intention">${item.intention}</div>
                <div class="history-result">${item.result}</div>
            </div>
        `).join('');
    }

    updateMetrics() {
        this.neuralMetrics.totalIntentions++;
        this.neuralMetrics.avgConfidence = Math.floor(
            this.intentionHistory.reduce((sum, item) => sum + item.confidence, 0) / 
            this.intentionHistory.length
        );
        
        document.getElementById('totalIntentions').textContent = this.neuralMetrics.totalIntentions;
        document.getElementById('avgConfidence').textContent = this.neuralMetrics.avgConfidence;
    }

    switchMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    }

    showProcessing(show) {
        const indicator = document.querySelector('.processing-indicator');
        const generateBtn = document.getElementById('generateBtn');
        
        if (show) {
            generateBtn.textContent = 'Processing Neural Pattern...';
            indicator.style.display = 'inline-block';
        } else {
            generateBtn.innerHTML = '<span class="button-symbol">⬡</span>Process Neural Intention';
            indicator.style.display = 'none';
        }
    }

    animateSymbol() {
        const symbol = document.getElementById('centralSymbol');
        if (symbol) {
            symbol.classList.add('pulse-animation');
            setTimeout(() => symbol.classList.remove('pulse-animation'), 2000);
        }
    }

    initializeVisualEffects() {
        this.createNeuralParticles();
        this.startPatternAnimation();
    }

    createNeuralParticles() {
        const container = document.querySelector('.neural-particles');
        if (!container) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(particle);
        }
    }

    startPatternAnimation() {
        const pattern = document.getElementById('patternDisplay');
        if (!pattern) return;
        
        setInterval(() => {
            const wave = pattern.querySelector('.pattern-wave');
            if (wave) {
                wave.style.transform = `translateX(${Math.sin(Date.now() * 0.001) * 20}px)`;
            }
        }, 100);
    }

    startRealTimeSync() {
        setInterval(() => {
            const syncFill = document.querySelector('.sync-fill');
            if (syncFill) {
                const variance = (Math.random() - 0.5) * 10;
                const newSync = Math.max(70, Math.min(90, 80 + variance));
                syncFill.style.width = `${newSync}%`;
                document.querySelector('.sync-percentage').textContent = `${Math.floor(newSync)}%`;
            }
        }, 2000);
    }

    loadSuggestions() {
        this.suggestions = [
            'Increase creative energy',
            'Focus deeply on task',
            'Release mental tension',
            'Boost motivation',
            'Enhance clarity',
            'Generate new ideas',
            'Find inner peace',
            'Strengthen willpower'
        ];
    }

    updateSuggestions() {
        const input = document.getElementById('intentInput');
        const suggestionsContainer = document.getElementById('suggestions');
        
        if (!input || !suggestionsContainer) return;
        
        const value = input.value.toLowerCase();
        if (value.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        const matches = this.suggestions.filter(s => 
            s.toLowerCase().includes(value)
        ).slice(0, 5);
        
        if (matches.length > 0) {
            suggestionsContainer.innerHTML = matches.map(match => 
                `<div class="suggestion-item" onclick="cortexCore.selectSuggestion('${match}')">${match}</div>`
            ).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }

    selectSuggestion(suggestion) {
        document.getElementById('intentInput').value = suggestion;
        document.getElementById('suggestions').style.display = 'none';
    }

    clearHistory() {
        this.intentionHistory = [];
        this.updateHistoryDisplay();
        this.neuralMetrics.totalIntentions = 0;
        this.neuralMetrics.avgConfidence = 80;
        this.updateMetrics();
    }

    exportSession() {
        const data = {
            session: new Date().toISOString(),
            history: this.intentionHistory,
            metrics: this.neuralMetrics
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cortex-session-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the Cortex Current Core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cortexCore = new CortexCurrentCore();
});
                        context: 'symbolic_currency',
                        analysisType: 'semantic_mapping'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.result && data.result.symbol) {
                        // Update the symbol with SIR's recommendation
                        document.getElementById('currencySymbol').textContent = data.result.symbol;
                    }
                });
            } catch (error) {
                console.log("Using local symbol generation only");
            }
        }
        
        return originalSymbol;
    };
    
    console.log("🔮 Currency generator enhanced with SIR insights");
}
