(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  const search = document.querySelector('#product-search');
  const filters = [...document.querySelectorAll('.filter-chip')];
  const cards = [...document.querySelectorAll('.product-card')];
  const emptyMessage = document.querySelector('#empty-results');
  const quoteForm = document.querySelector('#quote-form');
  const productSelect = document.querySelector('#quote-product');
  const formNote = document.querySelector('#form-note');

  document.querySelector('#year').textContent = new Date().getFullYear();

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }));

  let activeFilter = 'all';
  function filterProducts() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !query || card.dataset.search.includes(query);
      const show = matchesCategory && matchesSearch;
      card.hidden = !show;
      if (show) visible++;
    });
    emptyMessage.hidden = visible > 0;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    filterProducts();
  }));
  search?.addEventListener('input', filterProducts);

  document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {
    productSelect.value = button.dataset.product;
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => quoteForm.querySelector('[name="name"]').focus(), 500);
  }));

  quoteForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) return;
    const form = new FormData(quoteForm);
    const message = [
      'Hello Baba Shree Industries, I would like to enquire about your products.',
      `Name: ${form.get('name')}`,
      form.get('company') ? `Company: ${form.get('company')}` : '',
      `Phone: ${form.get('phone')}`,
      `Product: ${form.get('product')}`,
      form.get('quantity') ? `Quantity: ${form.get('quantity')}` : '',
      form.get('dimensions') ? `Size / dimensions: ${form.get('dimensions')}` : '',
      `Requirements: ${form.get('message')}`
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/919617999539?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    else window.location.href = url;
    formNote.textContent = 'WhatsApp opened with your enquiry. Please send the message there to complete your request.';
    formNote.classList.add('form-note-success');
  });
})();
