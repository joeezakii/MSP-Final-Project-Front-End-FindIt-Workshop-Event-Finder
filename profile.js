document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
});

function getCategoryBadgeStyle(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('business') || c.includes('pr')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (c.includes('ai') || c.includes('artificial')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
  if (c.includes('hackathon')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  if (c.includes('presentation') || c.includes('softskills')) return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
  if (c.includes('fintech')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  if (c.includes('healthcare')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  return 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20';
}

function loadUserProfile() {
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));

  currentUser = currentUser || { 
    name: 'Student User', 
    email: 'student@fcai.cu.edu.eg', 
    year: 'Freshman', 
    gender: 'Male', 
    bookings: [] 
  };

  const nameElem = document.getElementById('profile-banner-name');
  if (nameElem) nameElem.innerText = currentUser.name || 'Student';

  const metaElem = document.getElementById('profile-banner-meta');
  if (metaElem) metaElem.innerText = `${currentUser.email || ''} • ${currentUser.year || 'Student'} • ${currentUser.gender || ''}`;

  const avatarBanner = document.getElementById('profile-banner-avatar');
  if (avatarBanner) {
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0284c7&color=fff`;
    avatarBanner.src = currentUser.profilePic || fallback;
  }

  const userBookings = currentUser.bookings || [];
  const countBadge = document.getElementById('booking-count-badge');
  if (countBadge) countBadge.innerText = `${userBookings.length} Events Registered`;

  const container = document.getElementById('bookings-container');
  if (!container) return;

  if (userBookings.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/60 p-8 shadow-sm">
        <svg class="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">No registered events yet</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Browse upcoming campus events and workshops to secure your seats.</p>
        <a href="home.html" class="inline-flex px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition shadow-md">Browse Events</a>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  userBookings.forEach((booking, index) => {
    const ticketCard = document.createElement('div');
    ticketCard.className = 'flex flex-col md:flex-row bg-white border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-lg transition duration-300';
    
    const qrContainerId = `qrcode-${index}`;
    const badgeStyle = getCategoryBadgeStyle(booking.category || booking.type);
    const displayCategory = booking.type || booking.category || 'Workshop';
    const ticketId = booking.eventSeatId || `TKT-${index + 100}`;

    ticketCard.innerHTML = `
      <div class="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-lg border ${badgeStyle}">
              ${displayCategory}
            </span>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Confirmed Pass ✓
            </span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">${booking.title}</h3>
          <p class="text-slate-600 dark:text-slate-400 text-xs mb-4">${booking.description || ''}</p>
        </div>

        <div class="space-y-2 border-t border-slate-200 dark:border-slate-700/50 pt-4 text-xs text-slate-600 dark:text-slate-300 mb-4">
          <div class="flex items-center gap-2">
            <span>📅 ${booking.date}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>📍 ${booking.location}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 border-t border-slate-200 dark:border-slate-700/50 pt-4">
          <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-semibold rounded-xl transition">
            Print Pass 🖨️
          </button>
          <button onclick="cancelBooking('${booking.eventSeatId}')" class="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition">
            Cancel Booking
          </button>
        </div>
      </div>

      <div class="bg-slate-100 dark:bg-slate-900/60 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/50 min-w-[180px]">
        <div id="${qrContainerId}" class="p-2 bg-white rounded-xl shadow"></div>
        <span class="text-[10px] uppercase font-mono text-slate-400 mt-2 tracking-widest">TICKET #${index + 1001}</span>
      </div>
    `;

    container.appendChild(ticketCard);

    setTimeout(() => {
      const qrEl = document.getElementById(qrContainerId);
      if (qrEl && typeof QRCode !== 'undefined') {
        new QRCode(qrEl, {
          text: `FINDIT-TICKET-${ticketId}-${currentUser.email}`,
          width: 90,
          height: 90
        });
      }
    }, 100);
  });
}

function cancelBooking(seatId) {
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');

  if (!currentUser || !currentUser.bookings) return;

  currentUser.bookings = currentUser.bookings.filter(b => b.eventSeatId !== seatId);

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
  window.location.href = 'index.html';
}