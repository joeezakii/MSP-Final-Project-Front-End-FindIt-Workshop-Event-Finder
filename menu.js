document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearchAndFilter();
  syncBookedSeatsOnLoad();
  checkAuthState();
});

function checkAuthState() {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  const guestAuthButtons = document.getElementById('guest-auth-buttons');
  const profileMenu = document.getElementById('user-profile-menu');
  const userAvatar = document.getElementById('user-avatar');
  const userDisplayName = document.getElementById('user-display-name');
  const dropdownName = document.getElementById('dropdown-user-name');
  const dropdownEmail = document.getElementById('dropdown-user-email');

  if (currentUser) {
    if (guestAuthButtons) guestAuthButtons.classList.add('hidden');
    if (profileMenu) profileMenu.classList.remove('hidden');

    if (userDisplayName) userDisplayName.innerText = currentUser.name || 'User';
    if (dropdownName) dropdownName.innerText = currentUser.name || 'User';
    if (dropdownEmail) dropdownEmail.innerText = currentUser.email || '';
    if (userAvatar) {
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0284c7&color=fff`;
      userAvatar.src = currentUser.profilePic || fallbackAvatar;
    }
  } else {
    if (guestAuthButtons) guestAuthButtons.classList.remove('hidden');
    if (profileMenu) profileMenu.classList.add('hidden');
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const profileMenu = document.getElementById('user-profile-menu');
  const dropdown = document.getElementById('user-dropdown');
  if (profileMenu && dropdown && !profileMenu.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

function handleLogout() {
  localStorage.removeItem('eventhub_current_user');
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  checkAuthState();
  window.location.reload();
}

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}

function initSearchAndFilter() {
  const searchInput = document.getElementById('event-search-input');
  const categorySelect = document.getElementById('category-select');
  if (!searchInput && !categorySelect) return;

  const filterCards = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categorySelect ? categorySelect.value : 'all';
    const cards = document.querySelectorAll('[data-category]');

    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const text = card.textContent.toLowerCase();
      const matchesSearch = text.includes(query);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

      if (matchesSearch && matchesCategory) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  if (searchInput) searchInput.addEventListener('input', filterCards);
  if (categorySelect) categorySelect.addEventListener('change', filterCards);
}

function syncBookedSeatsOnLoad() {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (!currentUser || !currentUser.bookings) return;

  currentUser.bookings.forEach(booking => {
    const seatElem = document.getElementById(booking.eventSeatId);
    if (seatElem) {
      const btn = seatElem.closest('[data-category]')?.querySelector('button');
      if (btn) {
        btn.innerText = 'Seat Booked ✓';
        btn.disabled = true;
        btn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
        btn.classList.add('bg-slate-400', 'dark:bg-slate-700', 'cursor-not-allowed');
      }
    }
  });
}

function bookSeat(seatElemId, btnElem) {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (!currentUser) {
    alert('Please log in or register first to book a seat!');
    window.location.href = 'index.html';
    return;
  }

  const seatElem = document.getElementById(seatElemId);
  if (!seatElem) return;

  let currentText = seatElem.innerText;
  let matches = currentText.match(/\d+/);
  if (!matches) return;

  let count = parseInt(matches[0], 10);
  if (count <= 0) {
    alert('Sorry, no seats remaining for this event!');
    return;
  }

  count--;
  const label = currentText.includes('Teams') ? `${count} Teams Left` : `${count} Seats Left`;
  seatElem.innerText = label;

  if (!currentUser.bookings) currentUser.bookings = [];
  currentUser.bookings.push({
    eventSeatId: seatElemId,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem('eventhub_current_user', JSON.stringify(currentUser));

  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
  const uIdx = users.findIndex(u => u.email === currentUser.email);
  if (uIdx !== -1) {
    users[uIdx] = currentUser;
    localStorage.setItem('eventhub_users', JSON.stringify(users));
  }

  if (btnElem) {
    btnElem.innerText = 'Seat Booked ✓';
    btnElem.disabled = true;
    btnElem.classList.remove('bg-brand-600', 'hover:bg-brand-500');
    btnElem.classList.add('bg-slate-400', 'dark:bg-slate-700', 'cursor-not-allowed');
  }
}

function toggleDescription(btn) {
  const p = btn.previousElementSibling;
  if (p.classList.contains('line-clamp-2')) {
    p.classList.remove('line-clamp-2');
    p.classList.add('line-clamp-none');
    btn.innerText = 'Show less';
  } else {
    p.classList.add('line-clamp-2');
    p.classList.remove('line-clamp-none');
    btn.innerText = 'Read more';
  }
}