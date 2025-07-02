// Navegación desplegable para Servicios
const dropdown = document.querySelector('.dropdown');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownContent = document.querySelector('.dropdown-content');

if (dropdown && dropdownToggle && dropdownContent) {
  try {
    dropdownToggle.addEventListener('click', function (e) {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      if (!isOpen) {
        dropdown.classList.add('open');
        dropdownToggle.setAttribute('aria-expanded', 'true');
      } else {
        dropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Cerrar el menú si se hace clic fuera
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  } catch (error) {
    console.error('Error en la funcionalidad del dropdown:', error);
  }
} else {
  console.warn('Elementos del dropdown no encontrados');
}

// Desplazamiento suave para todos los enlaces de navegación
const navLinks = document.querySelectorAll('.main-nav a[href^="#"], .dropdown-content a');
navLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    try {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 40,
          behavior: 'smooth'
        });
        // Cierra el menú desplegable si está abierto
        if (dropdown) {
          dropdown.classList.remove('open');
          if (dropdownToggle) {
            dropdownToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    } catch (error) {
      console.error('Error en navegación suave:', error);
    }
  });
});

// FUNCIONALIDAD PARA EL FORMULARIO DE CONTACTO
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.modern-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const formData = new FormData(this);
            const nombre = formData.get('nombre');
            const email = formData.get('email');
            const whatsapp = formData.get('whatsapp');
            const mensaje = formData.get('mensaje');
            
            // Validaciones
            if (!nombre || !email || !whatsapp || !mensaje) {
                alert('Por favor, completa todos los campos.');
                return;
            }
            
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, ingresa un email válido.');
                return;
            }
            
            // Validar WhatsApp (solo números)
            const whatsappRegex = /^[\d\+\-\s\(\)]+$/;
            if (!whatsappRegex.test(whatsapp)) {
                alert('Por favor, ingresa un número de WhatsApp válido.');
                return;
            }
            
            // Simular envío exitoso
            alert(`¡Gracias ${nombre}! Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.`);
            this.reset();
        });
    }
});

// FUNCIONALIDAD PARA EL BOTÓN INGRESAR
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            // No prevenir el comportamiento predeterminado para permitir la navegación a login.html
            
            // Verificar si hay usuarios registrados
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            if (registeredUsers.length === 0) {
                // Si no hay usuarios registrados, simplemente redirigir a login.html
                // La redirección ya está configurada en el href del botón
            } else {
                // Mostrar información de usuarios registrados
                showLoginInfo(registeredUsers);
            }
        });
    }
    
    function showLoginInfo(users) {
        const userList = users.map((user, index) => 
            `${index + 1}. ${user.nombreCompleto} (${user.tipoUsuario}) - Doc: ${user.numeroDocumento}`
        ).join('\n');
        
        const message = `Usuarios registrados en el sistema:\n\n${userList}\n\nNota: En una aplicación real, aquí habría un formulario de login con usuario y contraseña.`;
        
        alert(message);
    }
});

// CARRUSEL DE SERVICIOS
class ServiceCarousel {
  constructor() {
    this.track = document.getElementById('carouselTrack');
    this.slides = document.querySelectorAll('.carousel-slide');
    this.indicators = document.querySelectorAll('.indicator');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    
    this.currentSlide = 0;
    this.isAnimating = false;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000; // 5 segundos
    
    if (this.track && this.slides.length > 0) {
      this.init();
    }
  }
  
  init() {
    // Event listeners para botones
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Event listeners para indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Pausar autoplay en hover
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', () => this.pauseAutoplay());
      carouselWrapper.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    // Controles de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Touch/swipe support
    this.addTouchSupport();
    
    // Iniciar autoplay
    this.startAutoplay();
    
    // Inicializar primer slide
    this.updateSlide(0, false);
  }
  
  nextSlide() {
    if (this.isAnimating) return;
    const next = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(next);
  }
  
