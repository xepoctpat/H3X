/**
 * Virtual Assistant Engine - AI-powered task optimization and assistance
 * 
 * Provides intelligent responses and task management suggestions
 * Integrates with LMStudio for enhanced AI capabilities
 */

class VirtualAssistantEngine {
    constructor() {
        this.isConnected = false;
        this.lmStudioUrl = 'http://localhost:1234';
        this.conversationHistory = [];
        this.userPreferences = {
            workingHours: { start: 9, end: 17 },
            preferredTaskTypes: ['creative', 'analytical'],
            breakInterval: 25, // Pomodoro style
            focusMode: false
        };
        this.init();
    }

    init() {
        console.log('🤖 Virtual Assistant Engine initializing...');
        this.checkLMStudioConnection();
        this.loadUserPreferences();
        this.startBackgroundOptimization();
    }

    async checkLMStudioConnection() {
        try {
            const response = await fetch(`${this.lmStudioUrl}/v1/models`);
            if (response.ok) {
                this.isConnected = true;
                console.log('✅ Connected to LMStudio AI engine');
                this.updateConnectionStatus(true);
            }
        } catch (error) {
            console.log('⚠️ LMStudio not available, using fallback responses');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(connected) {
        const statusElements = document.querySelectorAll('.ai-status');
        statusElements.forEach(element => {
            element.textContent = connected ? 'AI Connected' : 'AI Offline';
            element.className = connected ? 'ai-status connected' : 'ai-status disconnected';
        });
    }

    async generateResponse(userMessage, context = {}) {
        if (this.isConnected) {
            return await this.getLMStudioResponse(userMessage, context);
        } else {
            return this.getFallbackResponse(userMessage, context);
        }
    }

    async getLMStudioResponse(userMessage, context) {
        try {
            const systemPrompt = this.buildSystemPrompt(context);
            
            const response = await fetch(`${this.lmStudioUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "microsoft/phi-4-mini-reasoning",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        ...this.conversationHistory.slice(-6), // Keep last 6 messages for context
                        {
                            role: "user",
                            content: userMessage
                        }
                    ],
                    max_tokens: 200,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`LMStudio API error: ${response.status}`);
            }

            const data = await response.json();
            const assistantResponse = data.choices[0].message.content;

            // Update conversation history
            this.conversationHistory.push(
                { role: "user", content: userMessage },
                { role: "assistant", content: assistantResponse }
            );

            return assistantResponse;
        } catch (error) {
            console.error('LMStudio API error:', error);
            return this.getFallbackResponse(userMessage, context);
        }
    }

    buildSystemPrompt(context) {
        const activeTasks = context.activeTasks || 0;
        const completionRate = context.completionRate || 0;
        const currentTime = new Date().toLocaleTimeString();

        return `You are a Neural Taskmaster AI assistant specializing in task optimization and productivity enhancement. 

Current Context:
- Active tasks: ${activeTasks}
- Completion rate: ${completionRate}%
- Current time: ${currentTime}
- User working hours: ${this.userPreferences.workingHours.start}:00 - ${this.userPreferences.workingHours.end}:00

Your role is to:
1. Provide specific, actionable task management advice
2. Suggest productivity optimizations based on neural efficiency principles
3. Help prioritize tasks using cognitive load theory
4. Recommend break times and workflow adjustments
5. Analyze patterns in task completion

Respond concisely but helpfully, focusing on practical suggestions. Use a professional yet friendly tone. Reference neural and cognitive science principles when relevant.`;
    }

    getFallbackResponse(userMessage, context = {}) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Task analysis responses
        if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
            return this.generateTaskAnalysis(context);
        }
        
        // Priority suggestions
        if (lowerMessage.includes('priority') || lowerMessage.includes('prioritize')) {
            return this.generatePriorityAdvice(context);
        }
        
        // Productivity tips
        if (lowerMessage.includes('productivity') || lowerMessage.includes('efficient')) {
            return this.generateProductivityTip();
        }
        
        // Time management
        if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
            return this.generateTimeManagementAdvice();
        }
        
        // Focus and concentration
        if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
            return this.generateFocusAdvice();
        }
        
        // Workflow optimization
        if (lowerMessage.includes('workflow') || lowerMessage.includes('optimize')) {
            return this.generateWorkflowOptimization(context);
        }
        
        // General help
        return this.generateGeneralAdvice();
    }

    generateTaskAnalysis(context) {
        const analyses = [
            `📊 Your current task distribution shows ${context.activeTasks || 'several'} active items. I recommend grouping similar tasks together for better cognitive flow.`,
            
            `🧠 Neural load analysis indicates you're working at ${context.completionRate || 85}% efficiency. Consider implementing the 2-minute rule for quick tasks.`,
            
            `⚡ Pattern recognition suggests your peak performance hours align with morning creative tasks and afternoon analytical work.`,
            
            `🎯 Task complexity assessment shows a good balance. I recommend tackling your most challenging task during your next energy peak.`
        ];
        
        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    generatePriorityAdvice(context) {
        const advice = [
            `💡 Priority matrix recommendation: Focus on high-impact, low-effort tasks first to build momentum, then tackle your most important creative work.`,
            
            `🎯 Based on neural efficiency principles, I suggest ordering tasks by cognitive load: start with routine tasks to warm up, then dive into complex work.`,
            
            `⚡ Time-blocking strategy: Reserve your first 2 hours for deep work on high-priority items when your cognitive resources are fresh.`,
            
            `🧠 Consider the Eisenhower Matrix: Urgent+Important tasks first, then Important+Non-urgent during your peak energy hours.`
        ];
        
        return advice[Math.floor(Math.random() * advice.length)];
    }

    generateProductivityTip() {
        const tips = [
            `🚀 Productivity boost: Use the Pomodoro Technique with 25-minute focused sessions followed by 5-minute breaks to maintain neural efficiency.`,
            
            `⚡ Energy optimization: Tackle creative tasks during your natural peak hours and routine tasks during energy dips.`,
            
            `🎯 Focus enhancement: Try the 'Two-Minute Rule' - if a task takes less than 2 minutes, do it immediately rather than adding it to your list.`,
            
            `🧠 Cognitive load management: Batch similar tasks together to reduce the mental switching cost between different types of work.`,
            
            `💫 Flow state activation: Start with a small, achievable task to build momentum before moving to larger, complex projects.`
        ];
        
        return tips[Math.floor(Math.random() * tips.length)];
    }

    generateTimeManagementAdvice() {
        const currentHour = new Date().getHours();
        
        if (currentHour < 10) {
            return `🌅 Morning optimization: Your brain is primed for complex problem-solving. This is ideal time for your most challenging creative tasks.`;
        } else if (currentHour < 14) {
            return `☀️ Midday focus: Excellent time for collaborative tasks and communication. Your cognitive processing is at peak efficiency.`;
        } else if (currentHour < 17) {
            return `🌤️ Afternoon strategy: Perfect for analytical tasks and data processing. Consider scheduling routine tasks and reviews now.`;
        } else {
            return `🌙 Evening wind-down: Focus on planning tomorrow's priorities and light administrative tasks. Avoid complex creative work.`;
        }
    }

    generateFocusAdvice() {
        const advice = [
            `🎯 Deep focus technique: Try the "Focus Funnel" - start with 5 minutes of meditation, then gradually narrow your attention to the specific task.`,
            
            `🧠 Cognitive clarity: Remove digital distractions and use the "One Tab Rule" - only one browser tab or application open at a time.`,
            
            `⚡ Attention restoration: Take a 2-minute walk or do breathing exercises every 30 minutes to prevent cognitive fatigue.`,
            
            `💫 Flow state entry: Begin with a simple warm-up task related to your main project to activate the relevant neural pathways.`
        ];
        
        return advice[Math.floor(Math.random() * advice.length)];
    }

    generateWorkflowOptimization(context) {
        const optimizations = [
            `🔄 Workflow analysis suggests implementing task templating for recurring activities to reduce decision fatigue.`,
            
            `⚙️ Process optimization: Consider creating a "Task Triage" system - Quick (under 15 min), Standard (15-60 min), and Deep Work (60+ min) categories.`,
            
            `🎯 Efficiency boost: Set up automated triggers for routine tasks and use checklists to reduce cognitive load on repetitive work.`,
            
            `💡 Neural pathway optimization: Group similar tasks by context (calls, emails, creative work) to minimize mental switching costs.`
        ];
        
        return optimizations[Math.floor(Math.random() * optimizations.length)];
    }

    generateGeneralAdvice() {
        const general = [
            `🤖 I'm here to help optimize your neural task processing! Ask me about priorities, time management, focus techniques, or workflow optimization.`,
            
            `🧠 Neural Taskmaster tip: Your brain works best with clear priorities and structured workflows. What specific area would you like to improve?`,
            
            `⚡ Productivity insight: Small, consistent optimizations in your task management can lead to significant improvements in neural efficiency.`,
            
            `🎯 Let me help you unlock your cognitive potential! I can assist with task analysis, priority setting, and workflow optimization strategies.`
        ];
        
        return general[Math.floor(Math.random() * general.length)];
    }

    startBackgroundOptimization() {
        // Monitor task patterns and provide proactive suggestions
        setInterval(() => {
            this.analyzeWorkPatterns();
        }, 300000); // Every 5 minutes
    }

    analyzeWorkPatterns() {
        const currentHour = new Date().getHours();
        const isWorkingHours = currentHour >= this.userPreferences.workingHours.start && 
                              currentHour <= this.userPreferences.workingHours.end;
        
        if (isWorkingHours && !this.userPreferences.focusMode) {
            // Check if it's time for a break reminder
            this.checkBreakReminder();
        }
    }

    checkBreakReminder() {
        const lastBreak = localStorage.getItem('lastBreakTime');
        const now = Date.now();
        const breakInterval = this.userPreferences.breakInterval * 60 * 1000; // Convert to milliseconds
        
        if (!lastBreak || (now - parseInt(lastBreak)) > breakInterval) {
            this.suggestBreak();
            localStorage.setItem('lastBreakTime', now.toString());
        }
    }

    suggestBreak() {
        const suggestions = [
            "🌿 Neural optimization reminder: Consider taking a 5-minute break to restore cognitive resources.",
            "⚡ Productivity boost: A short walk or breathing exercise can enhance your next work session.",
            "🧠 Brain maintenance: Time for a micro-break to prevent cognitive fatigue and maintain peak performance."
        ];
        
        if (window.neuralTaskmaster) {
            window.neuralTaskmaster.addAssistantMessage(
                suggestions[Math.floor(Math.random() * suggestions.length)]
            );
        }
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('neuralTaskmasterPreferences');
        if (saved) {
            this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) };
        }
    }

    saveUserPreferences() {
        localStorage.setItem('neuralTaskmasterPreferences', JSON.stringify(this.userPreferences));
    }

    updatePreference(key, value) {
        this.userPreferences[key] = value;
        this.saveUserPreferences();
    }

    // Public API for the main interface
    async processUserInput(message, context) {
        return await this.generateResponse(message, context);
    }

    getProductivityInsights(tasks) {
        const insights = [];
        
        if (tasks.length > 10) {
            insights.push("📊 Task overload detected. Consider using the 'Rule of 3' - focus on only 3 major tasks per day.");
        }
        
        const urgentTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high');
        if (urgentTasks.length > 5) {
            insights.push("⚠️ High urgent task ratio. Review priorities to prevent burnout and maintain quality.");
        }
        
        return insights;
    }
}

// Initialize the assistant engine
document.addEventListener('DOMContentLoaded', () => {
    window.virtualAssistant = new VirtualAssistantEngine();
});
