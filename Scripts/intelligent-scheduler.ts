#!/usr/bin/env node
/**
 * H3X Intelligent Scheduler
 * 
 * Advanced scheduling system that adapts based on repository activity,
 * system load, and historical patterns to optimize maintenance timing
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface ScheduleConfig {
  timezone: string;
  workingHours: {
    start: number; // 0-23
    end: number;   // 0-23
  };
  maintenanceWindows: Array<{
    name: string;
    start: string; // HH:MM
    end: string;   // HH:MM
    days: number[]; // 0=Sunday, 1=Monday, etc.
    priority: number;
  }>;
  adaptiveScheduling: {
    enabled: boolean;
    learningPeriodDays: number;
    activityThreshold: number;
  };
  taskPriorities: Record<string, number>;
}

interface ScheduledTask {
  id: string;
  name: string;
  operation: string;
  priority: number;
  estimatedDuration: number; // minutes
  dependencies: string[];
  constraints: {
    requiresLowActivity?: boolean;
    requiresMaintenanceWindow?: boolean;
    maxRetries?: number;
    cooldownMinutes?: number;
  };
  schedule: {
    type: 'interval' | 'cron' | 'adaptive';
    value: string | number;
    nextRun?: number;
    lastRun?: number;
  };
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

interface ActivityPattern {
  hour: number;
  dayOfWeek: number;
  averageActivity: number;
  commitCount: number;
  prActivity: number;
  issueActivity: number;
}

interface SchedulingDecision {
  task: ScheduledTask;
  scheduledTime: number;
  reason: string;
  confidence: number;
  alternatives: Array<{
    time: number;
    reason: string;
    score: number;
  }>;
}

export class IntelligentScheduler {
  private config: ScheduleConfig;
  private tasks: Map<string, ScheduledTask> = new Map();
  private activityPatterns: ActivityPattern[] = [];
  private schedulingHistory: Array<{
    taskId: string;
    scheduledTime: number;
    actualTime: number;
    success: boolean;
    duration: number;
  }> = [];

  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
    this.loadActivityPatterns();
    this.loadSchedulingHistory();
  }

  // Add a task to the scheduler
  addTask(task: Omit<ScheduledTask, 'id' | 'status'>): string {
    const id = this.generateTaskId();
    const fullTask: ScheduledTask = {
      ...task,
      id,
      status: 'pending'
    };

    this.tasks.set(id, fullTask);
    this.calculateNextRun(fullTask);
    return id;
  }

  // Get optimal scheduling for all pending tasks
  async getOptimalSchedule(lookAheadHours: number = 24): Promise<SchedulingDecision[]> {
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending');
    const decisions: SchedulingDecision[] = [];

    // Update activity patterns
    await this.updateActivityPatterns();

    for (const task of pendingTasks) {
      const decision = await this.scheduleTask(task, lookAheadHours);
      decisions.push(decision);
    }

    // Sort by scheduled time
    decisions.sort((a, b) => a.scheduledTime - b.scheduledTime);

    // Resolve conflicts and dependencies
    return this.resolveSchedulingConflicts(decisions);
  }

  // Schedule a specific task
  private async scheduleTask(task: ScheduledTask, lookAheadHours: number): Promise<SchedulingDecision> {
    const now = Date.now();
    const endTime = now + (lookAheadHours * 60 * 60 * 1000);
    
    // Generate candidate time slots
    const candidates = this.generateCandidateSlots(task, now, endTime);
    
    // Score each candidate
    const scoredCandidates = candidates.map(time => ({
      time,
      score: this.scoreTimeSlot(task, time),
      reason: this.getSchedulingReason(task, time)
    }));

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    const best = scoredCandidates[0];
    const alternatives = scoredCandidates.slice(1, 4); // Top 3 alternatives

    return {
      task,
      scheduledTime: best.time,
      reason: best.reason,
      confidence: this.calculateConfidence(best.score, scoredCandidates),
      alternatives
    };
  }

  // Generate candidate time slots for a task
  private generateCandidateSlots(task: ScheduledTask, startTime: number, endTime: number): number[] {
    const slots: number[] = [];
    const slotInterval = 15 * 60 * 1000; // 15-minute intervals

    for (let time = startTime; time <= endTime; time += slotInterval) {
      if (this.isValidTimeSlot(task, time)) {
        slots.push(time);
      }
    }

    return slots;
  }

  // Check if a time slot is valid for a task
  private isValidTimeSlot(task: ScheduledTask, time: number): boolean {
    const date = new Date(time);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Check working hours constraint
    if (task.constraints.requiresLowActivity) {
      if (hour >= this.config.workingHours.start && hour <= this.config.workingHours.end) {
        return false;
      }
    }

    // Check maintenance window constraint
    if (task.constraints.requiresMaintenanceWindow) {
      const isInMaintenanceWindow = this.config.maintenanceWindows.some(window => {
        if (!window.days.includes(dayOfWeek)) return false;
        
        const [startHour, startMin] = window.start.split(':').map(Number);
        const [endHour, endMin] = window.end.split(':').map(Number);
        
        const windowStart = startHour * 60 + startMin;
        const windowEnd = endHour * 60 + endMin;
        const currentTime = hour * 60 + date.getMinutes();
        
        return currentTime >= windowStart && currentTime <= windowEnd;
      });

      if (!isInMaintenanceWindow) return false;
    }

    // Check cooldown period
    if (task.schedule.lastRun && task.constraints.cooldownMinutes) {
      const cooldownEnd = task.schedule.lastRun + (task.constraints.cooldownMinutes * 60 * 1000);
      if (time < cooldownEnd) return false;
    }

    return true;
  }

  // Score a time slot for a task
  private scoreTimeSlot(task: ScheduledTask, time: number): number {
    let score = 0;
    const date = new Date(time);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Base priority score
    score += task.priority * 10;

    // Activity pattern score
    const activityPattern = this.getActivityPattern(hour, dayOfWeek);
    if (task.constraints.requiresLowActivity) {
      score += (100 - activityPattern.averageActivity) / 10; // Higher score for lower activity
    } else {
      score += activityPattern.averageActivity / 10; // Higher score for higher activity
    }

    // Maintenance window bonus
    const isInMaintenanceWindow = this.isInMaintenanceWindow(time);
    if (isInMaintenanceWindow) {
      score += 20;
    }

    // Historical success rate
    const historicalSuccess = this.getHistoricalSuccessRate(task.operation, hour, dayOfWeek);
    score += historicalSuccess * 15;

    // Urgency factor (how overdue is the task)
    if (task.schedule.nextRun && time > task.schedule.nextRun) {
      const overdueHours = (time - task.schedule.nextRun) / (60 * 60 * 1000);
      score += Math.min(overdueHours * 2, 20); // Cap at 20 points
    }

    // Resource availability (estimated)
    const resourceScore = this.estimateResourceAvailability(time);
    score += resourceScore * 5;

    return Math.max(0, score);
  }

  // Get activity pattern for a specific time
  private getActivityPattern(hour: number, dayOfWeek: number): ActivityPattern {
    const pattern = this.activityPatterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek);
    return pattern || {
      hour,
      dayOfWeek,
      averageActivity: 50, // Default moderate activity
      commitCount: 0,
      prActivity: 0,
      issueActivity: 0
    };
  }

  // Check if time is in a maintenance window
  private isInMaintenanceWindow(time: number): boolean {
    const date = new Date(time);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const dayOfWeek = date.getDay();
    const currentTime = hour * 60 + minute;

    return this.config.maintenanceWindows.some(window => {
      if (!window.days.includes(dayOfWeek)) return false;
      
      const [startHour, startMin] = window.start.split(':').map(Number);
      const [endHour, endMin] = window.end.split(':').map(Number);
      
      const windowStart = startHour * 60 + startMin;
      const windowEnd = endHour * 60 + endMin;
      
      return currentTime >= windowStart && currentTime <= windowEnd;
    });
  }

  // Get historical success rate for an operation at a specific time
  private getHistoricalSuccessRate(operation: string, hour: number, dayOfWeek: number): number {
    const relevantHistory = this.schedulingHistory.filter(h => {
      const date = new Date(h.actualTime);
      return h.taskId.includes(operation) && 
             date.getHours() === hour && 
             date.getDay() === dayOfWeek;
    });

    if (relevantHistory.length === 0) return 0.5; // Default 50% if no history

    const successCount = relevantHistory.filter(h => h.success).length;
    return successCount / relevantHistory.length;
  }

  // Estimate resource availability at a given time
  private estimateResourceAvailability(time: number): number {
    const date = new Date(time);
    const hour = date.getHours();
    
    // Simple heuristic: lower availability during business hours
    if (hour >= 9 && hour <= 17) {
      return 0.3; // 30% availability during business hours
    } else if (hour >= 18 && hour <= 22) {
      return 0.7; // 70% availability during evening
    } else {
      return 1.0; // 100% availability during night/early morning
    }
  }

  // Calculate confidence in scheduling decision
  private calculateConfidence(bestScore: number, allCandidates: Array<{score: number}>): number {
    if (allCandidates.length < 2) return 1.0;

    const secondBest = allCandidates[1].score;
    const scoreGap = bestScore - secondBest;
    const maxPossibleGap = bestScore;

    return Math.min(1.0, scoreGap / maxPossibleGap);
  }

  // Get scheduling reason
  private getSchedulingReason(task: ScheduledTask, time: number): string {
    const reasons: string[] = [];
    const date = new Date(time);
    const hour = date.getHours();

    if (this.isInMaintenanceWindow(time)) {
      reasons.push('maintenance window');
    }

    const activityPattern = this.getActivityPattern(hour, date.getDay());
    if (activityPattern.averageActivity < 30) {
      reasons.push('low activity period');
    }

    if (hour >= 2 && hour <= 6) {
      reasons.push('optimal time for system maintenance');
    }

    if (task.schedule.nextRun && time <= task.schedule.nextRun + 60 * 60 * 1000) {
      reasons.push('scheduled time');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'best available slot';
  }

  // Resolve scheduling conflicts between tasks
  private resolveSchedulingConflicts(decisions: SchedulingDecision[]): SchedulingDecision[] {
    const resolved: SchedulingDecision[] = [];
    const timeSlots: Map<number, SchedulingDecision> = new Map();

    for (const decision of decisions) {
      const slotKey = Math.floor(decision.scheduledTime / (15 * 60 * 1000)); // 15-minute slots
      
      if (!timeSlots.has(slotKey)) {
        timeSlots.set(slotKey, decision);
        resolved.push(decision);
      } else {
        // Conflict detected - reschedule lower priority task
        const existing = timeSlots.get(slotKey)!;
        
        if (decision.task.priority > existing.task.priority) {
          // Replace existing with higher priority task
          const existingIndex = resolved.indexOf(existing);
          resolved[existingIndex] = decision;
          timeSlots.set(slotKey, decision);
          
          // Reschedule the displaced task
          const rescheduled = this.rescheduleTask(existing, decisions);
          if (rescheduled) {
            resolved.push(rescheduled);
          }
        } else {
          // Reschedule current task
          const rescheduled = this.rescheduleTask(decision, decisions);
          if (rescheduled) {
            resolved.push(rescheduled);
          }
        }
      }
    }

    return resolved.sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  // Reschedule a task to avoid conflicts
  private rescheduleTask(decision: SchedulingDecision, allDecisions: SchedulingDecision[]): SchedulingDecision | null {
    // Try alternatives first
    for (const alternative of decision.alternatives) {
      const slotKey = Math.floor(alternative.time / (15 * 60 * 1000));
      const hasConflict = allDecisions.some(d => 
        Math.floor(d.scheduledTime / (15 * 60 * 1000)) === slotKey
      );
      
      if (!hasConflict) {
        return {
          ...decision,
          scheduledTime: alternative.time,
          reason: `rescheduled: ${alternative.reason}`,
          confidence: decision.confidence * 0.8 // Reduce confidence for rescheduled tasks
        };
      }
    }

    // If no alternatives work, delay by 30 minutes
    return {
      ...decision,
      scheduledTime: decision.scheduledTime + (30 * 60 * 1000),
      reason: 'rescheduled due to conflict',
      confidence: decision.confidence * 0.6
    };
  }

  // Update activity patterns based on recent repository activity
  private async updateActivityPatterns(): Promise<void> {
    // This would integrate with GitHub API to get recent activity
    // For now, we'll use mock data
    
    // In a real implementation, this would:
    // 1. Fetch recent commits, PRs, issues
    // 2. Analyze patterns by hour and day of week
    // 3. Update the activityPatterns array
    
    console.log('Activity patterns updated (mock implementation)');
  }

  // Calculate next run time for a task
  private calculateNextRun(task: ScheduledTask): void {
    const now = Date.now();
    
    switch (task.schedule.type) {
      case 'interval':
        const interval = task.schedule.value as number;
        task.schedule.nextRun = now + (interval * 60 * 1000); // Convert minutes to ms
        break;
        
      case 'cron':
        // This would require a cron parser library
        // For now, set to next hour
        task.schedule.nextRun = now + (60 * 60 * 1000);
        break;
        
      case 'adaptive':
        // Use intelligent scheduling
        task.schedule.nextRun = now + (4 * 60 * 60 * 1000); // Default 4 hours
        break;
    }
  }

  // Load configuration
  private loadConfig(configPath?: string): ScheduleConfig {
    const defaultConfig: ScheduleConfig = {
      timezone: 'UTC',
      workingHours: { start: 9, end: 17 },
      maintenanceWindows: [
        {
          name: 'Night Maintenance',
          start: '02:00',
          end: '06:00',
          days: [0, 1, 2, 3, 4, 5, 6], // Every day
          priority: 1
        }
      ],
      adaptiveScheduling: {
        enabled: true,
        learningPeriodDays: 30,
        activityThreshold: 50
      },
      taskPriorities: {
        'security-scan': 100,
        'dependency-update': 80,
        'branch-cleanup': 60,
        'health-check': 90,
        'conflict-resolution': 95
      }
    };

    // In a real implementation, load from file
    return defaultConfig;
  }

  // Load activity patterns from storage
  private loadActivityPatterns(): void {
    // In a real implementation, load from persistent storage
    // For now, generate some default patterns
    this.activityPatterns = [];
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        this.activityPatterns.push({
          hour,
          dayOfWeek: day,
          averageActivity: this.generateMockActivity(hour, day),
          commitCount: 0,
          prActivity: 0,
          issueActivity: 0
        });
      }
    }
  }

  // Generate mock activity data
  private generateMockActivity(hour: number, dayOfWeek: number): number {
    // Higher activity during business hours on weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      if (hour >= 9 && hour <= 17) {
        return 70 + Math.random() * 20; // 70-90% activity
      } else if (hour >= 18 && hour <= 22) {
        return 30 + Math.random() * 20; // 30-50% activity
      } else {
        return Math.random() * 20; // 0-20% activity
      }
    } else { // Weekend
      if (hour >= 10 && hour <= 20) {
        return 20 + Math.random() * 30; // 20-50% activity
      } else {
        return Math.random() * 15; // 0-15% activity
      }
    }
  }

  // Load scheduling history
  private loadSchedulingHistory(): void {
    // In a real implementation, load from persistent storage
    this.schedulingHistory = [];
  }

  // Generate unique task ID
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // Get all tasks
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  // Update task status
  updateTaskStatus(taskId: string, status: ScheduledTask['status']): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      if (status === 'completed') {
        task.schedule.lastRun = Date.now();
        this.calculateNextRun(task);
        task.status = 'pending'; // Reset for next run
      }
    }
  }
}

// Export for use in other modules
export { ScheduledTask, ScheduleConfig, SchedulingDecision };
