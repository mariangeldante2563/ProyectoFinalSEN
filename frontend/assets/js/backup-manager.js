/**
 * BACKUP MANAGER MODULE
 * IN OUT MANAGER - Advanced Backup and Restore System
 * Version: 2.0.0
 * Author: IN OUT MANAGER Team
 */

class BackupManagerModule {
    constructor() {
        this.backups = [];
        this.backupTypes = this.getBackupTypes();
        this.scheduledBackups = [];
        this.isBackupInProgress = false;
        this.backupProgress = 0;
        this.currentBackupId = null;
    }

    // Initialize backup manager
    initialize() {
        this.setupEventListeners();
        this.loadBackupHistory();
        this.loadScheduledBackups();
        this.checkBackupStatus();
        
        console.log('💾 Backup Manager initialized successfully');
    }

    // Setup event listeners
    setupEventListeners() {
        // Quick backup button
        const quickBackupBtn = document.getElementById('quickBackup');
        if (quickBackupBtn) {
            quickBackupBtn.addEventListener('click', () => this.performQuickBackup());
        }

        // Full backup button
        const fullBackupBtn = document.getElementById('fullBackup');
        if (fullBackupBtn) {
            fullBackupBtn.addEventListener('click', () => this.performFullBackup());
        }

        // Custom backup button
        const customBackupBtn = document.getElementById('customBackup');
        if (customBackupBtn) {
            customBackupBtn.addEventListener('click', () => this.showCustomBackupModal());
        }

        // Schedule backup button
        const scheduleBackupBtn = document.getElementById('scheduleBackup');
        if (scheduleBackupBtn) {
            scheduleBackupBtn.addEventListener('click', () => this.showScheduleBackupModal());
        }

        // Restore buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('restore-backup-btn')) {
                const backupId = e.target.dataset.backupId;
                this.showRestoreModal(backupId);
            }
        });

        // Download backup buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-backup-btn')) {
                const backupId = e.target.dataset.backupId;
                this.downloadBackup(backupId);
            }
        });

        // Delete backup buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-backup-btn')) {
                const backupId = e.target.dataset.backupId;
                this.deleteBackup(backupId);
            }
        });

        // Auto-backup toggle
        const autoBackupToggle = document.getElementById('autoBackupEnabled');
        if (autoBackupToggle) {
            autoBackupToggle.addEventListener('change', (e) => {
                this.toggleAutoBackup(e.target.checked);
            });
        }

        // Cloud storage toggle
        const cloudStorageToggle = document.getElementById('cloudStorageEnabled');
        if (cloudStorageToggle) {
            cloudStorageToggle.addEventListener('change', (e) => {
                this.toggleCloudStorage(e.target.checked);
            });
        }
    }

    // Load backup history
    async loadBackupHistory() {
        try {
            const response = await fetch('/api/admin/backup/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                this.backups = await response.json();
                this.renderBackupHistory();
                this.updateBackupStats();
            }
        } catch (error) {
            console.error('Error loading backup history:', error);
            this.showNotification('Error al cargar el historial de respaldos', 'error');
        }
    }

    // Load scheduled backups
    async loadScheduledBackups() {
        try {
            const response = await fetch('/api/admin/backup/scheduled', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                this.scheduledBackups = await response.json();
                this.renderScheduledBackups();
            }
        } catch (error) {
            console.error('Error loading scheduled backups:', error);
        }
    }

    // Check backup status
    async checkBackupStatus() {
        try {
            const response = await fetch('/api/admin/backup/status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                const status = await response.json();
                this.updateBackupStatus(status);
            }
        } catch (error) {
            console.error('Error checking backup status:', error);
        }
    }

    // Perform quick backup
    async performQuickBackup() {
        if (this.isBackupInProgress) {
            this.showNotification('Ya hay un respaldo en progreso', 'warning');
            return;
        }

        try {
            this.startBackupProgress('Respaldo rápido');
            
            const response = await fetch('/api/admin/backup/quick', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    type: 'quick',
                    description: 'Respaldo rápido generado manualmente'
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.currentBackupId = result.backupId;
                this.monitorBackupProgress(result.backupId);
            } else {
                throw new Error('Error al iniciar el respaldo');
            }
        } catch (error) {
            console.error('Error performing quick backup:', error);
            this.showNotification('Error al realizar el respaldo rápido', 'error');
            this.stopBackupProgress();
        }
    }

    // Perform full backup
    async performFullBackup() {
        if (this.isBackupInProgress) {
            this.showNotification('Ya hay un respaldo en progreso', 'warning');
            return;
        }

        try {
            this.startBackupProgress('Respaldo completo');
            
            const response = await fetch('/api/admin/backup/full', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    type: 'full',
                    description: 'Respaldo completo generado manualmente'
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.currentBackupId = result.backupId;
                this.monitorBackupProgress(result.backupId);
            } else {
                throw new Error('Error al iniciar el respaldo');
            }
        } catch (error) {
            console.error('Error performing full backup:', error);
            this.showNotification('Error al realizar el respaldo completo', 'error');
            this.stopBackupProgress();
        }
    }

    // Show custom backup modal
    showCustomBackupModal() {
        const modalHTML = `
            <div id="customBackupModal" class="modal-overlay">
                <div class="modal" style="width: 600px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Respaldo Personalizado</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="customBackupForm">
                            <div class="form-group">
                                <label>Nombre del respaldo:</label>
                                <input type="text" id="backupName" required placeholder="Respaldo personalizado">
                            </div>
                            <div class="form-group">
                                <label>Descripción:</label>
                                <textarea id="backupDescription" rows="3" placeholder="Descripción opcional del respaldo"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Incluir en el respaldo:</label>
                                <div class="backup-options">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="includeDatabase" checked>
                                        <span>Base de datos completa</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="includeFiles" checked>
                                        <span>Archivos del sistema</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="includeUploads" checked>
                                        <span>Archivos subidos por usuarios</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="includeConfig" checked>
                                        <span>Archivos de configuración</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="includeLogs">
                                        <span>Logs del sistema</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Formato de compresión:</label>
                                <select id="compressionFormat">
                                    <option value="zip">ZIP</option>
                                    <option value="tar.gz" selected>TAR.GZ</option>
                                    <option value="7z">7-Zip</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Nivel de compresión:</label>
                                <select id="compressionLevel">
                                    <option value="fast">Rápido</option>
                                    <option value="normal" selected>Normal</option>
                                    <option value="maximum">Máximo</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="panel-control-btn" id="startCustomBackup">
                            <i class="fas fa-play"></i> Iniciar Respaldo
                        </button>
                        <button class="panel-control-btn" id="cancelCustomBackup">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('customBackupModal');

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelCustomBackup').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#startCustomBackup').addEventListener('click', () => {
            this.performCustomBackup();
            modal.remove();
        });

        modal.classList.add('active');
    }

    // Perform custom backup
    async performCustomBackup() {
        if (this.isBackupInProgress) {
            this.showNotification('Ya hay un respaldo en progreso', 'warning');
            return;
        }

        const backupConfig = {
            name: document.getElementById('backupName').value,
            description: document.getElementById('backupDescription').value,
            type: 'custom',
            options: {
                includeDatabase: document.getElementById('includeDatabase').checked,
                includeFiles: document.getElementById('includeFiles').checked,
                includeUploads: document.getElementById('includeUploads').checked,
                includeConfig: document.getElementById('includeConfig').checked,
                includeLogs: document.getElementById('includeLogs').checked,
                compressionFormat: document.getElementById('compressionFormat').value,
                compressionLevel: document.getElementById('compressionLevel').value
            }
        };

        try {
            this.startBackupProgress(backupConfig.name);
            
            const response = await fetch('/api/admin/backup/custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(backupConfig)
            });

            if (response.ok) {
                const result = await response.json();
                this.currentBackupId = result.backupId;
                this.monitorBackupProgress(result.backupId);
            } else {
                throw new Error('Error al iniciar el respaldo personalizado');
            }
        } catch (error) {
            console.error('Error performing custom backup:', error);
            this.showNotification('Error al realizar el respaldo personalizado', 'error');
            this.stopBackupProgress();
        }
    }

    // Show schedule backup modal
    showScheduleBackupModal() {
        const modalHTML = `
            <div id="scheduleBackupModal" class="modal-overlay">
                <div class="modal" style="width: 600px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Programar Respaldo Automático</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="scheduleBackupForm">
                            <div class="form-group">
                                <label>Nombre del respaldo programado:</label>
                                <input type="text" id="scheduledBackupName" required placeholder="Respaldo diario automático">
                            </div>
                            <div class="form-group">
                                <label>Tipo de respaldo:</label>
                                <select id="scheduledBackupType">
                                    <option value="quick">Respaldo rápido</option>
                                    <option value="full">Respaldo completo</option>
                                    <option value="incremental">Respaldo incremental</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Frecuencia:</label>
                                <select id="scheduledBackupFrequency">
                                    <option value="daily">Diario</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensual</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Hora de ejecución:</label>
                                <input type="time" id="scheduledBackupTime" value="02:00" required>
                            </div>
                            <div class="form-group">
                                <label>Retención (días):</label>
                                <input type="number" id="scheduledBackupRetention" value="30" min="1" max="365" required>
                                <small>Número de días que se mantendrán los respaldos</small>
                            </div>
                            <div class="form-group">
                                <label>Notificaciones:</label>
                                <div class="backup-options">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="notifyOnSuccess" checked>
                                        <span>Notificar cuando el respaldo sea exitoso</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="notifyOnError" checked>
                                        <span>Notificar cuando el respaldo falle</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Email para notificaciones:</label>
                                <input type="email" id="scheduledBackupEmail" placeholder="admin@empresa.com">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="panel-control-btn" id="saveScheduledBackup">
                            <i class="fas fa-save"></i> Programar
                        </button>
                        <button class="panel-control-btn" id="cancelScheduledBackup">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('scheduleBackupModal');

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelScheduledBackup').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#saveScheduledBackup').addEventListener('click', () => {
            this.saveScheduledBackup();
            modal.remove();
        });

        modal.classList.add('active');
    }

    // Save scheduled backup
    async saveScheduledBackup() {
        const scheduleConfig = {
            name: document.getElementById('scheduledBackupName').value,
            type: document.getElementById('scheduledBackupType').value,
            frequency: document.getElementById('scheduledBackupFrequency').value,
            time: document.getElementById('scheduledBackupTime').value,
            retention: parseInt(document.getElementById('scheduledBackupRetention').value),
            notifications: {
                onSuccess: document.getElementById('notifyOnSuccess').checked,
                onError: document.getElementById('notifyOnError').checked,
                email: document.getElementById('scheduledBackupEmail').value
            }
        };

        try {
            const response = await fetch('/api/admin/backup/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(scheduleConfig)
            });

            if (response.ok) {
                this.showNotification('Respaldo programado exitosamente', 'success');
                await this.loadScheduledBackups();
            } else {
                throw new Error('Error al programar el respaldo');
            }
        } catch (error) {
            console.error('Error scheduling backup:', error);
            this.showNotification('Error al programar el respaldo', 'error');
        }
    }

    // Start backup progress
    startBackupProgress(backupName) {
        this.isBackupInProgress = true;
        this.backupProgress = 0;

        // Update UI
        this.updateBackupProgressUI(backupName, 0);
        this.showNotification(`Iniciando ${backupName}...`, 'info');

        // Disable backup buttons
        const backupButtons = document.querySelectorAll('.backup-btn');
        backupButtons.forEach(btn => {
            btn.disabled = true;
        });
    }

    // Monitor backup progress
    async monitorBackupProgress(backupId) {
        const progressInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/admin/backup/progress/${backupId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                if (response.ok) {
                    const progress = await response.json();
                    this.backupProgress = progress.percentage;
                    
                    this.updateBackupProgressUI(progress.currentStep, progress.percentage);

                    if (progress.completed) {
                        clearInterval(progressInterval);
                        this.completeBackupProgress(progress);
                    } else if (progress.error) {
                        clearInterval(progressInterval);
                        this.failBackupProgress(progress.error);
                    }
                }
            } catch (error) {
                console.error('Error monitoring backup progress:', error);
                clearInterval(progressInterval);
                this.failBackupProgress('Error al monitorear el progreso');
            }
        }, 2000);
    }

    // Update backup progress UI
    updateBackupProgressUI(step, percentage) {
        const progressContainer = document.querySelector('.backup-progress');
        if (!progressContainer) return;

        progressContainer.innerHTML = `
            <div class="progress-info">
                <div class="progress-step">${step}</div>
                <div class="progress-percentage">${percentage}%</div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%"></div>
            </div>
        `;
    }

    // Complete backup progress
    completeBackupProgress(result) {
        this.stopBackupProgress();
        this.showNotification('Respaldo completado exitosamente', 'success');
        
        // Reload backup history
        this.loadBackupHistory();
        
        // Update backup status
        this.updateBackupStatus({
            lastBackup: new Date().toISOString(),
            lastBackupStatus: 'success',
            lastBackupSize: result.size
        });
    }

    // Fail backup progress
    failBackupProgress(error) {
        this.stopBackupProgress();
        this.showNotification(`Error en el respaldo: ${error}`, 'error');
        
        // Update backup status
        this.updateBackupStatus({
            lastBackup: new Date().toISOString(),
            lastBackupStatus: 'error',
            lastBackupError: error
        });
    }

    // Stop backup progress
    stopBackupProgress() {
        this.isBackupInProgress = false;
        this.backupProgress = 0;
        this.currentBackupId = null;

        // Clear progress UI
        const progressContainer = document.querySelector('.backup-progress');
        if (progressContainer) {
            progressContainer.innerHTML = '';
        }

        // Re-enable backup buttons
        const backupButtons = document.querySelectorAll('.backup-btn');
        backupButtons.forEach(btn => {
            btn.disabled = false;
        });
    }

    // Update backup status
    updateBackupStatus(status) {
        const statusContainer = document.querySelector('.backup-status');
        if (!statusContainer) return;

        const lastBackupDate = status.lastBackup ? new Date(status.lastBackup) : null;
        const statusIcon = status.lastBackupStatus === 'success' ? 'check-circle' : 'times-circle';
        const statusClass = status.lastBackupStatus === 'success' ? 'success' : 'error';

        statusContainer.innerHTML = `
            <div class="status-item">
                <div class="status-icon ${statusClass}">
                    <i class="fas fa-${statusIcon}"></i>
                </div>
                <div class="status-content">
                    <div class="status-label">Último respaldo:</div>
                    <div class="status-value">${lastBackupDate ? this.formatDateTime(lastBackupDate) : 'Nunca'}</div>
                    ${status.lastBackupSize ? `<div class="status-size">Tamaño: ${this.formatFileSize(status.lastBackupSize)}</div>` : ''}
                    ${status.lastBackupError ? `<div class="status-error">Error: ${status.lastBackupError}</div>` : ''}
                </div>
            </div>
        `;
    }

    // Render backup history
    renderBackupHistory() {
        const container = document.querySelector('.backup-history');
        if (!container) return;

        if (this.backups.length === 0) {
            container.innerHTML = `
                <div class="no-backups-message">
                    <i class="fas fa-database"></i>
                    <p>No hay respaldos disponibles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.backups.map(backup => `
            <div class="backup-item" data-backup-id="${backup.id}">
                <div class="backup-info">
                    <div class="backup-header">
                        <h4>${backup.name}</h4>
                        <span class="backup-status ${backup.status}">${this.getBackupStatusText(backup.status)}</span>
                    </div>
                    <div class="backup-meta">
                        <span class="backup-type">${this.getBackupTypeText(backup.type)}</span>
                        <span class="backup-date">Creado: ${this.formatDateTime(backup.createdAt)}</span>
                        <span class="backup-size">Tamaño: ${this.formatFileSize(backup.size)}</span>
                    </div>
                    <div class="backup-description">${backup.description || 'Sin descripción'}</div>
                </div>
                <div class="backup-actions">
                    <button class="backup-action-btn download-backup-btn" data-backup-id="${backup.id}">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                    <button class="backup-action-btn restore-backup-btn" data-backup-id="${backup.id}">
                        <i class="fas fa-undo"></i> Restaurar
                    </button>
                    <button class="backup-action-btn delete-backup-btn" data-backup-id="${backup.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Render scheduled backups
    renderScheduledBackups() {
        const container = document.querySelector('.scheduled-backups');
        if (!container) return;

        if (this.scheduledBackups.length === 0) {
            container.innerHTML = `
                <div class="no-scheduled-message">
                    <i class="fas fa-clock"></i>
                    <p>No hay respaldos programados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.scheduledBackups.map(schedule => `
            <div class="scheduled-backup-item">
                <div class="schedule-info">
                    <h5>${schedule.name}</h5>
                    <div class="schedule-meta">
                        <span>Tipo: ${this.getBackupTypeText(schedule.type)}</span>
                        <span>Frecuencia: ${this.getFrequencyText(schedule.frequency)}</span>
                        <span>Próxima ejecución: ${this.formatDateTime(schedule.nextRun)}</span>
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="schedule-action-btn edit" onclick="backupManager.editScheduledBackup('${schedule.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="schedule-action-btn delete" onclick="backupManager.deleteScheduledBackup('${schedule.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update backup stats
    updateBackupStats() {
        const totalBackups = this.backups.length;
        const totalSize = this.backups.reduce((sum, backup) => sum + backup.size, 0);
        const successfulBackups = this.backups.filter(b => b.status === 'completed').length;
        const successRate = totalBackups > 0 ? (successfulBackups / totalBackups * 100).toFixed(1) : 0;

        const statsContainer = document.querySelector('.backup-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="backup-stat">
                    <div class="stat-value">${totalBackups}</div>
                    <div class="stat-label">Total Respaldos</div>
                </div>
                <div class="backup-stat">
                    <div class="stat-value">${this.formatFileSize(totalSize)}</div>
                    <div class="stat-label">Espacio Utilizado</div>
                </div>
                <div class="backup-stat">
                    <div class="stat-value">${successRate}%</div>
                    <div class="stat-label">Tasa de Éxito</div>
                </div>
            `;
        }
    }

    // Show restore modal
    showRestoreModal(backupId) {
        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) return;

        const modalHTML = `
            <div id="restoreBackupModal" class="modal-overlay">
                <div class="modal" style="width: 600px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Restaurar Respaldo</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="warning-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p><strong>¡Atención!</strong> Restaurar un respaldo sobrescribirá los datos actuales del sistema.</p>
                        </div>
                        <div class="backup-details">
                            <h4>Detalles del respaldo:</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Nombre:</label>
                                    <span>${backup.name}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha:</label>
                                    <span>${this.formatDateTime(backup.createdAt)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Tipo:</label>
                                    <span>${this.getBackupTypeText(backup.type)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Tamaño:</label>
                                    <span>${this.formatFileSize(backup.size)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="confirmRestore">
                                Confirmo que deseo restaurar este respaldo y entiendo que se sobrescribirán los datos actuales
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="panel-control-btn danger" id="confirmRestoreBackup">
                            <i class="fas fa-undo"></i> Restaurar
                        </button>
                        <button class="panel-control-btn" id="cancelRestore">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('restoreBackupModal');

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelRestore').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#confirmRestoreBackup').addEventListener('click', () => {
            const confirmed = document.getElementById('confirmRestore').checked;
            if (confirmed) {
                this.restoreBackup(backupId);
                modal.remove();
            } else {
                this.showNotification('Debe confirmar la restauración', 'error');
            }
        });

        modal.classList.add('active');
    }

    // Restore backup
    async restoreBackup(backupId) {
        try {
            this.showNotification('Iniciando restauración...', 'info');

            const response = await fetch(`/api/admin/backup/restore/${backupId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Restauración completada exitosamente', 'success');
                
                // Reload the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                throw new Error('Error al restaurar el respaldo');
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
            this.showNotification('Error al restaurar el respaldo', 'error');
        }
    }

    // Download backup
    async downloadBackup(backupId) {
        try {
            const response = await fetch(`/api/admin/backup/download/${backupId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const backup = this.backups.find(b => b.id === backupId);
                const fileName = backup ? backup.fileName : `backup-${backupId}.tar.gz`;
                this.downloadBlob(blob, fileName);
            } else {
                throw new Error('Error al descargar el respaldo');
            }
        } catch (error) {
            console.error('Error downloading backup:', error);
            this.showNotification('Error al descargar el respaldo', 'error');
        }
    }

    // Delete backup
    async deleteBackup(backupId) {
        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) return;

        if (!confirm(`¿Está seguro de que desea eliminar el respaldo "${backup.name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/backup/${backupId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                this.showNotification('Respaldo eliminado exitosamente', 'success');
                await this.loadBackupHistory();
            } else {
                throw new Error('Error al eliminar el respaldo');
            }
        } catch (error) {
            console.error('Error deleting backup:', error);
            this.showNotification('Error al eliminar el respaldo', 'error');
        }
    }

    // Toggle auto backup
    async toggleAutoBackup(enabled) {
        try {
            const response = await fetch('/api/admin/backup/settings/auto', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ enabled })
            });

            if (response.ok) {
                this.showNotification(
                    `Respaldo automático ${enabled ? 'activado' : 'desactivado'}`,
                    'success'
                );
            }
        } catch (error) {
            console.error('Error toggling auto backup:', error);
            this.showNotification('Error al cambiar configuración de respaldo automático', 'error');
        }
    }

    // Toggle cloud storage
    async toggleCloudStorage(enabled) {
        try {
            const response = await fetch('/api/admin/backup/settings/cloud', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ enabled })
            });

            if (response.ok) {
                this.showNotification(
                    `Almacenamiento en la nube ${enabled ? 'activado' : 'desactivado'}`,
                    'success'
                );
            }
        } catch (error) {
            console.error('Error toggling cloud storage:', error);
            this.showNotification('Error al cambiar configuración de almacenamiento', 'error');
        }
    }

    // Utility functions
    getBackupTypes() {
        return {
            quick: 'Respaldo Rápido',
            full: 'Respaldo Completo',
            incremental: 'Respaldo Incremental',
            custom: 'Respaldo Personalizado'
        };
    }

    getBackupTypeText(type) {
        return this.backupTypes[type] || type;
    }

    getBackupStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'in_progress': 'En Proceso',
            'completed': 'Completado',
            'failed': 'Fallido',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    getFrequencyText(frequency) {
        const frequencies = {
            daily: 'Diario',
            weekly: 'Semanal',
            monthly: 'Mensual'
        };
        return frequencies[frequency] || frequency;
    }

    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showNotification(message, type) {
        if (window.notificationSystem) {
            window.notificationSystem.showToast(message, type);
        }
    }

    // Refresh backup data
    async refresh() {
        await this.loadBackupHistory();
        await this.loadScheduledBackups();
        await this.checkBackupStatus();
    }
}

// Export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupManagerModule;
} else {
    window.BackupManagerModule = BackupManagerModule;
    window.backupManager = new BackupManagerModule();
}