document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearchAndFilter();
  syncBookedSeatsOnLoad();
});

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }
}

function bookSeat(seatElementId, btnElement) {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));

  if (!currentUser) {
    alert('Please log in or create an account to book a seat!');
    window.location.href = 'index.html'; 
    return;
  }

  const card = btnElement.closest('div[data-category]');
  if (!card) return;

  const eventTitle = card.querySelector('h2').innerText;
  const eventCategory = card.getAttribute('data-category');
  const eventDescription = card.querySelector('p').innerText;

  const detailsList = card.querySelectorAll('.space-y-2 span');
  const eventDate = detailsList[0] ? detailsList[0].innerText : '';
  const eventLocation = detailsList[1] ? detailsList[1].innerText : '';

  const bookingId = 'EVT-' + Math.floor(1000 + Math.random() * 9000);

  const newBooking = {
    id: bookingId,
    title: eventTitle,
    category: eventCategory,
    description: eventDescription,
    date: eventDate,
    location: eventLocation,
    seatElementId: seatElementId
  };

  if (!currentUser.bookings) {
    currentUser.bookings = [];
  }

  const alreadyBooked = currentUser.bookings.some(b => b.title === eventTitle);
  if (alreadyBooked) {
    alert('You have already booked a seat for this event!');
    return;
  }

  const seatBadge = document.getElementById(seatElementId);
  let currentSeats = parseInt(seatBadge.innerText);

  if (currentSeats > 0) {
    currentSeats--;
    seatBadge.innerText = `${currentSeats} Seats Left`;

    saveSeatCountToStorage(seatElementId, currentSeats);

    currentUser.bookings.push(newBooking);
    localStorage.setItem('eventhub_current_user', JSON.stringify(currentUser));

    let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex].bookings = currentUser.bookings;
      localStorage.setItem('eventhub_users', JSON.stringify(users));
    }

    setButtonToBookedState(btnElement);

    if (currentSeats === 0) {
      setBadgeToSoldOutState(seatBadge);
    }
  }
}

function syncBookedSeatsOnLoad() {
  const savedSeats = JSON.parse(localStorage.getItem('eventhub_seat_counts') || '{}');
  Object.keys(savedSeats).forEach(seatId => {
    const seatBadge = document.getElementById(seatId);
    if (seatBadge) {
      const count = savedSeats[seatId];
      seatBadge.innerText = `${count} Seats Left`;
      if (count === 0) {
        setBadgeToSoldOutState(seatBadge);
      }
    }
  });

  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (!currentUser || !currentUser.bookings) return;

  currentUser.bookings.forEach(booking => {
    if (booking.seatElementId) {
      const seatBadge = document.getElementById(booking.seatElementId);
      if (seatBadge) {
        const btn = seatBadge.closest('.p-6').nextElementSibling.querySelector('button');
        if (btn) {
          setButtonToBookedState(btn);
        }
      }
    }
  });
}

function saveSeatCountToStorage(seatId, count) {
  let savedSeats = JSON.parse(localStorage.getItem('eventhub_seat_counts') || '{}');
  savedSeats[seatId] = count;
  localStorage.setItem('eventhub_seat_counts', JSON.stringify(savedSeats));
}

function setButtonToBookedState(btn) {
  btn.innerText = 'Booked ✓';
  btn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
  btn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
  btn.disabled = true;
}

function setBadgeToSoldOutState(badge) {
  badge.innerText = '0 Seats Left';
  badge.classList.remove('text-emerald-600', 'bg-emerald-500/10', 'border-emerald-500/20', 'dark:text-emerald-400');
  badge.classList.add('text-rose-600', 'bg-rose-500/10', 'border-rose-500/20', 'dark:text-rose-400');
}

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