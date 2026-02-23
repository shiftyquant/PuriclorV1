/**
 * PuriClor – navbar scroll behavior (show/hide, solid on scroll)
 */
(function () {
  var SCROLL_THRESHOLD = 50;
  var SCROLL_DELTA = 8;
  var header = document.getElementById('headerNav');
  var scrolled = false;
  var hidden = false;
  var lastScrollY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    var nowScrolled = y >= SCROLL_THRESHOLD;
    if (nowScrolled !== scrolled) {
      scrolled = nowScrolled;
      header.classList.toggle('nav-scrolled', scrolled);
    }
    if (y <= SCROLL_THRESHOLD) {
      if (hidden) {
        hidden = false;
        header.classList.remove('nav-hidden');
      }
    } else {
      if (y > lastScrollY && y - lastScrollY > SCROLL_DELTA) {
        if (!hidden) {
          hidden = true;
          header.classList.add('nav-hidden');
        }
      } else if (y < lastScrollY && lastScrollY - y > SCROLL_DELTA) {
        if (hidden) {
          hidden = false;
          header.classList.remove('nav-hidden');
        }
      }
    }
    lastScrollY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/**
 * Mobile nav: hamburger toggle and close on link click / escape
 */
(function () {
  var header = document.getElementById('headerNav');
  var menuBtn = document.getElementById('navMenuBtn');
  var menuPanel = document.getElementById('navMenuPanel');
  if (!header || !menuBtn || !menuPanel) return;

  function openMenu() {
    header.classList.add('nav-menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Cerrar menú');
    menuPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    header.classList.remove('nav-menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    menuPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function isOpen() {
    return header.classList.contains('nav-menu-open');
  }

  menuBtn.addEventListener('click', function () {
    if (isOpen()) closeMenu();
    else openMenu();
  });

  menuPanel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 640 && isOpen()) closeMenu();
  });
})();

/**
 * Contact FAB: hero bottom-right when at top, fixed left-center when scrolled
 */
(function () {
  var contactFab = document.getElementById('contactFab');
  if (!contactFab) return;

  var SCROLL_THRESHOLD = 180; /* scroll past hero: fixed left-center; at top: hero bottom-right */

  function updateContactFab() {
    var y = window.scrollY;
    if (y > SCROLL_THRESHOLD) {
      contactFab.classList.add('contact-fab--fixed');
    } else {
      contactFab.classList.remove('contact-fab--fixed');
    }
  }

  window.addEventListener('scroll', updateContactFab, { passive: true });
  window.addEventListener('resize', updateContactFab);
  updateContactFab();
})();

/**
 * Productos carousel: one item per click, translateX, smooth slide, 3 visible (desktop) / 1 (mobile)
 */
(function () {
  var section = document.getElementById('productos');
  if (!section) return;
  var viewport = section.querySelector('.products-carousel__viewport');
  var list = section.querySelector('.products-carousel__list');
  var prevBtn = section.querySelector('.products-carousel__btn--prev');
  var nextBtn = section.querySelector('.products-carousel__btn--next');
  if (!viewport || !list || !prevBtn || !nextBtn) return;

  var totalItems = 6;
  var currentIndex = 0;
  var visibleCount = 1;

  function getStep() {
    var w = viewport.offsetWidth;
    visibleCount = w >= 768 ? 3 : 1;
    return w / visibleCount;
  }

  function applyTransform() {
    var step = getStep();
    var x = -currentIndex * step;
    list.style.transform = 'translateX(' + x + 'px)';
  }

  prevBtn.addEventListener('click', function () {
    if (currentIndex <= 0) return;
    currentIndex -= 1;
    applyTransform();
  });

  nextBtn.addEventListener('click', function () {
    if (currentIndex >= totalItems - 1) return;
    currentIndex += 1;
    applyTransform();
  });

  window.addEventListener('resize', function () {
    applyTransform();
  });

  applyTransform();
})();