  prevSlide() {
    if (this.isAnimating) return;
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev);
  }
  
  goToSlide(index) {
    if (this.isAnimating || index === this.currentSlide) return;
    this.updateSlide(index, true);
  }
  
  updateSlide(index, animate = true) {
    this.isAnimating = animate;
    
    // Actualizar slides
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    // Actualizar indicadores
    this.indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    // Mover el track
    const translateX = -index * 100;
    this.track.style.transform = `translateX(${translateX}%)`;
    
    this.currentSlide = index;
    
    if (animate) {
      setTimeout(() => {
        this.isAnimating = false;
      }, 600); // Duración de la transición
    } else {
      this.isAnimating = false;
    }
  }
  
  startAutoplay() {
    this.pauseAutoplay(); // Limpiar cualquier interval existente
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }
  
  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  addTouchSupport() {
    let startX = 0;
    let endX = 0;
    let startY = 0;
    let endY = 0;
    
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (!carouselWrapper) return;
    
    carouselWrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    carouselWrapper.addEventListener('touchmove', (e) => {
      // Prevenir scroll vertical si el swipe es más horizontal
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      
      if (diffX > diffY) {
        e.preventDefault();
      }
    }, { passive: false });
    
    carouselWrapper.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = Math.abs(startY - endY);
      
      // Mínima distancia para considerar swipe
      const minSwipeDistance = 50;
      
      // Si el swipe es más horizontal que vertical
      if (Math.abs(diffX) > diffY && Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
          // Swipe left - next slide
          this.nextSlide();
        } else {
          // Swipe right - previous slide
          this.prevSlide();
        }
      }
    }, { passive: true });
  }
}

// Inicializar carrusel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ServiceCarousel();
});

// ===========================
// FUNCIONALIDAD DE LOS BOTONES DE NAVEGACIÓN
// ===========================

// Funcionalidad para el botón "Registrarse"
document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.getElementById('registerBtn');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirigir a la página de registro
            window.location.href = 'registro.html';
        });
    }
});

// ===========================
// ENHANCED ANIMATIONS AND SCROLL EFFECTS
// ===========================

