/**
 * Loads productos-data.json and renders product cards into #productos-grid-inner.
 * Run scripts/generate-products.js to regenerate the JSON from /assets P* images.
 */
(function () {
  const gridEl = document.getElementById('productos-grid-inner');
  if (!gridEl) return;

  const ASSETS_BASE = '../assets/';
  const PRODUCT_PAGE_BASE = 'productos/';

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function buildCard(product) {
    const href = PRODUCT_PAGE_BASE + product.slug + '.html';
    const imgSrc = ASSETS_BASE + encodeURIComponent(product.filename);
    const title = escapeHtml(product.title);
    const desc = escapeHtml(product.description);

    const a = document.createElement('a');
    a.href = href;
    a.className = 'product-card';
    a.innerHTML =
      '<span class="product-card__img-wrap">' +
      '<img src="' + imgSrc + '" alt="" class="product-card__img" width="240" height="240" loading="lazy" />' +
      '</span>' +
      '<h2 class="product-card__title">' + title + '</h2>' +
      '<span class="product-card__cta">Más información</span>';
    return a;
  }

  function render(products) {
    gridEl.setAttribute('aria-busy', 'false');
    gridEl.innerHTML = '';
    products.forEach(function (product) {
      gridEl.appendChild(buildCard(product));
    });
  }

  function showError() {
    gridEl.setAttribute('aria-busy', 'false');
    gridEl.innerHTML =
      '<p class="text-slate-600 text-center py-8">No se pudo cargar la lista de productos. Ejecute <code>node scripts/generate-products.js</code> y recargue.</p>';
  }

  fetch('./productos-data.json')
    .then(function (res) {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(render)
    .catch(showError);
})();
