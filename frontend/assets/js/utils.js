/**
 * IN OUT MANAGER - Core Utilities Module
 * Módulo central con utilidades comunes para evitar duplicación de código
 * @version 1.0.0
 * @author IN OUT MANAGER Team
 */

(function(window) {
    'use strict';

    // Namespace global para las utilidades
    window.IOManager = window.IOManager || {};

    /**
     * Configuración global del sistema
     */
    const CONFIG = {
        animation: {
            duration: 300,
            easing: 'ease-in-out'
        },
        validation: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            document: /^[0-9]{6,12}$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
            phone: /^[0-9]{10}$/
        },
        messages: {
            success: '✅ Operación exitosa',
            error: '❌ Error en la operación',
            loading: '⏳ Procesando...',
            required: 'Este campo es requerido',
            invalidEmail: 'Ingrese un correo válido',
            invalidDocument: 'Debe tener entre 6 y 12 dígitos',
            invalidPassword: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
        },
        endpoints: {
            login: '/api/auth/login',
            register: '/api/auth/register',
            recovery: '/api/auth/recovery',
            verify: '/api/auth/verify'
        }
    };

    /**
     * Utilidades para manipulación del DOM
     */
    const DOMUtils = {
        /**
         * Selecciona elementos con manejo de errores
         */
        select(selector, context = document) {
            try {
                const element = context.querySelector(selector);
                if (!element) {
                    console.warn(`⚠️ Elemento no encontrado: ${selector}`);
                }
                return element;
            } catch (error) {
                console.error(`❌ Error seleccionando elemento: ${selector}`, error);
                return null;
            }
        },

        /**
         * Selecciona múltiples elementos
         */
        selectAll(selector, context = document) {
            try {
                return Array.from(context.querySelectorAll(selector));
            } catch (error) {
                console.error(`❌ Error seleccionando elementos: ${selector}`, error);
                return [];
            }
        },

        /**
         * Agrega eventos con manejo de errores
         */
        addEvent(element, event, handler, options = {}) {
            if (!element || typeof handler !== 'function') {
                console.warn('⚠️ Elemento o handler inválido para evento:', event);
                return false;
            }

            try {
                element.addEventListener(event, handler, options);
                return true;
            } catch (error) {
                console.error(`❌ Error agregando evento ${event}:`, error);
                return false;
            }
        },

        /**
         * Muestra/oculta elementos con animación
         */
        toggle(element, show = null, animated = true) {
            if (!element) return false;

            const isVisible = element.style.display !== 'none';
            const shouldShow = show !== null ? show : !isVisible;

            if (animated) {
                element.style.transition = `opacity ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}`;
                element.style.opacity = shouldShow ? '1' : '0';
                
                setTimeout(() => {
                    element.style.display = shouldShow ? 'block' : 'none';
                }, shouldShow ? 0 : CONFIG.animation.duration);
            } else {
                element.style.display = shouldShow ? 'block' : 'none';
                element.style.opacity = shouldShow ? '1' : '0';
            }

            return shouldShow;
        },

        /**
         * Agrega clases CSS con validación
         */
        addClass(element, ...classes) {
            if (!element || !classes.length) return false;
            
            try {
                element.classList.add(...classes);
                return true;
            } catch (error) {
                console.error('❌ Error agregando clases:', error);
                return false;
            }
        },

        /**
         * Remueve clases CSS con validación
         */
        removeClass(element, ...classes) {
            if (!element || !classes.length) return false;
            
            try {
                element.classList.remove(...classes);
                return true;
            } catch (error) {
                console.error('❌ Error removiendo clases:', error);
                return false;
            }
        }
    };

    /**
     * Utilidades de validación reutilizables
     */
    const ValidationUtils = {
        /**
         * Valida un campo según su tipo
         */
        validateField(field, type, options = {}) {
            if (!field || !type) return { isValid: false, message: 'Campo o tipo inválido' };

            const value = field.value ? field.value.trim() : '';
            const fieldName = options.fieldName || field.name || field.id || 'Campo';

            // Validación de campo requerido
            if (options.required && !value) {
                return { isValid: false, message: `${fieldName} es requerido` };
            }

            // Si no es requerido y está vacío, es válido
            if (!options.required && !value) {
                return { isValid: true, message: '' };
            }

            // Validaciones específicas por tipo
            switch (type) {
                case 'email':
                    return {
                        isValid: CONFIG.validation.email.test(value),
                        message: CONFIG.validation.email.test(value) ? '' : CONFIG.messages.invalidEmail
                    };

                case 'document':
                    return {
                        isValid: CONFIG.validation.document.test(value),
                        message: CONFIG.validation.document.test(value) ? '' : CONFIG.messages.invalidDocument
                    };

                case 'password':
                    const minLength = options.minLength || 8;
                    if (value.length < minLength) {
                        return { isValid: false, message: `Debe tener al menos ${minLength} caracteres` };
                    }
                    return {
                        isValid: CONFIG.validation.password.test(value),
                        message: CONFIG.validation.password.test(value) ? '' : CONFIG.messages.invalidPassword
                    };

                case 'phone':
                    return {
                        isValid: CONFIG.validation.phone.test(value),
                        message: CONFIG.validation.phone.test(value) ? '' : 'Ingrese un número válido (10 dígitos)'
                    };

                case 'text':
                    const minLen = options.minLength || 2;
                    return {
                        isValid: value.length >= minLen,
                        message: value.length >= minLen ? '' : `Debe tener al menos ${minLen} caracteres`
                    };

                default:
                    return { isValid: true, message: '' };
            }
        },

        /**
         * Muestra error en un campo
         */
        showFieldError(field, message, show = true) {
            if (!field) return false;

            const errorId = field.id + 'Error';
            let errorElement = DOMUtils.select(`#${errorId}`);

            // Crear elemento de error si no existe
            if (!errorElement && show) {
                errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'error-message';
                field.parentNode.appendChild(errorElement);
            }

            if (errorElement) {
                errorElement.textContent = message;
                DOMUtils.toggle(errorElement, show);
                
                // Agregar/remover clases de error al campo
                if (show && message) {
                    DOMUtils.addClass(field, 'error', 'invalid');
                    DOMUtils.removeClass(field, 'valid');
                } else {
                    DOMUtils.removeClass(field, 'error', 'invalid');
                    DOMUtils.addClass(field, 'valid');
                }
            }

            return true;
        }
    };

    /**
     * Utilidades para HTTP requests
     */
    const HTTPUtils = {
        /**
         * Realiza petición HTTP con manejo de errores
         */
        async request(url, options = {}) {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            };

            const finalOptions = { ...defaultOptions, ...options };

            try {
                const response = await fetch(url, finalOptions);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP Error: ${response.status}`);
                }

                return { success: true, data };
            } catch (error) {
                console.error('❌ HTTP Request Error:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * POST request simplificado
         */
        async post(url, data) {
            return this.request(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        /**
         * GET request simplificado
         */
        async get(url) {
            return this.request(url);
        }
    };

    /**
     * Utilidades para UI/UX
     */
    const UIUtils = {
        /**
         * Muestra mensaje de notificación
         */
        showNotification(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;

            // Estilos básicos
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                zIndex: '10000',
                opacity: '0',
                transition: 'opacity 300ms ease-in-out',
                backgroundColor: this.getNotificationColor(type)
            });

            document.body.appendChild(notification);

            // Animación de entrada
            setTimeout(() => notification.style.opacity = '1', 100);

            // Auto-remove
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, duration);
        },

        getNotificationColor(type) {
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };
            return colors[type] || colors.info;
        },

        /**
         * Maneja estados de loading en botones
         */
        toggleButtonLoading(button, loading = true, loadingText = CONFIG.messages.loading) {
            if (!button) return false;

            if (loading) {
                button.disabled = true;
                button.dataset.originalText = button.textContent;
                button.textContent = loadingText;
                DOMUtils.addClass(button, 'loading');
            } else {
                button.disabled = false;
                button.textContent = button.dataset.originalText || button.textContent;
                DOMUtils.removeClass(button, 'loading');
                delete button.dataset.originalText;
            }

            return true;
        },

        /**
         * Scroll suave a elemento
         */
        scrollTo(element, offset = 0) {
            if (!element) return false;

            const targetPosition = element.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            return true;
        }
    };

    /**
     * Manejo centralizado de errores
     */
    const ErrorHandler = {
        /**
         * Maneja errores de forma consistente
         */
        handle(error, context = '', showToUser = false) {
            const errorMessage = error?.message || error || 'Error desconocido';
            const fullMessage = context ? `[${context}] ${errorMessage}` : errorMessage;

            console.error('❌ Error:', fullMessage);

            if (showToUser) {
                UIUtils.showNotification(errorMessage, 'error');
            }

            // Aquí se podría agregar logging a servidor
            return false;
        }
    };

    /**
     * Exponer utilidades al namespace global
     */
    IOManager.utils = {
        DOM: DOMUtils,
        validation: ValidationUtils,
        HTTP: HTTPUtils,
        UI: UIUtils,
        error: ErrorHandler,
        config: CONFIG
    };

    /**
     * Inicialización automática
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 IOManager Utils initialized');
        });
    } else {
        console.log('🚀 IOManager Utils initialized');
    }

})(window);
