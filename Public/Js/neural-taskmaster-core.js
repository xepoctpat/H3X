/**
 * Neural Taskmaster Core - Advanced Task Orchestration System
 * 
 * Provides comprehensive task management with AI assistance
 * and neural workflow optimization
 */

class NeuralTaskmasterCore {
    constructor() {
        this.tasks = [];
        this.taskIdCounter = 1;
        this.analytics = {
            totalTasks: 0,
            completedTasks: 0,
            completionRate: 89,
            avgProcessingTime: 2.4,
            neuralEfficiency: 94
        };
        this.init();
    }

    init() {
        console.log('🧠 Neural Taskmaster Core initializing...');
        this.bindEvents();
        this.loadSampleData();
        this.updateAnalytics();
        this.initChart();
    }

    bindEvents() {
        // Task creation form
        const form = document.getElementById('taskCreationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.createTask(e));
        }

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.target.dataset.action));
        });

        // Assistant input
        const assistantInput = document.getElementById('assistantInput');
        const sendBtn = document.getElementById('sendAssistant');
        
        if (assistantInput && sendBtn) {
            sendBtn.addEventListener('click', () => this.sendAssistantMessage());
            assistantInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendAssistantMessage();
            });
        }
    }

    createTask(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const task = {
            id: this.taskIdCounter++,
            title: formData.get('taskTitle'),
            priority: formData.get('taskPriority'),
            category: formData.get('taskCategory'),
            deadline: formData.get('taskDeadline'),
            notes: formData.get('taskNotes'),
            status: 'active',
            progress: 0,
            createdAt: new Date(),
            estimatedTime: this.estimateTaskTime(formData.get('taskTitle'))
        };

        this.tasks.push(task);
        this.updateTasksList();
        this.updateAnalytics();
        form.reset();

        this.showNotification(`Task "${task.title}" created successfully!`, 'success');
    }

    updateTasksList() {
        const container = document.getElementById('tasksList');
        if (!container) return;

        const activeTasks = this.tasks.filter(task => task.status === 'active');
        
        container.innerHTML = activeTasks.map(task => this.createTaskHTML(task)).join('');
        
        // Bind task action events
        container.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTaskAction(e));
        });
    }

    createTaskHTML(task) {
        const priorityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        };

        const categoryEmoji = {
            creative: '🎨',
            analytical: '📊',
            coordination: '🔗',
            monitoring: '👁️',
            execution: '⚡'
        };

        const deadlineStr = task.deadline ? 
            new Date(task.deadline).toLocaleString() : 'No deadline';

        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-header">
                    <span class="priority-indicator ${task.priority}"></span>
                    <h3>${task.title}</h3>
                    <span class="task-category">${categoryEmoji[task.category]} ${task.category}</span>
                </div>
                <p class="task-description">${task.notes || 'No additional context provided.'}</p>
                <div class="task-meta">
                    <span class="deadline">Deadline: ${deadlineStr}</span>
                    <span class="progress">Progress: ${task.progress}%</span>
                    <span class="estimated-time">Est: ${task.estimatedTime}h</span>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit" data-action="edit" data-task-id="${task.id}">✏️ Edit</button>
                    <button class="action-btn complete" data-action="complete" data-task-id="${task.id}">✅ Complete</button>
                    <button class="action-btn delete" data-action="delete" data-task-id="${task.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    handleTaskAction(event) {
        const action = event.target.dataset.action;
        const taskId = parseInt(event.target.dataset.taskId);
        const task = this.tasks.find(t => t.id === taskId);

        if (!task) return;

        switch (action) {
            case 'complete':
                task.status = 'completed';
                task.progress = 100;
                task.completedAt = new Date();
                this.analytics.completedTasks++;
                this.showNotification(`Task "${task.title}" completed!`, 'success');
                break;
            
            case 'delete':
                const index = this.tasks.indexOf(task);
                this.tasks.splice(index, 1);
                this.showNotification(`Task "${task.title}" deleted.`, 'info');
                break;
            
            case 'edit':
                this.editTask(task);
                return; // Don't update lists yet
        }

        this.updateTasksList();
        this.updateAnalytics();
    }

    editTask(task) {
        // Pre-populate the form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDeadline').value = task.deadline;
        document.getElementById('taskNotes').value = task.notes;

        // Remove the task temporarily for editing
        const index = this.tasks.indexOf(task);
        this.tasks.splice(index, 1);
        this.updateTasksList();
        
        this.showNotification(`Editing task "${task.title}"`, 'info');
    }

    updateAnalytics() {
        const activeTasks = this.tasks.filter(t => t.status === 'active').length;
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = this.tasks.length;
        
        this.analytics.totalTasks = totalTasks;
        this.analytics.completedTasks = completedTasks;
        this.analytics.completionRate = totalTasks > 0 ? 
            Math.round((completedTasks / totalTasks) * 100) : 0;

        // Update DOM elements
        const elements = {
            activeTasksCount: activeTasks,
            completionRate: this.analytics.completionRate + '%',
            avgProcessingTime: this.analytics.avgProcessingTime + 'h',
            neuralEfficiency: this.analytics.neuralEfficiency + '%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    estimateTaskTime(title) {
        // Simple heuristic based on task complexity
        const words = title.split(' ').length;
        const baseTime = 1.0;
        const complexityFactor = words * 0.2;
        return Math.round((baseTime + complexityFactor) * 10) / 10;
    }

    handleQuickAction(action) {
        const messages = {
            analyze: "📊 Analyzing current task load and priorities...",
            suggest: "💡 Based on neural patterns, I recommend prioritizing creative tasks during your peak energy hours.",
            optimize: "⚡ Optimizing workflow... Consider batching similar tasks and using the Pomodoro technique."
        };

        this.addAssistantMessage(messages[action] || "Processing request...");
    }

    sendAssistantMessage() {
        const input = document.getElementById('assistantInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addUserMessage(message);
        input.value = '';

        // Simulate AI response
        setTimeout(() => {
            const response = this.generateAssistantResponse(message);
            this.addAssistantMessage(response);
        }, 1000);
    }

    addUserMessage(message) {
        const chat = document.getElementById('assistantChat');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';
        messageDiv.innerHTML = `
            <span class="avatar">👤</span>
            <div class="message-content">
                <p>${message}</p>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;
    }

    addAssistantMessage(message) {
        const chat = document.getElementById('assistantChat');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message assistant';
        messageDiv.innerHTML = `
            <span class="avatar">🧠</span>
            <div class="message-content">
                <p>${message}</p>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;
    }

    generateAssistantResponse(userMessage) {
        const responses = {
            'help': "I can help you create, organize, and optimize your tasks. Try asking about priorities, time management, or task analysis.",
            'priority': "For optimal neural efficiency, I recommend tackling high-priority creative tasks during your peak energy hours (typically morning).",
            'time': "Based on your task patterns, you're averaging 2.4 hours per task. Consider breaking larger tasks into smaller chunks.",
            'productivity': "Your current neural efficiency is at 94%! To maintain this, take regular breaks and alternate between creative and analytical tasks."
        };

        const lowerMessage = userMessage.toLowerCase();
        
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }

        return "I understand you're working on task optimization. Could you be more specific about what you'd like help with?";
    }

    loadSampleData() {
        // Load some sample tasks for demonstration
        const sampleTasks = [
            {
                id: this.taskIdCounter++,
                title: "Design neural interface mockups",
                priority: "high",
                category: "creative",
                deadline: "2025-05-29T18:00",
                notes: "Create wireframes for the new H3X interface components",
                status: "active",
                progress: 45,
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                estimatedTime: 3.2
            },
            {
                id: this.taskIdCounter++,
                title: "Analyze user feedback patterns",
                priority: "medium",
                category: "analytical",
                deadline: "2025-05-30T12:00",
                notes: "Review recent user testing data and extract insights",
                status: "active",
                progress: 20,
                createdAt: new Date(Date.now() - 43200000), // 12 hours ago
                estimatedTime: 2.1
            }
        ];

        this.tasks.push(...sampleTasks);
        this.updateTasksList();
    }

    initChart() {
        const canvas = document.getElementById('taskChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Simple chart drawing (replace with Chart.js in production)
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw sample data bars
        const data = [65, 45, 80, 55, 70, 85, 60];
        const barWidth = canvas.width / data.length;
        const maxHeight = canvas.height - 40;
        
        data.forEach((value, index) => {
            const height = (value / 100) * maxHeight;
            const x = index * barWidth;
            const y = canvas.height - height - 20;
            
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(x + 5, y, barWidth - 10, height);
        });
        
        // Add labels
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        labels.forEach((label, index) => {
            const x = index * barWidth + barWidth / 2;
            ctx.fillText(label, x, canvas.height - 5);
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            backgroundColor: type === 'success' ? '#00ff88' : 
                           type === 'error' ? '#ff4444' : '#00ccff',
            color: '#0a0a1a',
            borderRadius: '8px',
            zIndex: '1000',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.neuralTaskmaster = new NeuralTaskmasterCore();
});
