const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

    function bookSeat(seatElementId, btnElement) {
      const seatBadge = document.getElementById(seatElementId);
      let currentSeats = parseInt(seatBadge.innerText);

      if (currentSeats > 0) {
        currentSeats--;
        seatBadge.innerText = `${currentSeats} Seats Left`;

        btnElement.innerText = 'Booked ✓';
        btnElement.classList.remove('bg-brand-600', 'hover:bg-brand-500');
        btnElement.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
        btnElement.disabled = true;

        if (currentSeats === 0) {
          seatBadge.innerText = '0 Seats Left';
          seatBadge.classList.remove('text-emerald-400', 'bg-emerald-500/10', 'border-emerald-500/20');
          seatBadge.classList.add('text-rose-400', 'bg-rose-500/10', 'border-rose-500/20');
        }
      }
    }




document.addEventListener('DOMContentLoaded', () => {
  initSearchAndFilter();
});

function initSearchAndFilter() {
  const searchInput = document.getElementById('event-search-input');
  const categorySelect = document.getElementById('category-select');

  if (!searchInput || !categorySelect) return;

  searchInput.addEventListener('input', filterEvents);
  categorySelect.addEventListener('change', filterEvents);
}

function filterEvents() {
  const searchQuery = document.getElementById('event-search-input').value.toLowerCase().trim();
  const selectedCategory = document.getElementById('category-select').value.toLowerCase();
  
  const cards = document.querySelectorAll('.grid > div[data-category]');

  cards.forEach(card => {
    const title = card.querySelector('h2').innerText.toLowerCase();
    const description = card.querySelector('p').innerText.toLowerCase();
    const cardCategory = card.getAttribute('data-category').toLowerCase();

    const matchesSearch = title.includes(searchQuery) || description.includes(searchQuery);
    const matchesCategory = (selectedCategory === 'all') || (cardCategory === selectedCategory);

    if (matchesSearch && matchesCategory) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}