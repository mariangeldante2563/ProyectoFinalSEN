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

                this.processLogin(formData);

            } catch (error) {
                this.showErrorMessage(CONFIG.errorMessage);
                console.error('Login error:', error);
            } finally {
                this.setLoadingState(false);
            }
        }

        processLogin(formData) {
            // Obtener usuarios registrados del localStorage
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            // Buscar el usuario por correo electrónico
            const user = users.find(u => u.correoElectronico === formData.email);
            
            if (!user) {
                this.showErrorMessage('Usuario no encontrado. Verifique sus credenciales.');
                return;
            }
            
            // Verificar tipo de usuario (rol)
            if (user.tipoUsuario !== formData.role) {
                this.showErrorMessage(`Credenciales incorrectas para ${formData.role}.`);
                return;
            }
            
            // Verificar contraseña (en este caso está codificada con btoa)
            const decodedPassword = atob(user.password);
            if (decodedPassword !== formData.password) {
                this.showErrorMessage('Contraseña incorrecta.');
                return;
            }
            
            // Si es administrador, verificar código de administrador si es necesario
            if (formData.role === 'administrador' && formData.adminCode) {
                // Aquí podrías verificar el código de administrador si lo tienes guardado
            }
            
            // Guardar información de sesión
            this.saveSession(user);
            
            this.showSuccessMessage(CONFIG.successMessage);
            setTimeout(() => {
                this.redirectToDashboard();
            }, CONFIG.redirectDelay);
        }
        
        saveSession(user) {
            // Guardar información de la sesión actual
            const sessionData = {
                id: user.id,
                nombreCompleto: user.nombreCompleto,
                correoElectronico: user.correoElectronico,
                tipoUsuario: user.tipoUsuario,
                lastLogin: new Date().toISOString()
            };
            
            localStorage.setItem('currentSession', JSON.stringify(sessionData));
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
            
            if (isLoading) {
                this.elements.submitButton.innerHTML = `
                    <span class="spinner"></span>
                    <span>${CONFIG.loadingText}</span>
                `;
            } else {
                this.elements.submitButton.innerHTML = `
                    <span class="btn-icon"><i class="fas fa-sign-in-alt"></i></span>
                    <span class="btn-text">Iniciar Sesión</span>
                `;
            }
        }

        showSuccessMessage(message) {
            this.showMessage(message, 'success');
        }

        showErrorMessage(message) {
            this.showMessage(message, 'error');
        }

        showMessage(message, type) {
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
            const dashboardUrls = {
                empleado: '../empleado/dashboard-empleado.html',
                administrador: '../admin/dashboard-admin.html'
            };

            const url = dashboardUrls[this.selectedRole] || dashboardUrls.empleado;
            window.location.href = url;
        }
    }

    const loginModule = new LoginModule();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loginModule.init());
    } else {
        loginModule.init();
    }

})();
