// Navegación desplegable para Servicios
const dropdown = document.querySelector('.dropdown');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownContent = document.querySelector('.dropdown-content');

if (dropdown && dropdownToggle && dropdownContent) {
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
}

// Desplazamiento suave para todos los enlaces de navegación
const navLinks = document.querySelectorAll('.main-nav a[href^="#"], .dropdown-content a');
navLinks.forEach(link => {
  link.addEventListener('click', function (e) {
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
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
});
