<<<<<<< HEAD
=======
/**
 * REAL-TIME MANAGER MODULE
 * IN OUT MANAGER - Real-time Employee Monitoring System
 * Version: 2.0.0
 * Author: IN OUT MANAGER Team
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

class RealTimeManagerModule {
    constructor() {
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.updateInterval = null;
        this.isConnected = false;
        this.subscriptions = new Map();
        this.activityFeed = [];
        this.maxFeedItems = 50;
    }

<<<<<<< HEAD
=======
    // Initialize real-time monitoring
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    async initialize() {
        try {
            await this.initializeWebSocket();
            this.startPeriodicUpdates();
            this.setupEventListeners();
            
<<<<<<< HEAD
            console.log(' Real-time Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing real-time manager:', error);
=======
            console.log('⚡ Real-time Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing real-time manager:', error);
            // Fallback to polling if WebSocket fails
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            this.startFallbackPolling();
        }
    }

<<<<<<< HEAD
=======
    // Initialize WebSocket connection
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    async initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/admin`;

        try {
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
<<<<<<< HEAD
                console.log(' WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus(true);
=======
                console.log('🔗 WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus(true);
                
                // Send authentication
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
                this.websocket.send(JSON.stringify({
                    type: 'auth',
                    token: localStorage.getItem('adminToken')
                }));
            };

            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(event);
            };

            this.websocket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus(false);
                this.attemptReconnect();
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus(false);
            };

        } catch (error) {
            console.error('Error creating WebSocket:', error);
            throw error;
        }
    }
<<<<<<< HEAD
=======

    // Handle WebSocket messages
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    handleWebSocketMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'employee_entry':
                    this.handleEmployeeEntry(data);
                    break;
                case 'employee_exit':
                    this.handleEmployeeExit(data);
                    break;
                case 'status_update':
                    this.handleStatusUpdate(data);
                    break;
                case 'alert':
                    this.handleAlert(data);
                    break;
                case 'stats_update':
                    this.handleStatsUpdate(data);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }
<<<<<<< HEAD
=======

    // Handle employee entry
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    handleEmployeeEntry(data) {
        const activity = {
            id: Date.now(),
            type: 'entry',
            employeeName: data.employee.nombre,
            employeeId: data.employee.id,
            timestamp: new Date(data.timestamp),
            message: `${data.employee.nombre} ha ingresado al trabajo`,
            avatar: data.employee.avatar,
            department: data.employee.departamento
        };

        this.addActivityToFeed(activity);
        this.updateEmployeeStatus(data.employee.id, 'working');
        this.updateRealTimeStats();
<<<<<<< HEAD
        this.showNotification(`Ingreso: ${data.employee.nombre}`, 'info');
    }
=======
        
        // Show notification
        this.showNotification(`Ingreso: ${data.employee.nombre}`, 'info');
    }

    // Handle employee exit
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    handleEmployeeExit(data) {
        const activity = {
            id: Date.now(),
            type: 'exit',
            employeeName: data.employee.nombre,
            employeeId: data.employee.id,
            timestamp: new Date(data.timestamp),
            message: `${data.employee.nombre} ha salido del trabajo`,
            avatar: data.employee.avatar,
            department: data.employee.departamento
        };

        this.addActivityToFeed(activity);
        this.updateEmployeeStatus(data.employee.id, 'inactive');
        this.updateRealTimeStats();
<<<<<<< HEAD
        this.showNotification(`Salida: ${data.employee.nombre}`, 'warning');
    }

=======
        
        // Show notification
        this.showNotification(`Salida: ${data.employee.nombre}`, 'warning');
    }

    // Handle status updates
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    handleStatusUpdate(data) {
        this.updateEmployeeStatus(data.employeeId, data.status);
        
        if (data.status === 'break') {
            const activity = {
                id: Date.now(),
                type: 'break',
                employeeName: data.employeeName,
                employeeId: data.employeeId,
                timestamp: new Date(),
                message: `${data.employeeName} está en descanso`,
                avatar: data.avatar
            };
            this.addActivityToFeed(activity);
        }
    }
<<<<<<< HEAD
=======

    // Handle alerts
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    handleAlert(data) {
        const activity = {
            id: Date.now(),
            type: 'alert',
            message: data.message,
            timestamp: new Date(data.timestamp),
            severity: data.severity,
            employeeId: data.employeeId || null
        };

        this.addActivityToFeed(activity);
        this.showNotification(data.message, data.severity);
<<<<<<< HEAD
        this.updateAlertCounter();
    }
=======
        
        // Update alert counter
        this.updateAlertCounter();
    }

    // Handle stats updates
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    handleStatsUpdate(data) {
        this.updateRealTimeStatsDisplay(data.stats);
    }

<<<<<<< HEAD
    addActivityToFeed(activity) {
        this.activityFeed.unshift(activity);

=======
    // Add activity to feed
    addActivityToFeed(activity) {
        this.activityFeed.unshift(activity);
        
        // Limit feed size
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        if (this.activityFeed.length > this.maxFeedItems) {
            this.activityFeed = this.activityFeed.slice(0, this.maxFeedItems);
        }

        this.renderActivityFeed();
    }

<<<<<<< HEAD
    renderActivityFeed() {
        const feedContainer = document.querySelector('.realtime-feed');
        if (!feedContainer) return;
=======
    // Render activity feed
    renderActivityFeed() {
        const feedContainer = document.querySelector('.realtime-feed');
        if (!feedContainer) return;

>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        feedContainer.innerHTML = this.activityFeed.map(activity => `
            <div class="feed-item animate-slide-up" data-activity-id="${activity.id}">
                <div class="feed-icon ${activity.type}">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="feed-content">
                    <div class="feed-text">${activity.message}</div>
                    <div class="feed-time">${this.formatTime(activity.timestamp)}</div>
                    ${activity.department ? `<div class="feed-department">${activity.department}</div>` : ''}
                </div>
                ${activity.avatar ? `
                    <div class="feed-avatar">
                        <img src="${activity.avatar}" alt="${activity.employeeName}" class="activity-avatar">
                    </div>
                ` : ''}
            </div>
        `).join('');
<<<<<<< HEAD
=======

        // Add click handlers for employee activities
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        feedContainer.querySelectorAll('[data-activity-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                const activityId = item.dataset.activityId;
                const activity = this.activityFeed.find(a => a.id == activityId);
                if (activity && activity.employeeId) {
                    this.showEmployeeDetails(activity.employeeId);
                }
            });
        });
    }
<<<<<<< HEAD
    getActivityIcon(type) {
        const icons = {
            'entry': '<i class="fas fa-right-to-bracket"></i>',
            'exit': '<i class="fas fa-right-from-bracket"></i>',
=======

    // Get activity icon
    getActivityIcon(type) {
        const icons = {
            'entry': '<i class="fas fa-sign-in-alt"></i>',
            'exit': '<i class="fas fa-sign-out-alt"></i>',
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            'break': '<i class="fas fa-coffee"></i>',
            'alert': '<i class="fas fa-exclamation-triangle"></i>',
            'update': '<i class="fas fa-sync-alt"></i>'
        };
        return icons[type] || '<i class="fas fa-info-circle"></i>';
    }

<<<<<<< HEAD
=======
    // Update real-time stats
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    async updateRealTimeStats() {
        try {
            const response = await fetch('/api/admin/realtime/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                const stats = await response.json();
                this.updateRealTimeStatsDisplay(stats);
            }
        } catch (error) {
            console.error('Error updating real-time stats:', error);
        }
    }

<<<<<<< HEAD
=======
    // Update real-time stats display
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    updateRealTimeStatsDisplay(stats) {
        const elements = {
            present: document.getElementById('presentEmployees'),
            absent: document.getElementById('absentEmployees'),
            onBreak: document.getElementById('employeesOnBreak'),
            lateArrivals: document.getElementById('lateArrivals')
        };

        Object.entries(stats).forEach(([key, value]) => {
            if (elements[key]) {
                this.animateValue(elements[key], value);
            }
        });

<<<<<<< HEAD
        this.updateProgressBars(stats);
    }

=======
        // Update progress bars if they exist
        this.updateProgressBars(stats);
    }

    // Animate value changes
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    animateValue(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
<<<<<<< HEAD
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
=======
            
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
            
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

<<<<<<< HEAD
=======
    // Update progress bars
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    updateProgressBars(stats) {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const type = bar.dataset.type;
            if (stats[type + 'Percentage']) {
                bar.style.width = `${stats[type + 'Percentage']}%`;
            }
        });
    }

<<<<<<< HEAD
=======
    // Update employee status in UI
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    updateEmployeeStatus(employeeId, status) {
        const employeeRows = document.querySelectorAll(`[data-employee-id="${employeeId}"]`);
        employeeRows.forEach(row => {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = `status-badge ${status}`;
                statusBadge.textContent = this.getStatusText(status);
            }
        });
    }

<<<<<<< HEAD
=======
    // Get status text
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    getStatusText(status) {
        const statusMap = {
            'working': 'Trabajando',
            'inactive': 'Inactivo',
            'break': 'Descanso',
            'absent': 'Ausente'
        };
        return statusMap[status] || status;
    }

<<<<<<< HEAD
=======
    // Update connection status
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    updateConnectionStatus(connected) {
        const statusElement = document.querySelector('.connection-status');
        if (statusElement) {
            statusElement.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
            statusElement.textContent = connected ? 'Conectado' : 'Desconectado';
        }

        const statusIndicator = document.querySelector('.realtime-status');
        if (statusIndicator) {
            statusIndicator.className = `realtime-status ${connected ? 'online' : 'offline'}`;
        }
    }

<<<<<<< HEAD
=======
    // Update alert counter
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    updateAlertCounter() {
        const counter = document.querySelector('.alert-counter');
        if (counter) {
            const currentCount = parseInt(counter.textContent) || 0;
            counter.textContent = currentCount + 1;
            counter.classList.add('pulse');
            setTimeout(() => counter.classList.remove('pulse'), 1000);
        }
    }

<<<<<<< HEAD
=======
    // Show notification
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    showNotification(message, type = 'info') {
        if (window.notificationSystem) {
            window.notificationSystem.showToast(message, type);
        }
    }

<<<<<<< HEAD
=======
    // Start periodic updates (fallback)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    startPeriodicUpdates() {
        this.updateInterval = setInterval(() => {
            if (!this.isConnected) {
                this.updateRealTimeStats();
            }
        }, 5000);
    }

<<<<<<< HEAD
    startFallbackPolling() {
        console.log(' Starting fallback polling mode');
=======
    // Start fallback polling
    startFallbackPolling() {
        console.log('📡 Starting fallback polling mode');
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        
        setInterval(async () => {
            try {
                await this.updateRealTimeStats();
                await this.pollRecentActivity();
            } catch (error) {
                console.error('Error in fallback polling:', error);
            }
        }, 10000);
    }

<<<<<<< HEAD
=======
    // Poll recent activity
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    async pollRecentActivity() {
        try {
            const response = await fetch('/api/admin/activity/recent', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                const activities = await response.json();
                activities.forEach(activity => {
<<<<<<< HEAD

                  if (!this.activityFeed.find(a => a.id === activity.id)) {
=======
                    // Only add if not already in feed
                    if (!this.activityFeed.find(a => a.id === activity.id)) {
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
                        this.addActivityToFeed(activity);
                    }
                });
            }
        } catch (error) {
            console.error('Error polling recent activity:', error);
        }
    }

<<<<<<< HEAD
=======
    // Attempt WebSocket reconnection
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
<<<<<<< HEAD
            console.log(` Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
=======
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            
            setTimeout(() => {
                this.initializeWebSocket();
            }, delay);
        } else {
<<<<<<< HEAD
            console.log(' Max reconnection attempts reached, switching to polling mode');
=======
            console.log('❌ Max reconnection attempts reached, switching to polling mode');
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            this.startFallbackPolling();
        }
    }

<<<<<<< HEAD
    setupEventListeners() {
=======
    // Setup event listeners
    setupEventListeners() {
        // Manual refresh button
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        const refreshBtn = document.querySelector('[data-action="refresh-realtime"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateRealTimeStats();
            });
        }
<<<<<<< HEAD
=======

        // Filter controls
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        const feedFilter = document.getElementById('feedFilter');
        if (feedFilter) {
            feedFilter.addEventListener('change', (e) => {
                this.filterActivityFeed(e.target.value);
            });
        }
<<<<<<< HEAD
=======

        // Clear feed button
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        const clearFeedBtn = document.querySelector('[data-action="clear-feed"]');
        if (clearFeedBtn) {
            clearFeedBtn.addEventListener('click', () => {
                this.clearActivityFeed();
            });
        }
    }

<<<<<<< HEAD
=======
    // Filter activity feed
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    filterActivityFeed(filterType) {
        const feedItems = document.querySelectorAll('.feed-item');
        feedItems.forEach(item => {
            const activityType = item.querySelector('.feed-icon').classList[1];
            
            if (filterType === 'all' || activityType === filterType) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
<<<<<<< HEAD
=======

    // Clear activity feed
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    clearActivityFeed() {
        if (confirm('¿Está seguro de que desea limpiar el feed de actividad?')) {
            this.activityFeed = [];
            this.renderActivityFeed();
        }
    }
<<<<<<< HEAD
=======

    // Show employee details
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    showEmployeeDetails(employeeId) {
        if (window.employeeManager) {
            window.employeeManager.showEmployeeModal(employeeId);
        }
    }
<<<<<<< HEAD
=======

    // Format time
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

<<<<<<< HEAD
=======
    // Export activity feed
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    exportActivityFeed() {
        const data = this.activityFeed.map(activity => ({
            timestamp: activity.timestamp.toISOString(),
            type: activity.type,
            message: activity.message,
            employee: activity.employeeName,
            department: activity.department
        }));

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-feed-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

<<<<<<< HEAD
=======
    // Get real-time statistics
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    getRealTimeStats() {
        return {
            connected: this.isConnected,
            activityCount: this.activityFeed.length,
            lastUpdate: new Date(),
            websocketStatus: this.websocket ? this.websocket.readyState : null
        };
    }

<<<<<<< HEAD
=======
    // Destroy real-time manager
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    destroy() {
        if (this.websocket) {
            this.websocket.close();
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.subscriptions.clear();
        this.activityFeed = [];
        console.log('🔌 Real-time Manager destroyed');
    }
}

<<<<<<< HEAD
=======
// Export module
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeManagerModule;
} else {
    window.RealTimeManagerModule = RealTimeManagerModule;
}