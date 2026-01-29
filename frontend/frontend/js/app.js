/**
 * app.js — comportamiento interactivo del sitio
 * - abre el modal de detalles cuando el usuario hace click en "Detalles"
 * - gestiona las pestañas del menú y los carruseles por categoría
 * - controla las flechas para desplazar los carruseles
 */

document.addEventListener('DOMContentLoaded', function () {
  
  // ==============================================
  // LÓGICA DEL MODAL DE DETALLES DEL PLATO
  // ==============================================
  
  const overlay = document.querySelector('.modal-overlay');
  const imgEl = overlay?.querySelector('.modal-image img');
  const titleEl = overlay?.querySelector('.detail-title');
  const priceEl = overlay?.querySelector('.detail-price');
  const descEl = overlay?.querySelector('.detail-description');
  const ingredientsEl = overlay?.querySelector('.detail-ingredients-text');
  const closeBtn = overlay?.querySelector('.modal-close-btn');
  const cancelBtn = overlay?.querySelector('.btn-cancel');

  // Abre el modal y lo rellena con los datos del plato
  function openModal(data) {
    if (!overlay) return;
    
    // Llenamos los campos del modal con la información del plato
    if (data.image) imgEl.src = data.image;
    if (data.title) titleEl.textContent = data.title;
    if (data.price) priceEl.textContent = data.price;
    if (data.desc) descEl.textContent = data.desc;
    if (data.ingredients) ingredientsEl.textContent = data.ingredients;

    // Mostramos el modal
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open'); 
  }

  // Cierra el modal
  function closeModal() {
    if (overlay) {
      overlay.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }

  // Escuchamos clics en los botones 'Detalles'
  document.querySelectorAll('.menu-card .btn-details').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.menu-card');
      
      const data = {
        image: card.querySelector('.card-image').src,
        title: card.getAttribute('data-title'),
        price: "Precio: " + card.getAttribute('data-price'),
        desc: card.getAttribute('data-desc'),
        ingredients: card.getAttribute('data-ingredients')
      };

      openModal(data);
    });
  });

  // Cerrar el modal con los botones
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  
  // Cerrar el modal al presionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeModal();
    }
  });


  // ==============================================
  // CAROUSEL DEL HERO (Auto-sliding)
  // ==============================================

  const heroCarousel = document.querySelector('.carousel');
  let currentSlide = 0;
  const totalSlides = document.querySelectorAll('.carousel-slide').length;

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }

  function updateCarousel() {
    if (heroCarousel) {
      heroCarousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }

  setInterval(nextSlide, 5000);


  // ==============================================
  // PESTAÑAS Y CAROUSEL DEL MENÚ
  // ==============================================

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetCategory = button.getAttribute('data-category');

      // Desactivar todas las pestañas
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Mostrar la pestaña activa
      button.classList.add('active');

      // Ocultar todos los carouseles
      carousels.forEach(carousel => carousel.style.display = 'none');

      // Mostrar el carousel objetivo
      const targetCarousel = document.querySelector(`.menu-carousel[data-category="${targetCategory}"]`);
      if (targetCarousel) {
        targetCarousel.style.display = 'block';
      }
    });
  });

  // ==============================================
  // CONTROLES DE CAROUSEL (Flechas de desplazamiento)
  // ==============================================

  function attachCarouselControls() {
    document.querySelectorAll('.menu-carousel').forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      const btnLeft = carousel.querySelector('.carousel-btn-left');
      const btnRight = carousel.querySelector('.carousel-btn-right');

function getScrollAmount() {
    // Buscar la tarjeta del menú o el ítem de servicio
    const firstCard = track.querySelector('.menu-card, .service_item'); 
    
    // Si no encuentra ninguna, usa el valor por defecto
    if (!firstCard) return 300; 
    
    // Calcula el ancho del ítem + el espacio entre ítems (gap)
    return firstCard.offsetWidth + 18; // 18px es el gap
}

      if (btnLeft && btnRight && track) {
        btnRight.addEventListener('click', () => {
          const amount = getScrollAmount();
          track.scrollBy({ left: amount, behavior: 'smooth' });
        });

        btnLeft.addEventListener('click', () => {
          const amount = getScrollAmount();
          track.scrollBy({ left: -amount, behavior: 'smooth' });
        });
      }
    });
  }

  // Adjuntamos controles de carousel al cargar
  attachCarouselControls();

  // ==============================================
  // LÓGICA DE HAMBURGUESA (Soporte para redimensionar)
  // ==============================================
  (function attachHamburgerResizeFix() {
    const mainNav = document.querySelector('.nav-wrapper'); // Contenedor del menú principal

    if (!mainNav) return;

    // Si el usuario redimensiona a escritorio, forzamos cerrar el menú móvil
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        mainNav.classList.remove('is-open');
        mainNav.style.maxHeight = "0";
      }
    });
  })();
  
  
  // ==============================================

  // ==============================================
  // FILTRADO DE GALERÍA DE IMÁGENES POR CATEGORÍA (AGREGADO)
  // Permite que los botones de la galería filtren imágenes por categoría
  // para Habitaciones, Restaurante, Áreas Comunes y Todos
  // ==============================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        // Quitar clase activa de todos los botones
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');
        galleryItems.forEach(item => {
          // Muestra todos si es 'all', si no solo los de la categoría
          if (filter === 'all') {
            item.style.display = '';
          } else if (item.classList.contains(filter)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

}); 

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. CONFIGURACIÓN DE FECHA MÍNIMA (No antes de hoy) ---
    const dateInput = document.getElementById('fecha');
    if (dateInput) {
        // Obtener la fecha de hoy en formato YYYY-MM-DD
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        
        // Aplicar la fecha mínima al campo de entrada
        dateInput.min = todayString;
    }
    
    // 2. La validación de hora ya no es necesaria, 
    //    ya que el menú <select> solo tiene valores válidos.
});