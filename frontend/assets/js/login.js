/**
 * IN OUT MANAGER - LOGIN ESTE ES EL PROYECTO ESTRELLA*
 * @version 2.0.0
 * @copyright 
 */

(function() {
    'use strict';

    const CONFIG = {
        minPasswordLength: 8,
        redirectDelay: 1000,
        loadingText: 'Cargando...',
        successMessage: 'Inicio de sesión exitoso',
        errorMessage: 'Error al iniciar sesión'
    };
    class LoginModule {
        constructor() {
            this.elements = {};
            this.selectedRole = 'empleado';
            this.isLoading = false;
        }

        init() {
            try {
                this.cacheElements();
                this.bindEvents();
                this.initializeUI();
                console.log('🔒 Login module initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing login module:', error);
            }
        }

        cacheElements() {
            const selectors = {
                form: '#loginForm',
                email: '#email',
                password: '#password',
                showPassword: '#showPassword',
                roleTabs: '.role-tab',
                submitButton: '.login-submit-btn',
                resultMessage: '#loginResult',
                adminCodeGroup: '#adminCodeGroup',
                adminCode: '#adminCode',
                roleDescription: '#roleDescription'
            };

            Object.entries(selectors).forEach(([key, selector]) => {
                const element = selector.startsWith('.') ? 
                    document.querySelectorAll(selector) : 
                    document.querySelector(selector);
                this.elements[key] = element;
            });

            
            if (!this.elements.form || !this.elements.email || !this.elements.password) {
                throw new Error('Critical form elements not found');
            }
        }

       
        bindEvents() {
            
            if (this.elements.showPassword) {
                this.elements.showPassword.addEventListener('change', (e) => {
                    this.togglePasswordVisibility(e.target.checked);
                });
            }

          
            if (this.elements.roleTabs) {
                this.elements.roleTabs.forEach(tab => {
                    tab.addEventListener('click', () => this.handleRoleChange(tab));
                    tab.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.handleRoleChange(tab);
                        }
                    });
                });
            }

           
            this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

           
            this.elements.email.addEventListener('blur', () => this.validateField(this.elements.email, 'email'));
            this.elements.password.addEventListener('blur', () => this.validateField(this.elements.password, 'password'));
        }

        
        initializeUI() {
            
            const defaultTab = document.querySelector(`[data-role="${this.selectedRole}"]`);
            if (defaultTab) {
                this.handleRoleChange(defaultTab);
            }
        }

      
        handleRoleChange(tab) {
            if (!tab) return;

         
            this.elements.roleTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0');

            this.selectedRole = tab.dataset.role;

            this.updateRoleDescription(this.selectedRole);

            this.toggleAdminCodeField(this.selectedRole === 'administrador');
        }

        
        updateRoleDescription(role) {
            if (!this.elements.roleDescription) return;

            const descriptions = {
                empleado: 'Ingrese sus credenciales para acceder como empleado.',
                administrador: 'Ingrese sus credenciales y código de administrador.'
            };

            this.elements.roleDescription.textContent = descriptions[role] || descriptions.empleado;
        }

      
        toggleAdminCodeField(show) {
            if (!this.elements.adminCodeGroup) return;

            this.elements.adminCodeGroup.style.display = show ? 'block' : 'none';
            
            if (this.elements.adminCode) {
                this.elements.adminCode.required = show;
                if (!show) {
                    this.elements.adminCode.value = '';
                }
            }
        }

        togglePasswordVisibility(show) {
            this.elements.password.type = show ? 'text' : 'password';
        }

        async handleSubmit(e) {
            e.preventDefault();

            if (this.isLoading) return;

            try {
              
                if (!this.validateForm()) return;

                this.setLoadingState(true);

                const formData = this.getFormData();

                await this.processLogin(formData);

            } catch (error) {
                this.showErrorMessage(CONFIG.errorMessage);
                console.error('Login error:', error);
            } finally {
                this.setLoadingState(false);
            }
        }

        async processLogin(formData) {
            try {
                console.log('🔄 Iniciando proceso de login:', formData);
                
                // Usar la instancia global del APIService
                if (typeof window.apiService === 'undefined') {
                    console.log('⚠️ APIService global no disponible, creando instancia...');
                    // Fallback: crear instancia si no está disponible
                    if (typeof EnhancedApiClient !== 'undefined') {
                        window.apiService = new EnhancedApiClient();
                    } else {
                        throw new Error('API Service no disponible');
                    }
                }

                const apiClient = window.apiService;
                
                // Realizar login en el backend
                console.log('📡 Enviando credenciales al backend...');
                const response = await apiClient.login({
                    email: formData.email,
                    password: formData.password
                });

                console.log('📦 Respuesta del backend:', response);

                if (response.success && response.data) {
                    const user = response.data.user;
                    const token = response.data.token;

                    console.log('✅ Login exitoso, usuario:', user);
                    console.log('🔑 Token recibido:', token ? 'Sí' : 'No');

                    // Verificar tipo de usuario (rol)
                    console.log('🎭 Verificando rol: usuario =', user.tipoUsuario, 'seleccionado =', formData.role);
                    if (user.tipoUsuario !== formData.role) {
                        console.log('❌ Rol no coincide');
                        this.showErrorMessage(`Credenciales incorrectas para ${formData.role}.`);
                        return;
                    }

                    // Si es administrador, verificar código de administrador si es necesario
                    if (formData.role === 'administrador' && formData.adminCode) {
                        console.log('🔐 Verificando código de administrador...');
                        // Aquí podrías verificar el código de administrador si lo tienes guardado
                    }

                    // Guardar token y información de sesión
                    console.log('💾 Guardando sesión...');
                    localStorage.setItem('authToken', token);
                    this.saveSession(user);
                    
                    console.log('✅ Mostrando mensaje de éxito...');
                    this.showSuccessMessage(CONFIG.successMessage);
                    
                    console.log('⏱️ Programando redirección en', CONFIG.redirectDelay, 'ms...');
                    setTimeout(() => {
                        console.log('🚀 Ejecutando redirección...');
                        this.redirectToDashboard();
                    }, CONFIG.redirectDelay);
                } else {
                    console.log('❌ Login fallido:', response);
                    this.showErrorMessage(response.message || 'Error de autenticación');
                }
            } catch (error) {
                console.error('💥 Error en login:', error);
                this.showErrorMessage('Error al conectar con el servidor. Verifique su conexión.');
            }
        }
        
        saveSession(user) {
            // Usar SessionManager para guardar la sesión
            if (typeof SessionManager !== 'undefined') {
                SessionManager.createSession(user);
            } else {
                // Fallback si SessionManager no está disponible
                const sessionData = {
                    id: user.id,
                    nombreCompleto: user.nombreCompleto,
                    correoElectronico: user.correoElectronico,
                    tipoUsuario: user.tipoUsuario,
                    lastLogin: new Date().toISOString()
                };
                
                localStorage.setItem('currentSession', JSON.stringify(sessionData));
            }
        }

        getFormData() {
            const data = {
                email: this.elements.email.value.trim(),
                password: this.elements.password.value,
                role: this.selectedRole
            };

            if (this.selectedRole === 'administrador' && this.elements.adminCode) {
                data.adminCode = this.elements.adminCode.value.trim();
            }

            return data;
        }

        validateForm() {
            let isValid = true;

            if (!this.validateField(this.elements.email, 'email')) {
                isValid = false;
            }

            if (!this.validateField(this.elements.password, 'password')) {
                isValid = false;
            }

            if (this.selectedRole === 'administrador' && this.elements.adminCode) {
                if (!this.validateField(this.elements.adminCode, 'adminCode')) {
                    isValid = false;
                }
            }

            return isValid;
        }

    
        validateField(element, type) {
            if (!element) return false;

            const value = element.value.trim();
            let isValid = true;
            let errorMessage = '';

            switch (type) {
                case 'email':
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!value) {
                        errorMessage = 'El email es obligatorio';
                        isValid = false;
                    } else if (!emailPattern.test(value)) {
                        errorMessage = 'Formato de email inválido';
                        isValid = false;
                    }
                    break;

                case 'password':
                    if (!value) {
                        errorMessage = 'La contraseña es obligatoria';
                        isValid = false;
                    } else if (value.length < CONFIG.minPasswordLength) {
                        errorMessage = `La contraseña debe tener al menos ${CONFIG.minPasswordLength} caracteres`;
                        isValid = false;
                    }
                    break;

                case 'adminCode':
                    if (!value) {
                        errorMessage = 'El código de administrador es obligatorio';
                        isValid = false;
                    } else if (value.length < 6) {
                        errorMessage = 'El código debe tener al menos 6 caracteres';
                        isValid = false;
                    }
                    break;
            }

            if (!isValid) {
                this.showFieldError(element, errorMessage);
            } else {
                this.clearFieldError(element);
            }

            return isValid;
        }

        showFieldError(element, message) {
            // Usar NotificationManager si está disponible
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showFieldError(element, message);
                return;
            }
            
            // Fallback al método antiguo
            this.clearFieldError(element);

            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');

            element.parentElement.appendChild(errorDiv);
            element.classList.add('error');
            element.setAttribute('aria-invalid', 'true');
        }

        clearFieldError(element) {
            // Usar NotificationManager si está disponible
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.clearFieldError(element);
                return;
            }
            
            // Fallback al método antiguo
            const errorDiv = element.parentElement.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.remove();
            }
            element.classList.remove('error');
            element.setAttribute('aria-invalid', 'false');
        }

        setLoadingState(isLoading) {
            this.isLoading = isLoading;
            
            if (!this.elements.submitButton) return;

            this.elements.submitButton.disabled = isLoading;
            
            // Variable para almacenar el loader
            if (!this._loader) this._loader = null;
            
            if (isLoading) {
                // Usar NotificationManager si está disponible
                if (typeof NotificationManager !== 'undefined') {
                    this._loader = NotificationManager.showLoader(CONFIG.loadingText);
                }
                
                this.elements.submitButton.innerHTML = `
                    <span class="spinner"></span>
                    <span>${CONFIG.loadingText}</span>
                `;
            } else {
                // Ocultar loader si existe
                if (this._loader && typeof this._loader.hide === 'function') {
                    this._loader.hide();
                    this._loader = null;
                }
                
                this.elements.submitButton.innerHTML = `
                    <span class="btn-icon"><i class="fas fa-sign-in-alt"></i></span>
                    <span class="btn-text">Iniciar Sesión</span>
                `;
            }
        }

        showSuccessMessage(message) {
            // Usar NotificationManager si está disponible
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showToast(message, 'success');
                return;
            }
            
            // Fallback al método antiguo
            this.showMessage(message, 'success');
        }

        showErrorMessage(message) {
            // Usar NotificationManager si está disponible
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showToast(message, 'error');
                return;
            }
            
            // Fallback al método antiguo
            this.showMessage(message, 'error');
        }

        showMessage(message, type) {
            // Usar NotificationManager si está disponible
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showToast(message, type);
                return;
            }
            
            // Fallback al método antiguo
            if (!this.elements.resultMessage) return;

            this.elements.resultMessage.className = `result-message ${type}`;
            this.elements.resultMessage.textContent = message;
            this.elements.resultMessage.setAttribute('role', 'alert');

            setTimeout(() => {
                this.elements.resultMessage.textContent = '';
                this.elements.resultMessage.className = 'result-message';
            }, 3000);
        }

        redirectToDashboard() {
            // Usar SessionManager si está disponible
            if (typeof SessionManager !== 'undefined') {
                SessionManager.redirectToDashboard(this.selectedRole);
            } else {
                // Fallback si SessionManager no está disponible
                const dashboardUrls = {
                    empleado: '../empleado/dashboard-empleado.html',
                    administrador: '../admin/dashboard-admin.html'
                };

                const url = dashboardUrls[this.selectedRole] || dashboardUrls.empleado;
                console.log('Redirigiendo a:', url);
                window.location.href = url;
            }
        }
    }

    const loginModule = new LoginModule();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loginModule.init());
    } else {
        loginModule.init();
    }

})();
