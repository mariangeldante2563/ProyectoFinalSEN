/**
 * IN OUT MANAGER - Login Module
 * Unified and optimized login functionality
 * @version 2.0.0
 * @copyright 2025 IN OUT MANAGER
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        minPasswordLength: 8,
        redirectDelay: 1000,
        errorDisplayTime: 3000,
        loadingText: 'Cargando...',
        successMessage: 'Inicio de sesión exitoso',
        errorMessage: 'Error al iniciar sesión'
    };

    // Main Login Module
    class LoginModule {
        constructor() {
            this.elements = {};
            this.selectedRole = 'empleado';
            this.isLoading = false;
        }

        // Initialize the module
        init() {
            try {
                this.cacheElements();
                this.bindEvents();
                this.initializeUI();
                this.ensureVisibility();
                console.log('🔒 Login module initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing login module:', error);
                this.showFallbackForm();
            }
        }

        // Cache DOM elements
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
                authCard: '.auth-card',
                roleDescription: '#roleDescription'
            };

            Object.entries(selectors).forEach(([key, selector]) => {
                const element = selector.startsWith('.') ? 
                    document.querySelectorAll(selector) : 
                    document.querySelector(selector);
                this.elements[key] = element;
            });

            // Validate critical elements
            if (!this.elements.form || !this.elements.email || !this.elements.password) {
                throw new Error('Critical form elements not found');
            }
        }

        // Bind event listeners
        bindEvents() {
            // Password visibility toggle
            if (this.elements.showPassword) {
                this.elements.showPassword.addEventListener('change', (e) => {
                    this.togglePasswordVisibility(e.target.checked);
                });
            }

            // Role selection
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

            // Form submission
            this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Input validation on blur
            this.elements.email.addEventListener('blur', () => this.validateField(this.elements.email, 'email'));
            this.elements.password.addEventListener('blur', () => this.validateField(this.elements.password, 'password'));
        }

        // Initialize UI state
        initializeUI() {
            // Set initial role
            const defaultTab = document.querySelector(`[data-role="${this.selectedRole}"]`);
            if (defaultTab) {
                this.handleRoleChange(defaultTab);
            }

            // Add entrance animation
            if (this.elements.authCard) {
                this.elements.authCard.classList.add('fade-in');
            }
        }

        // Ensure form visibility
        ensureVisibility() {
            const criticalElements = [
                '.auth-container', '.auth-card', '.auth-form', 
                '.login-section', '.form-group'
            ];

            criticalElements.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.opacity = '1';
                    element.style.visibility = 'visible';
                    element.style.display = element.style.display || 'block';
                }
            });
        }

        // Handle role change
        handleRoleChange(tab) {
            if (!tab) return;

            // Update tabs
            this.elements.roleTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0');

            // Update selected role
            this.selectedRole = tab.dataset.role;

            // Update role description
            this.updateRoleDescription(this.selectedRole);

            // Show/hide admin code field
            this.toggleAdminCodeField(this.selectedRole === 'administrador');
        }

        // Update role description
        updateRoleDescription(role) {
            if (!this.elements.roleDescription) return;

            const descriptions = {
                empleado: 'Ingrese sus credenciales para acceder como empleado.',
                administrador: 'Ingrese sus credenciales y código de administrador.'
            };

            this.elements.roleDescription.textContent = descriptions[role] || descriptions.empleado;
        }

        // Toggle admin code field visibility
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

        // Toggle password visibility
        togglePasswordVisibility(show) {
            this.elements.password.type = show ? 'text' : 'password';
        }

        // Handle form submission
        async handleSubmit(e) {
            e.preventDefault();

            if (this.isLoading) return;

            try {
                // Validate form
                if (!this.validateForm()) return;

                // Show loading state
                this.setLoadingState(true);

                // Get form data
                const formData = this.getFormData();

                // Simulate API call (replace with actual API call)
                await this.authenticateUser(formData);

                // Success
                this.showSuccessMessage(CONFIG.successMessage);
                setTimeout(() => {
                    this.redirectToDashboard();
                }, CONFIG.redirectDelay);

            } catch (error) {
                this.showErrorMessage(CONFIG.errorMessage);
                console.error('Login error:', error);
            } finally {
                this.setLoadingState(false);
            }
        }

        // Get form data
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

        // Authenticate user (simulate API call)
        async authenticateUser(formData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate authentication logic
            if (formData.email === 'admin@example.com' && formData.password === '12345678') {
                return { success: true, user: formData };
            }

            throw new Error('Invalid credentials');
        }

        // Validate entire form
        validateForm() {
            let isValid = true;

            // Validate email
            if (!this.validateField(this.elements.email, 'email')) {
                isValid = false;
            }

            // Validate password
            if (!this.validateField(this.elements.password, 'password')) {
                isValid = false;
            }

            // Validate admin code if required
            if (this.selectedRole === 'administrador' && this.elements.adminCode) {
                if (!this.validateField(this.elements.adminCode, 'adminCode')) {
                    isValid = false;
                }
            }

            return isValid;
        }

        // Validate individual field
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

        // Show field error
        showFieldError(element, message) {
            this.clearFieldError(element);

            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');

            element.parentElement.appendChild(errorDiv);
            element.classList.add('error');
            element.setAttribute('aria-invalid', 'true');

            // Remove error after specified time
            setTimeout(() => {
                this.clearFieldError(element);
            }, CONFIG.errorDisplayTime);
        }

        // Clear field error
        clearFieldError(element) {
            const errorDiv = element.parentElement.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.remove();
            }
            element.classList.remove('error');
            element.setAttribute('aria-invalid', 'false');
        }

        // Set loading state
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

        // Show success message
        showSuccessMessage(message) {
            this.showMessage(message, 'success');
        }

        // Show error message
        showErrorMessage(message) {
            this.showMessage(message, 'error');
        }

        // Show message
        showMessage(message, type) {
            if (!this.elements.resultMessage) return;

            this.elements.resultMessage.className = `result-message ${type}`;
            this.elements.resultMessage.textContent = message;
            this.elements.resultMessage.setAttribute('role', 'alert');

            // Clear message after some time
            setTimeout(() => {
                this.elements.resultMessage.textContent = '';
                this.elements.resultMessage.className = 'result-message';
            }, CONFIG.errorDisplayTime);
        }

        // Redirect to dashboard
        redirectToDashboard() {
            const dashboardUrls = {
                empleado: '../empleado/dashboard-empleado.html',
                administrador: '../admin/dashboard-admin.html'
            };

            const url = dashboardUrls[this.selectedRole] || dashboardUrls.empleado;
            window.location.href = url;
        }

        // Show fallback form if initialization fails
        showFallbackForm() {
            console.warn('⚠️ Showing fallback form');
            // Basic fallback functionality
            const form = document.getElementById('loginForm');
            if (form) {
                form.style.display = 'block';
                form.style.opacity = '1';
                form.style.visibility = 'visible';
            }
        }
    }

    // Initialize module
    const loginModule = new LoginModule();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loginModule.init());
    } else {
        loginModule.init();
    }

    // Expose module for debugging
    window.LoginModule = loginModule;

})();
