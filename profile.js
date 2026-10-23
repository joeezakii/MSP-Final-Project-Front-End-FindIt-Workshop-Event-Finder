document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
});

function loadUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('user-name-heading').innerText = currentUser.name || 'Student';
  document.getElementById('user-email-text').innerText = currentUser.email || '';
  document.getElementById('user-avatar').innerText = (currentUser.name || 'S').charAt(0).toUpperCase();

  const userBookings = currentUser.bookings || [];
  document.getElementById('booking-count-badge').innerText = `${userBookings.length} Events Registered`;

  const container = document.getElementById('bookings-container');
  const emptyView = document.getElementById('no-bookings-view');

  if (userBookings.length === 0) {
    container.classList.add('hidden');
    emptyView.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  emptyView.classList.add('hidden');
  container.innerHTML = '';

  userBookings.forEach((booking, index) => {
    const ticketCard = document.createElement('div');
    ticketCard.className = 'flex flex-col md:flex-row bg-white border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-lg transition duration-300';
    
    const qrContainerId = `qrcode-${index}`;

    ticketCard.innerHTML = `
      <div class="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-500 border border-brand-500/20">
              ${booking.category || 'Workshop'}
            </span>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Confirmed Pass ✓
            </span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">${booking.title}</h3>
          <p class="text-slate-600 dark:text-slate-400 text-xs mb-4">${booking.description}</p>
        </div>

        <div class="space-y-2 border-t border-slate-200 dark:border-slate-700/50 pt-4 text-xs text-slate-600 dark:text-slate-300 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>${booking.date}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>${booking.location}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 border-t border-slate-200 dark:border-slate-700/50 pt-4">
          <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-semibold rounded-xl transition">
            Print Pass 🖨️
          </button>
          <button onclick="cancelBooking('${booking.id}')" class="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition">
            Cancel Booking
          </button>
        </div>
      </div>

      <div class="bg-slate-100 dark:bg-slate-900/60 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/50 min-w-[180px]">
        <div id="${qrContainerId}" class="p-2 bg-white rounded-xl shadow"></div>
        <span class="text-[10px] uppercase font-mono text-slate-400 mt-2 tracking-widest">TICKET #${booking.id}</span>
      </div>
    `;

    container.appendChild(ticketCard);

    setTimeout(() => {
      new QRCode(document.getElementById(qrContainerId), {
        text: `EVENTHUB-TICKET-${booking.id}-${currentUser.email}`,
        width: 100,
        height: 100
      });
    }, 100);
  });
}

function cancelBooking(bookingId) {
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');

  currentUser.bookings = currentUser.bookings.filter(b => b.id !== bookingId);

  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex].bookings = currentUser.bookings;
  }

  localStorage.setItem('eventhub_current_user', JSON.stringify(currentUser));
  localStorage.setItem('eventhub_users', JSON.stringify(users));

  loadUserProfile();
}

function handleLogout() {
  localStorage.removeItem('eventhub_current_user');
  window.location.href = 'login.html';
}