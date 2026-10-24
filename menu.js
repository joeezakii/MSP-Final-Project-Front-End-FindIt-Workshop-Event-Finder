(function sanitizeStoredBookings() {
  try {
    let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
    if (currentUser && currentUser.bookings && Array.isArray(currentUser.bookings)) {
      currentUser.bookings = currentUser.bookings.filter(b => b && b.title && b.title !== 'undefined');
      localStorage.setItem('eventhub_current_user', JSON.stringify(currentUser));
    }

    let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
    if (Array.isArray(users) && users.length > 0) {
      let updated = false;
      users = users.map(u => {
        if (u.bookings && Array.isArray(u.bookings)) {
          const originalLen = u.bookings.length;
          u.bookings = u.bookings.filter(b => b && b.title && b.title !== 'undefined');
          if (u.bookings.length !== originalLen) updated = true;
        }
        return u;
      });
      if (updated) {
        localStorage.setItem('eventhub_users', JSON.stringify(users));
      }
    }
  } catch (err) {
    console.error('Sanitizer error:', err);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearchAndFilter();
  syncBookedSeatsOnLoad();
  checkAuthState();
  initBookingListeners();
});

function initBookingListeners() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.book-seat-btn') || e.target.closest('button[data-seat-id]');
    if (btn) {
      const seatId = btn.getAttribute('data-seat-id');
      bookSeat(seatId, btn);
    }
  });
}

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
    let card = null;
    if (booking.eventSeatId) {
      const seatElem = document.getElementById(booking.eventSeatId);
      if (seatElem) card = seatElem.closest('[data-category]');
    }

    if (!card && booking.title) {
      const headings = document.querySelectorAll('[data-category] h2');
      headings.forEach(h2 => {
        if (h2.innerText.trim() === booking.title) {
          card = h2.closest('[data-category]');
        }
      });
    }

    if (card) {
      const bookBtn = card.querySelector('.p-4 button') || card.querySelector('.book-seat-btn');
      if (bookBtn) {
        bookBtn.innerText = 'Seat Booked ✓';
        bookBtn.disabled = true;
        bookBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
        bookBtn.classList.add('bg-slate-400', 'dark:bg-slate-700', 'cursor-not-allowed');
      }
    }
  });
}

function bookSeat(seatElemId, btnElem) {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (!currentUser) {
    showToastMessage('Please log in or register first to book a seat!', true);
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    return;
  }

  if (!currentUser.bookings) currentUser.bookings = [];

  const seatElem = seatElemId ? document.getElementById(seatElemId) : null;
  const card = seatElem ? seatElem.closest('[data-category]') : (btnElem ? btnElem.closest('[data-category]') : null);

  let eventTitle = 'Unknown Event';
  let eventDate = 'TBD';
  let eventLocation = 'TBD';
  let eventCategory = 'Workshop';
  let eventType = 'Workshop';

  if (card) {
    const h2 = card.querySelector('h2');
    if (h2) eventTitle = h2.innerText.trim();

    const spans = card.querySelectorAll('.space-y-2 span');
    if (spans.length >= 1) eventDate = spans[0].innerText.trim();
    if (spans.length >= 2) eventLocation = spans[1].innerText.trim();
    
    eventCategory = card.getAttribute('data-category') || 'Workshop';
    
    const badge = card.querySelector('span[class*="px-2.5"]');
    if (badge) eventType = badge.innerText.trim();
  }

  const alreadyBooked = currentUser.bookings.some(b => (seatElemId && b.eventSeatId === seatElemId) || (b.title && b.title === eventTitle));
  if (alreadyBooked) {
    showToastMessage("You've already booked a place in the event.", true);
    return;
  }

  if (seatElem) {
    let currentText = seatElem.innerText;
    let matches = currentText.match(/\d+/);
    if (matches) {
      let count = parseInt(matches[0], 10);
      if (count <= 0) {
        showToastMessage('Sorry, no seats remaining for this event!', true);
        return;
      }
      count--;
      const label = currentText.includes('Teams') ? `${count} Teams Left` : `${count} Seats Left`;
      seatElem.innerText = label;
    }
  }

  currentUser.bookings.push({
    eventSeatId: seatElemId,
    title: eventTitle,
    date: eventDate,
    location: eventLocation,
    category: eventCategory,
    type: eventType,
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

  showToastMessage('Seat successfully booked!', false);
}

function showToastMessage(message, isError = true) {
  let toast = document.getElementById('custom-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-toast-notification';
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 border';
    document.body.appendChild(toast);
  }

  if (isError) {
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 bg-slate-900/90 text-amber-400 border-amber-500/30 backdrop-blur-md text-sm font-semibold';
    toast.innerHTML = `
      <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>${message}</span>
    `;
  } else {
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 bg-slate-900/90 text-emerald-400 border-emerald-500/30 backdrop-blur-md text-sm font-semibold';
    toast.innerHTML = `
      <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>${message}</span>
    `;
  }

  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
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