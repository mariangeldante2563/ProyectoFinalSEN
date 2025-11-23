/**
 * SERVICE WORKER MANAGER MODULE
 * IN OUT MANAGER - PWA Service Worker Management
 * Version: 2.0.0
 * Author: IN OUT MANAGER Team
 */

class ServiceWorkerManagerModule {
    constructor() {
        this.serviceWorker = null;
        this.isOnline = navigator.onLine;
        this.installPrompt = null;
        this.notificationPermission = null;
        this.syncQueue = [];
        this.cacheStatus = {
            enabled: false,
            size: 0,
            version: '1.0.0'
        };
    }

    // Initialize service worker manager
    async initialize() {
        if ('serviceWorker' in navigator) {
            try {
                await this.registerServiceWorker();
                this.setupEventListeners();
                this.checkNotificationPermission();
                this.setupInstallPrompt();
                this.setupOfflineSync();
                
                console.log('⚙️ Service Worker Manager initialized successfully');
            } catch (error) {
                console.error('Error initializing Service Worker Manager:', error);
            }
        } else {
            console.warn('Service Worker not supported in this browser');
        }
    }

    // Register service worker
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            this.serviceWorker = registration;

            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });

            // Handle service worker messages
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event);
            });

            console.log('✅ Service Worker registered successfully');
            this.updateServiceWorkerStatus('registered');

        } catch (error) {
            console.error('Service Worker registration failed:', error);
            this.updateServiceWorkerStatus('failed');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus(true);
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus(false);
        });

        // Install PWA button
        const installButton = document.getElementById('installPWA');
        if (installButton) {
            installButton.addEventListener('click', () => {
                this.installPWA();
            });
        }

        // Enable notifications button
        const notifyButton = document.getElementById('enableNotifications');
        if (notifyButton) {
            notifyButton.addEventListener('click', () => {
                this.requestNotificationPermission();
            });
        }

        // Clear cache button
        const clearCacheButton = document.getElementById('clearCache');
        if (clearCacheButton) {
            clearCacheButton.addEventListener('click', () => {
                this.clearCache();
            });
        }

        // Update app button
        const updateButton = document.getElementById('updateApp');
        if (updateButton) {
            updateButton.addEventListener('click', () => {
                this.updateApp();
            });
        }
    }

    // Handle service worker messages
    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;

        switch (type) {
            case 'CACHE_UPDATED':
                this.updateCacheStatus(data);
                break;
            case 'SYNC_COMPLETE':
                this.handleSyncComplete(data);
                break;
            case 'NOTIFICATION_CLICK':
                this.handleNotificationClick(data);
                break;
            case 'OFFLINE_FALLBACK':
                this.handleOfflineFallback(data);
                break;
            default:
                console.log('Unknown service worker message:', type, data);
        }
    }

    // Setup install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            this.installPrompt = event;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.hideInstallButton();
            this.showNotification('Aplicación instalada exitosamente', 'success');
        });
    }

    // Setup offline sync
    setupOfflineSync() {
        // Intercept form submissions for offline sync
        document.addEventListener('submit', (event) => {
            if (!this.isOnline) {
                event.preventDefault();
                this.queueFormSubmission(event.target);
            }
        });

        // Intercept API calls for offline sync
        this.interceptFetch();
    }

    // Intercept fetch requests
    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                return response;
            } catch (error) {
                if (!this.isOnline) {
                    // Queue request for later sync
                    this.queueRequest(args);
                    throw new Error('Request queued for offline sync');
                }
                throw error;
            }
        };
    }

    // Install PWA
    async installPWA() {
        if (!this.installPrompt) {
            this.showNotification('La instalación no está disponible', 'warning');
            return;
        }

        try {
            this.installPrompt.prompt();
            const result = await this.installPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                console.log('User accepted PWA install');
            } else {
                console.log('User dismissed PWA install');
            }
            
            this.installPrompt = null;
            this.hideInstallButton();
            
        } catch (error) {
            console.error('Error installing PWA:', error);
            this.showNotification('Error al instalar la aplicación', 'error');
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            
            if (permission === 'granted') {
                this.showNotification('Notificaciones habilitadas', 'success');
                this.subscribeToNotifications();
            } else {
                this.showNotification('Notificaciones denegadas', 'warning');
            }
            
            this.updateNotificationStatus(permission);
            
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            this.showNotification('Error al solicitar permisos', 'error');
        }
    }

    // Subscribe to push notifications
    async subscribeToNotifications() {
        if (!this.serviceWorker) return;

        try {
            const subscription = await this.serviceWorker.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(window.VAPID_PUBLIC_KEY || '')
            });

            // Send subscription to server
            await fetch('/api/admin/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(subscription)
            });

            console.log('Push notification subscription successful');
            
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    }

    // Show update notification
    showUpdateNotification() {
        const updateNotification = document.getElementById('updateNotification');
        if (updateNotification) {
            updateNotification.style.display = 'block';
        } else {
            this.showNotification('Nueva versión disponible. Actualice la aplicación.', 'info');
        }
    }

    // Update app
    async updateApp() {
        if (!this.serviceWorker) return;

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                
                // Reload after update
                window.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            }
        } catch (error) {
            console.error('Error updating app:', error);
            this.showNotification('Error al actualizar la aplicación', 'error');
        }
    }

    // Clear cache
    async clearCache() {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.active) {
                    registration.active.postMessage({ type: 'CLEAR_CACHE' });
                }
            }

            // Also clear browser cache
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }

            this.showNotification('Caché limpiado exitosamente', 'success');
            this.updateCacheStatus({ size: 0, enabled: false });
            
        } catch (error) {
            console.error('Error clearing cache:', error);
            this.showNotification('Error al limpiar el caché', 'error');
        }
    }

    // Queue form submission for offline sync
    queueFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const queueItem = {
            id: Date.now(),
            type: 'form',
            url: form.action,
            method: form.method || 'POST',
            data: data,
            timestamp: new Date().toISOString()
        };

        this.syncQueue.push(queueItem);
        this.saveSyncQueue();
        
        this.showNotification('Formulario guardado para sincronización', 'info');
    }

    // Queue request for offline sync
    queueRequest(args) {
        const [url, options = {}] = args;
        
        const queueItem = {
            id: Date.now(),
            type: 'request',
            url: url,
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body,
            timestamp: new Date().toISOString()
        };

        this.syncQueue.push(queueItem);
        this.saveSyncQueue();
    }

    // Process sync queue when online
    async processSyncQueue() {
        if (this.syncQueue.length === 0) return;

        const itemsToProcess = [...this.syncQueue];
        this.syncQueue = [];

        for (const item of itemsToProcess) {
            try {
                await this.processQueueItem(item);
                this.showNotification(`Sincronizado: ${item.type}`, 'success');
            } catch (error) {
                console.error('Error processing sync item:', error);
                // Re-queue failed items
                this.syncQueue.push(item);
            }
        }

        this.saveSyncQueue();
    }

    // Process individual queue item
    async processQueueItem(item) {
        if (item.type === 'form') {
            await fetch(item.url, {
                method: item.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(item.data)
            });
        } else if (item.type === 'request') {
            await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.body
            });
        }
    }

    // Save sync queue to localStorage
    saveSyncQueue() {
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }

    // Load sync queue from localStorage
    loadSyncQueue() {
        const saved = localStorage.getItem('syncQueue');
        if (saved) {
            this.syncQueue = JSON.parse(saved);
        }
    }

    // Handle sync complete
    handleSyncComplete(data) {
        console.log('Background sync completed:', data);
        this.showNotification('Sincronización completada', 'success');
    }

    // Handle notification click
    handleNotificationClick(data) {
        console.log('Notification clicked:', data);
        
        // Navigate to relevant page if needed
        if (data.url) {
            window.location.href = data.url;
        }
    }

    // Handle offline fallback
    handleOfflineFallback(data) {
        console.log('Offline fallback triggered:', data);
        this.showOfflineMessage();
    }

    // Check notification permission
    checkNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
            this.updateNotificationStatus(this.notificationPermission);
        }
    }

    // Update connection status
    updateConnectionStatus(online) {
        const statusElement = document.querySelector('.connection-status');
        if (statusElement) {
            statusElement.className = `connection-status ${online ? 'online' : 'offline'}`;
            statusElement.textContent = online ? 'En línea' : 'Sin conexión';
        }

        // Update offline indicator
        const offlineIndicator = document.querySelector('.offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.style.display = online ? 'none' : 'block';
        }

        if (online) {
            this.hideOfflineMessage();
        } else {
            this.showOfflineMessage();
        }
    }

    // Update service worker status
    updateServiceWorkerStatus(status) {
        const statusElement = document.querySelector('.sw-status');
        if (statusElement) {
            statusElement.className = `sw-status ${status}`;
            statusElement.textContent = this.getServiceWorkerStatusText(status);
        }
    }

    // Update notification status
    updateNotificationStatus(permission) {
        const statusElement = document.querySelector('.notification-status');
        if (statusElement) {
            statusElement.className = `notification-status ${permission}`;
            statusElement.textContent = this.getNotificationStatusText(permission);
        }

        const enableButton = document.getElementById('enableNotifications');
        if (enableButton) {
            enableButton.style.display = permission === 'granted' ? 'none' : 'block';
        }
    }

    // Update cache status
    updateCacheStatus(status) {
        this.cacheStatus = { ...this.cacheStatus, ...status };
        
        const statusElement = document.querySelector('.cache-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="cache-info">
                    <span>Caché: ${this.cacheStatus.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
                    <span>Tamaño: ${this.formatCacheSize(this.cacheStatus.size)}</span>
                    <span>Versión: ${this.cacheStatus.version}</span>
                </div>
            `;
        }
    }

    // Show install button
    showInstallButton() {
        const installButton = document.getElementById('installPWA');
        if (installButton) {
            installButton.style.display = 'block';
        }
    }

    // Hide install button
    hideInstallButton() {
        const installButton = document.getElementById('installPWA');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    // Show offline message
    showOfflineMessage() {
        let offlineMessage = document.getElementById('offlineMessage');
        
        if (!offlineMessage) {
            offlineMessage = document.createElement('div');
            offlineMessage.id = 'offlineMessage';
            offlineMessage.className = 'offline-message';
            offlineMessage.innerHTML = `
                <div class="offline-content">
                    <i class="fas fa-wifi"></i>
                    <h3>Sin conexión a internet</h3>
                    <p>Los datos se sincronizarán cuando se restablezca la conexión.</p>
                </div>
            `;
            document.body.appendChild(offlineMessage);
        }
        
        offlineMessage.style.display = 'flex';
    }

    // Hide offline message
    hideOfflineMessage() {
        const offlineMessage = document.getElementById('offlineMessage');
        if (offlineMessage) {
            offlineMessage.style.display = 'none';
        }
    }

    // Send notification
    async sendNotification(title, options = {}) {
        if (this.notificationPermission !== 'granted') return;

        try {
            if (this.serviceWorker && this.serviceWorker.showNotification) {
                await this.serviceWorker.showNotification(title, {
                    body: options.body || '',
                    icon: options.icon || '/assets/img/icon.jpg',
                    badge: options.badge || '/assets/img/badge.png',
                    tag: options.tag || 'default',
                    requireInteraction: options.requireInteraction || false,
                    actions: options.actions || [],
                    data: options.data || {}
                });
            } else {
                new Notification(title, options);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    // Utility functions
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    getServiceWorkerStatusText(status) {
        const statusMap = {
            'registered': 'Registrado',
            'failed': 'Error',
            'updating': 'Actualizando',
            'updated': 'Actualizado'
        };
        return statusMap[status] || status;
    }

    getNotificationStatusText(permission) {
        const permissionMap = {
            'granted': 'Habilitadas',
            'denied': 'Denegadas',
            'default': 'Pendientes'
        };
        return permissionMap[permission] || permission;
    }

    formatCacheSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type) {
        if (window.notificationSystem) {
            window.notificationSystem.showToast(message, type);
        }
    }

    // Get service worker info
    getServiceWorkerInfo() {
        return {
            registered: !!this.serviceWorker,
            isOnline: this.isOnline,
            notificationPermission: this.notificationPermission,
            cacheStatus: this.cacheStatus,
            syncQueueLength: this.syncQueue.length,
            installPromptAvailable: !!this.installPrompt
        };
    }

    // Destroy service worker manager
    async destroy() {
        if (this.serviceWorker) {
            try {
                await this.serviceWorker.unregister();
                console.log('Service Worker unregistered');
            } catch (error) {
                console.error('Error unregistering Service Worker:', error);
            }
        }
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    window.serviceWorkerManager = new ServiceWorkerManagerModule();
    window.serviceWorkerManager.initialize();
    window.serviceWorkerManager.loadSyncQueue();
});

// Export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceWorkerManagerModule;
} else {
    window.ServiceWorkerManagerModule = ServiceWorkerManagerModule;
}