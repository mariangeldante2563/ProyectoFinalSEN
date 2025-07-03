/**
 * IN OUT MANAGER - Script principal
 * 
 * Este archivo contiene todas las funcionalidades JavaScript necesarias
 * para el correcto funcionamiento del sitio web IN OUT MANAGER.
 * 
 * @author IN OUT MANAGER Team
 * @version 1.0.0
 */

// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar todos los componentes
  initNavigation();
  initCarousel();
  initAnimations();
  initFormValidation();
  initAuthButtons();
  initMobileMenu();
  initContactCardEffects(); // Nueva función para los efectos de la tarjeta de contacto
});

/* ========================================
   INICIO: NAVEGACIÓN Y MENÚ PRINCIPAL
   ======================================== */
/**
 * Inicializa la navegación y el menú desplegable
 */
function initNavigation() {
  // Manejo de navegación principal
  const navLinks = document.querySelectorAll('.nav-btn');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Solo aplicar a enlaces internos que comienzan con #
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Scroll suave hacia el elemento
          window.scrollTo({
            top: targetElement.offsetTop - 70, // Offset para tener en cuenta el header
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Manejo del menú desplegable (si existe)
  const dropdown = document.querySelector('.dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  if (dropdown && dropdownToggle && dropdownContent) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('open');
      
      // Accesibilidad
      const isExpanded = dropdown.classList.contains('open');
      dropdownToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
    
    // Cerrar el menú si se hace clic fuera
    document.addEventListener('click', (e) => {
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
/* ========================================
   FIN: NAVEGACIÓN Y MENÚ PRINCIPAL
   ======================================== */

/* ========================================
   INICIO: CARRUSEL DE IMÁGENES
   ======================================== */
/**
 * Inicializa el carrusel de imágenes
 */
function initCarousel() {
  const carouselTrack = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorsContainer = document.getElementById('carouselIndicators');
  
  // Si no existen elementos del carrusel, salir
  if (!carouselTrack || !slides.length || !prevBtn || !nextBtn) {
    return;
  }
  
  let currentSlide = 0;
  let isAnimating = false;
  let autoplayInterval = null;
  const autoplayDelay = 5000; // 5 segundos
  
  // Crear indicadores de posición
  if (indicatorsContainer) {
    for (let i = 0; i < slides.length; i++) {
      const indicator = document.createElement('div');
      indicator.classList.add('carousel-indicator');
      if (i === 0) indicator.classList.add('active');
      indicator.addEventListener('click', () => {
        if (currentSlide !== i) {
          currentSlide = i;
          updateCarousel();
          resetAutoplay();
        }
      });
      indicatorsContainer.appendChild(indicator);
    }
  }
  
  // Función para actualizar el carrusel
  function updateCarousel() {
    if (isAnimating) return;
    
    isAnimating = true;
    const translateX = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${translateX}%)`;
    
    // Actualizar indicadores
    if (indicatorsContainer) {
      const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
      indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
    
    // Después de la transición
    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }
  
  // Navegación: Anterior
  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
    resetAutoplay();
  });
  
  // Navegación: Siguiente
  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
    resetAutoplay();
  });
  
  // Iniciar autoplay
  function startAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
    
    autoplayInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      updateCarousel();
    }, autoplayDelay);
  }
  
  // Reiniciar autoplay
  function resetAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
    startAutoplay();
  }
  
  // Pausar autoplay al pasar el ratón
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    });
    
    carouselWrapper.addEventListener('mouseleave', () => {
      startAutoplay();
    });
  }
  
  // Soporte para gestos táctiles
  let touchStartX = 0;
  let touchEndX = 0;
  
  if (carouselWrapper) {
    carouselWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carouselWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }
  
  function handleSwipe() {
    const minSwipeDistance = 50;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Deslizar a la izquierda, ir a la siguiente diapositiva
        currentSlide = (currentSlide + 1) % slides.length;
      } else {
        // Deslizar a la derecha, ir a la diapositiva anterior
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      }
      
      updateCarousel();
      resetAutoplay();
    }
  }
  
  // Soporte para navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      updateCarousel();
      resetAutoplay();
    } else if (e.key === 'ArrowRight') {
      currentSlide = (currentSlide + 1) % slides.length;
      updateCarousel();
      resetAutoplay();
    }
  });
  
  // Asegurarse de que las imágenes estén cargadas
  Promise.all(Array.from(document.querySelectorAll('.carousel-slide img'))
    .filter(img => !img.complete)
    .map(img => new Promise(resolve => {
      img.onload = img.onerror = resolve;
    }))
  ).then(() => {
    // Inicialización después de que las imágenes se hayan cargado
    updateCarousel();
    startAutoplay();
  });
  
  // Inicialización inmediata para evitar retrasos percibidos
  updateCarousel();
  startAutoplay();
}
/* ========================================
   FIN: CARRUSEL DE IMÁGENES
   ======================================== */

/* ========================================
   INICIO: ANIMACIONES DE ELEMENTOS
   ======================================== */
/**
 * Inicializa las animaciones basadas en scroll e interacción
 */
function initAnimations() {
  // Iniciar animaciones basadas en scroll usando Intersection Observer
  const animatedElements = document.querySelectorAll('.animate-entry');
  const technologyItems = document.querySelectorAll('.technology-item');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  // Configurar Observer para detectar cuando elementos entran en viewport
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.15 // visible al menos 15%
  };
  
  // Función que se ejecuta cuando un elemento entra en el viewport
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      // Si el elemento es visible
      if (entry.isIntersecting) {
        // Aplicar clase para mostrar con retardo basado en el índice
        const delay = Array.from(animatedElements).indexOf(entry.target) * 150;
        
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        
        // Animar elementos de tecnología si la sección es de tecnologías
        if (entry.target.classList.contains('technologies-section')) {
          animateTechItems();
        }
        
        // Animar elementos de portfolio si la sección es de portfolio
        if (entry.target.classList.contains('portfolio-section')) {
          animatePortfolioItems();
        }
        
        // Animar sección Sobre Nosotros
        if (entry.target.classList.contains('about-section')) {
          setTimeout(() => {
            const aboutOverlay = document.querySelector('.about-overlay');
            if (aboutOverlay) {
              aboutOverlay.style.opacity = '0.9';
              aboutOverlay.style.transform = 'translateY(0)';
              
              setTimeout(() => {
                aboutOverlay.style.opacity = '0';
                aboutOverlay.style.transform = 'translateY(30px)';
              }, 2000);
            }
          }, 500);
        }
        
        // Dejar de observar después de animarlo
        observer.unobserve(entry.target);
      }
    });
  };
  
  // Función para animar elementos de tecnología con retraso secuencial
  function animateTechItems() {
    technologyItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }
  
  // Función para animar elementos de portfolio con retraso secuencial
  function animatePortfolioItems() {
    portfolioItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0) scale(1)';
      }, index * 150);
    });
  }
  
  // Crear observer
  const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
  
  // Iniciar con opacity 0 y observar cada elemento
  animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    intersectionObserver.observe(element);
  });
  
  // Inicializar tecnología y portfolio items
  technologyItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(40px)';
    item.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
  });
  
  portfolioItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(40px) scale(0.95)';
    item.style.transition = 'all 0.7s ease-out';
  });
  
  // Añadir efecto hover avanzado a las tarjetas de tecnología
  technologyItems.forEach(item => {
    // Crear efecto de reflejo
    const reflectionEffect = document.createElement('div');
    reflectionEffect.classList.add('reflection-effect');
    
    // Agregar efecto de movimiento con mouse
    item.addEventListener('mousemove', e => {
      const { left, top, width, height } = item.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      item.style.transform = `translateY(-10px) perspective(1000px) rotateX(${y * 5}deg) rotateY(${x * -5}deg)`;
      
      const imgElement = item.querySelector('img');
      if (imgElement) {
        imgElement.style.transform = `scale(1.05) translateX(${x * 10}px) translateY(${y * 10}px)`;
      }
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(-10px)';
      
      const imgElement = item.querySelector('img');
      if (imgElement) {
        imgElement.style.transform = 'scale(1.05)';
      }
    });
  });
  
  // Detectar preferencia de reducción de movimiento
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion.matches) {
    // Si el usuario prefiere menos movimiento, mostrar todo sin animaciones
    document.querySelectorAll('.animate-entry, .fade-in, .slide-in, .scale-up, .technology-item, .portfolio-item').forEach(el => {
      el.style.opacity = '1';
      el.style.animation = 'none';
      el.style.transition = 'none';
      el.style.transform = 'none';
    });
  }
  
  // Escuchar cambios en la preferencia
  prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
      // Desactivar animaciones
      document.querySelectorAll('.animate-entry, .fade-in, .slide-in, .scale-up, .technology-item, .portfolio-item').forEach(el => {
        el.style.opacity = '1';
        el.style.animation = 'none';
        el.style.transition = 'none';
        el.style.transform = 'none';
      });
    }
  });
}
/* ========================================
   FIN: ANIMACIONES DE ELEMENTOS
   ======================================== */

/* ========================================
   INICIO: VALIDACIÓN DE FORMULARIOS
   ======================================== */
/**
 * Inicializa la validación de formularios
 */
function initFormValidation() {
  // Formulario de contacto
  initContactFormValidation();
  
  // Toggle de visibilidad de contraseña
  initPasswordToggle();
}

/**
 * Inicializa la validación del formulario de contacto
 */
function initContactFormValidation() {
  const contactForm = document.getElementById('contactForm');
  
  if (!contactForm) return;
  
  // Obtener todos los campos de entrada
  const nameInput = contactForm.querySelector('#name');
  const emailInput = contactForm.querySelector('#email');
  const messageInput = contactForm.querySelector('#message');
  const formStatus = contactForm.querySelector('.form-status');
  
  // Configurar la validación en tiempo real
  setupRealTimeValidation(nameInput, {
    valueMissing: 'Por favor, introduce tu nombre.',
    patternMismatch: 'El nombre solo debe contener letras.',
    tooShort: 'El nombre debe tener al menos 2 caracteres.'
  });
  
  setupRealTimeValidation(emailInput, {
    valueMissing: 'Por favor, introduce tu correo electrónico.',
    typeMismatch: 'Por favor, introduce una dirección de correo válida.',
    patternMismatch: 'El formato del correo no es válido.'
  });
  
  setupRealTimeValidation(messageInput, {
    valueMissing: 'Por favor, introduce tu mensaje.',
    tooShort: 'El mensaje debe tener al menos 10 caracteres.',
    tooLong: 'El mensaje no puede exceder los 500 caracteres.'
  });
  
  // Manejar el envío del formulario
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const isNameValid = validateField(nameInput);
    const isEmailValid = validateField(emailInput);
    const isMessageValid = validateField(messageInput);
    
    // Si hay errores, enfocar el primer campo inválido y detener
    if (!isNameValid || !isEmailValid || !isMessageValid) {
      // Enfocar el primer campo inválido
      if (!isNameValid) nameInput.focus();
      else if (!isEmailValid) emailInput.focus();
      else messageInput.focus();
      return;
    }
    
    // Mostrar estado de carga
    const submitBtn = contactForm.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simular envío (aquí se conectaría con el backend real)
    setTimeout(() => {
      // Mostrar mensaje de éxito
      formStatus.textContent = '¡Gracias! Tu mensaje ha sido enviado correctamente.';
      formStatus.className = 'form-status success';
      
      // Restaurar estado del botón
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      
      // Resetear formulario
      contactForm.reset();
      
      // Limpiar mensajes de error
      contactForm.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.remove('visible');
      });
      
      // Quitar clases de validación
      contactForm.querySelectorAll('input, textarea').forEach(el => {
        el.classList.remove('valid', 'invalid');
      });
      
      // Desaparecer mensaje de éxito después de un tiempo
      setTimeout(() => {
        formStatus.classList.remove('success');
      }, 5000);
    }, 1500);
  });
}

/**
 * Configura la validación en tiempo real para un campo
 * @param {HTMLElement} field - El campo a validar
 * @param {Object} errorMessages - Mensajes de error personalizados
 */
function setupRealTimeValidation(field, errorMessages) {
  if (!field) return;
  
  const errorElement = document.getElementById(`${field.id}Error`);
  
  // Validar al perder el foco
  field.addEventListener('blur', () => {
    validateField(field, errorElement, errorMessages);
  });
  
  // Validar al escribir (después de un pequeño retardo)
  let typingTimer;
  field.addEventListener('input', () => {
    clearTimeout(typingTimer);
    
    // Solo validar si ya se ha interactuado con el campo
    if (field.classList.contains('invalid') || field.classList.contains('valid')) {
      typingTimer = setTimeout(() => {
        validateField(field, errorElement, errorMessages);
      }, 500);
    }
  });
}

/**
 * Valida un campo y muestra errores si es necesario
 * @param {HTMLElement} field - El campo a validar
 * @param {HTMLElement} errorElement - El elemento para mostrar errores
 * @param {Object} customMessages - Mensajes de error personalizados
 * @returns {Boolean} - Si el campo es válido
 */
function validateField(field, errorElement, customMessages = {}) {
  if (!field) return true;
  
  // Si no se proporcionó un elemento de error, intentar encontrarlo
  if (!errorElement) {
    errorElement = document.getElementById(`${field.id}Error`);
  }
  
  // Verificar validez
  const isValid = field.checkValidity();
  
  // Aplicar clases CSS
  field.classList.toggle('valid', isValid);
  field.classList.toggle('invalid', !isValid);
  
  // Si hay errores, mostrar mensaje adecuado
  if (!isValid && errorElement) {
    let errorMessage = '';
    
    if (field.validity.valueMissing) {
      errorMessage = customMessages.valueMissing || 'Este campo es obligatorio.';
    } else if (field.validity.typeMismatch) {
      errorMessage = customMessages.typeMismatch || 'El formato no es válido.';
    } else if (field.validity.patternMismatch) {
      errorMessage = customMessages.patternMismatch || 'El formato no es válido.';
    } else if (field.validity.tooShort) {
      errorMessage = customMessages.tooShort || `Mínimo ${field.minLength} caracteres.`;
    } else if (field.validity.tooLong) {
      errorMessage = customMessages.tooLong || `Máximo ${field.maxLength} caracteres.`;
    } else if (field.validity.rangeUnderflow) {
      errorMessage = customMessages.rangeUnderflow || `Valor mínimo: ${field.min}.`;
    } else if (field.validity.rangeOverflow) {
      errorMessage = customMessages.rangeOverflow || `Valor máximo: ${field.max}.`;
    } else if (field.validity.badInput) {
      errorMessage = customMessages.badInput || 'El valor no es válido.';
    }
    
    errorElement.textContent = errorMessage;
    errorElement.classList.add('visible');
  } else if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
  }
  
  return isValid;
}

/**
 * Inicializa el toggle de contraseña
 */
function initPasswordToggle() {
  const passwordToggles = document.querySelectorAll('.password-toggle input[type="checkbox"]');
  
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const passwordField = toggle.closest('.form-group').querySelector('input[type="password"], input[type="text"]');
      
      if (passwordField) {
        passwordField.type = toggle.checked ? 'text' : 'password';
      }
    });
  });
}
/* ========================================
   FIN: VALIDACIÓN DE FORMULARIOS
   ======================================== */

/* ========================================
   INICIO: FUNCIONALIDAD DE AUTENTICACIÓN
   ======================================== */
/**
 * Inicializa los botones de autenticación
 */
function initAuthButtons() {
  const registerBtn = document.getElementById('registerBtn');
  const loginBtn = document.getElementById('loginBtn');
  
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      // Mantener el comportamiento predeterminado para navegar a la página de registro
      // pero podemos agregar efectos o lógica adicional aquí
      console.log('Navegando a la página de registro...');
    });
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      // Mantener el comportamiento predeterminado para navegar a la página de inicio de sesión
      // pero podemos agregar efectos o lógica adicional aquí
      console.log('Navegando a la página de inicio de sesión...');
    });
  }
}
/* ========================================
   FIN: FUNCIONALIDAD DE AUTENTICACIÓN
   ======================================== */

/* ========================================
   INICIO: FUNCIONALIDAD DE MENÚ MÓVIL
   ======================================== */
/**
 * Inicializa el menú móvil
 */
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.querySelector('.main-nav');
  const navMenuList = document.querySelector('.nav-menu-list');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mainNav.classList.toggle('open');
      
      // Cambiar el atributo aria-expanded
      const isExpanded = mainNav.classList.contains('open');
      mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
      
      // Si está cerrado, cambiar aria-label a "Abrir menú"
      // Si está abierto, cambiar aria-label a "Cerrar menú"
      mobileMenuToggle.setAttribute(
        'aria-label', 
        isExpanded ? 'Cerrar menú' : 'Abrir menú'
      );
    });
    
    // Cerrar el menú al hacer clic en un enlace
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          mobileMenuToggle.classList.remove('active');
          mainNav.classList.remove('open');
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
          mobileMenuToggle.setAttribute('aria-label', 'Abrir menú');
        }
      });
    });
    
    // Inicializar estado aria
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }
}
/* ========================================
   FIN: FUNCIONALIDAD DE MENÚ MÓVIL
   ======================================== */

/* ========================================
   INICIO: EFECTOS DE TARJETA DE CONTACTO 3D
   ======================================== */
/**
 * Inicializa efectos de la tarjeta de contacto 3D
 */
function initContactCardEffects() {
  const contactCard = document.querySelector('.contact-card');
  const contactForm = document.getElementById('contactForm');
  
  if (!contactCard || !contactForm) return;
  
  // Efecto de seguimiento del cursor para la tarjeta de contacto
  contactCard.addEventListener('mousemove', (e) => {
    // No aplicar efecto 3D si está en móvil
    if (window.innerWidth < 768) return;
    
    const rect = contactCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calcular rotación basada en la posición del cursor
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Limitar la rotación a un máximo de 10 grados
    const maxRotation = 5;
    const rotateY = maxRotation * (x - centerX) / centerX;
    const rotateX = maxRotation * (centerY - y) / centerY;
    
    // Aplicar la transformación solo si no está volteada
    if (!contactCard.classList.contains('flipped')) {
      contactCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  });
  
  // Restablecer la transformación cuando el cursor sale de la tarjeta
  contactCard.addEventListener('mouseleave', () => {
    if (!contactCard.classList.contains('flipped')) {
      contactCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }
  });
  
  // Opciones para las animaciones de entrada
  const animationOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };
  
  // Observer para animar la tarjeta de contacto cuando es visible
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Añadir clase para animar la entrada de la tarjeta
        contactCard.classList.add('animate-card');
        contactObserver.unobserve(entry.target);
      }
    });
  }, animationOptions);
  
  // Observar la sección de contacto
  contactObserver.observe(document.querySelector('.contact-section'));
  
  // Evitar que el formulario gire la tarjeta al hacer click en los campos
  contactForm.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Añadir efecto al enviar el formulario
  contactForm.addEventListener('submit', () => {
    // Añadir clase para efecto de envío exitoso
    contactCard.classList.add('success-submit');
    
    // Quitar la clase después de la animación
    setTimeout(() => {
      contactCard.classList.remove('success-submit');
    }, 2000);
  });
}
/* ========================================
   FIN: EFECTOS DE TARJETA DE CONTACTO 3D
   ======================================== */