// Loading Screen Management
document.addEventListener('DOMContentLoaded', function() {
    // Create loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = `
        <div style="text-align: center;">
            <div class="loader"></div>
            <div class="loading-text">Cargando IN OUT MANAGER...</div>
        </div>
    `;
    document.body.appendChild(loadingScreen);

    // Page content container
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('page-content');
    }

    // Hide loading screen after content loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            if (mainContent) {
                mainContent.classList.add('loaded');
            }
            
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1000);
    });
});

// Enhanced Navigation Scroll Effects
class EnhancedNavigation {
    constructor() {
        this.nav = document.querySelector('.main-nav');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.init();
    }

    init() {
        if (!this.nav) return;
        
        window.addEventListener('scroll', () => {
            this.lastScrollY = window.scrollY;
            this.requestTick();
        });
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateNav());
            this.ticking = true;
        }
    }

    updateNav() {
        const currentScrollY = this.lastScrollY;
        
        // Add scrolled class when scrolling down
        if (currentScrollY > 100) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }

        // Hide/show navigation based on scroll direction
        if (currentScrollY > this.previousScrollY && currentScrollY > 200) {
            this.nav.classList.add('hidden');
        } else {
            this.nav.classList.remove('hidden');
        }

        this.previousScrollY = currentScrollY;
        this.ticking = false;
    }
}

// Scroll Reveal Animation System
class ScrollRevealAnimations {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        // Add scroll-reveal class to main sections
        const sections = document.querySelectorAll('section, .service-card, .tech-card, .contact-form');
        sections.forEach(element => {
            element.classList.add('scroll-reveal');
            this.elements.push(element);
        });

        // Setup intersection observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        this.elements.forEach(element => {
            this.observer.observe(element);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Add staggered animation delay for child elements
                const children = entry.target.querySelectorAll('.service-card, .tech-item, .form-group');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('fade-in');
                    }, index * 100);
                });
            }
        });
    }
}

// Enhanced Card Interactions
class EnhancedCards {
    constructor() {
        this.init();
    }

    init() {
        // Add enhanced card class and interactions
        const cards = document.querySelectorAll('.service-card, .tech-card');
        cards.forEach(card => {
            card.classList.add('enhanced-card');
            
            // Add ripple effect to buttons within cards
            const buttons = card.querySelectorAll('button, .btn');
            buttons.forEach(btn => {
                btn.classList.add('ripple-btn');
            });
        });
    }
}

// Smooth Scrolling Enhancement
class SmoothScrolling {
    constructor() {
        this.init();
    }

    init() {
        // Enhanced smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offset = 100; // Account for fixed navigation
                    const elementPosition = targetElement.offsetTop - offset;
                    
                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Enhanced Form Interactions
class EnhancedForms {
    constructor() {
        this.init();
    }

    init() {
        // Add floating label effect to contact form
        const forms = document.querySelectorAll('.modern-form, .contact-form');
        forms.forEach(form => {
            const formGroups = form.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                const input = group.querySelector('input, select, textarea');
                const label = group.querySelector('label');
                
                if (input && label) {
                    this.setupFloatingLabel(group, input, label);
                }
            });
        });
    }

    setupFloatingLabel(group, input, label) {
        group.classList.add('floating-label');
        
        // Set placeholder for floating effect
        if (!input.placeholder) {
            input.placeholder = ' ';
        }
    }
}

// ===========================
// PERFORMANCE OPTIMIZATIONS AND ERROR HANDLING
// ===========================

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0
        };
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.measureRenderTime();
        this.setupErrorHandling();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.metrics.loadTime = loadTime;
            console.log(`⚡ Página cargada en ${Math.round(loadTime)}ms`);
        });
    }

    measureRenderTime() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                const renderTime = performance.now();
                this.metrics.renderTime = renderTime;
                console.log(`🎨 Renderizado completado en ${Math.round(renderTime)}ms`);
            });
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (error) => {
            console.error('❌ Error de JavaScript:', error);
            this.handleError(error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promise rechazada:', event.reason);
            this.handlePromiseRejection(event);
        });
    }

    handleError(error) {
        // Graceful error handling - don't break the user experience
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-notification';
        errorMessage.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">Se produjo un error. La página continuará funcionando.</span>
                <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(errorMessage);

        setTimeout(() => {
            if (errorMessage.parentElement) {
                errorMessage.remove();
            }
        }, 5000);
    }

    handlePromiseRejection(event) {
        event.preventDefault(); // Prevent unhandled rejection error
        console.warn('Promise rejection handled gracefully');
    }
}

// Lazy Loading eliminado - No se utiliza y causaba problemas de opacidad

// Enhanced Local Storage Manager
class EnhancedStorageManager {
    constructor() {
        this.storageKey = 'inoutmanager_data';
        this.compressionEnabled = true;
    }

    save(key, data) {
        try {
            const storage = this.getStorage();
            storage[key] = {
                data: this.compressionEnabled ? this.compress(data) : data,
                timestamp: Date.now(),
                compressed: this.compressionEnabled
            };
            localStorage.setItem(this.storageKey, JSON.stringify(storage));
            return true;
        } catch (error) {
            console.warn('Error guardando en localStorage:', error);
            return false;
        }
    }

    load(key) {
        try {
            const storage = this.getStorage();
            if (storage[key]) {
                const item = storage[key];
                return item.compressed ? this.decompress(item.data) : item.data;
            }
            return null;
        } catch (error) {
            console.warn('Error cargando desde localStorage:', error);
            return null;
        }
    }

    getStorage() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch {
            return {};
        }
    }

    compress(data) {
        // Simple compression for JSON data
        return JSON.stringify(data);
    }

    decompress(data) {
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }

    getStorageSize() {
        const data = localStorage.getItem(this.storageKey) || '';
        return (data.length * 2) / 1024; // Size in KB
    }
}

// Enhanced Accessibility Features
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupHighContrast();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for custom elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals or dropdowns
                const activeDropdowns = document.querySelectorAll('.dropdown.active');
                activeDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    setupFocusManagement() {
        // Ensure proper focus indicators
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('button, input, select, textarea, a')) {
                e.target.classList.add('keyboard-focused');
            }
        });

        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('keyboard-focused');
        });
    }

    setupAriaLabels() {
        // Add missing aria labels
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
    }

    setupHighContrast() {
        // Detect high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }
}

// ===========================
// SCROLL ANIMATION EFFECTS
// ===========================

// Intersection Observer for scroll animations
class ScrollAnimator {
  constructor() {
    this.animatedElements = [];
    this.observer = null;
    this.init();
  }
  
  init() {
    // Set up Intersection Observer
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.15 // trigger when 15% of element is visible
    };
    
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options);
    
    // Elements with animation classes
    document.querySelectorAll('.modern-section, .section-image, .section-text, .text-block').forEach(el => {
      // Add appropriate animation class if not already present
      if (!el.classList.contains('fade-in-up') && 
          !el.classList.contains('fade-in-left') && 
          !el.classList.contains('fade-in-right')) {
        
        if (el.classList.contains('section-image')) {
          el.classList.add('fade-in-left');
        } else if (el.classList.contains('section-text')) {
          el.classList.add('fade-in-right');
        } else if (el.classList.contains('text-block')) {
          el.classList.add('fade-in-up');
        } else {
          el.classList.add('fade-in-up');
        }
      }
      
      // Observe element
      this.observer.observe(el);
      this.animatedElements.push(el);
    });
    
    // First check in case elements are already in view
    setTimeout(() => {
      this.checkInitialVisibility();
    }, 100);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add visible class to trigger animation
        entry.target.classList.add('visible');
        
        // Stop observing after animation
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  checkInitialVisibility() {
    this.animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        el.classList.add('visible');
        this.observer.unobserve(el);
      }
    });
  }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize only after a slight delay to ensure other DOM operations complete
  setTimeout(() => {
    new ScrollAnimator();
  }, 500);
});

// Add parallax effect to section background
class ParallaxBackground {
  constructor() {
    this.sections = document.querySelectorAll('.modern-section');
    this.init();
  }
  
  init() {
    if (this.sections.length === 0) return;
    
    // Add event listener for scroll
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Initial check
    this.handleScroll();
  }
  
  handleScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + scrollPosition;
      const sectionCenter = sectionTop + (rect.height / 2);
      
      // Calculate distance from center of viewport
      const distanceFromCenter = (sectionCenter - scrollPosition - (windowHeight / 2)) * 0.1;
      
      // Apply subtle parallax effect to background
      section.style.backgroundPosition = `center ${distanceFromCenter}px`;
    });
  }
}

// Initialize parallax effect
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    new ParallaxBackground();
  }, 600);
});

// Inicialización unificada del sistema
class SystemInitializer {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        // Core Features
        new EnhancedNavigation();
        new ScrollRevealAnimations();
        new SmoothScrolling();
        new EnhancedForms();
        
        // Performance & Accessibility
        new PerformanceMonitor();
        new AccessibilityEnhancer();
        
        // Storage
        window.storageManager = new EnhancedStorageManager();
        
        // Carousel (si existe en la página)
        if (document.querySelector('.carousel-wrapper')) {
            new ServiceCarousel();
        }
        
        this.initialized = true;
        console.log('🚀 Sistema inicializado correctamente');
    }
}

// Single initialization point
document.addEventListener('DOMContentLoaded', () => {
    new SystemInitializer();
});
