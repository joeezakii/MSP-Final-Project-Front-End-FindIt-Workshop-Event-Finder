document.addEventListener('DOMContentLoaded', () => {
      renderUserProfilePasses();
    });

    function getCategoryFormatting(cat) {
      if (!cat) return { label: 'General', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
      const c = cat.toLowerCase().trim();
      if (c === 'ai' || c === 'ai & ml' || c === 'ai tech talk') {
        return { label: 'AI', cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      }
      if (c === 'hackathon') {
        return { label: 'Hackathon', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      }
      if (c === 'business' || c === 'business & pr') {
        return { label: 'Business & PR', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      }
      if (c === 'cyber' || c === 'cybersecurity' || c === 'networks' || c === 'network security') {
        return { label: 'Networks/Cybersecurity', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      }
      if (c === 'web' || c === 'web dev') {
        return { label: 'Web Development', cls: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20' };
      }
      if (c === 'softskills' || c === 'presentation skills') {
        return { label: 'Presentation Skills', cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' };
      }
      if (c === 'fintech' || c === 'Fintech') {
        return { label: 'Fintech', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
      }
      if (c === 'healthcare' || c === 'Healthcare') {
        return { label: 'Healthcare', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      }
      return { label: cat, cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
    }

    function renderUserProfilePasses() {
      const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
      const container = document.getElementById('bookings-container');
      const countBadge = document.getElementById('booking-count-badge');
      const nameElem = document.getElementById('profile-banner-name');
      const metaElem = document.getElementById('profile-banner-meta');
      const avatarElem = document.getElementById('profile-banner-avatar');

      if (!currentUser) {
        if (nameElem) nameElem.innerText = 'Guest User';
        if (avatarElem) avatarElem.src = 'https://ui-avatars.com/api/?name=Guest&background=0284c7&color=fff';
        if (container) {
          container.innerHTML = `
            <div class="p-8 text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-3xl">
              <p class="text-slate-600 dark:text-slate-400 text-sm">Please log in to view your registered events and digital passes.</p>
              <a href="index.html" class="inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition shadow-md">Log In Now</a>
            </div>
          `;
        }
        return;
      }

      if (nameElem) nameElem.innerText = currentUser.name || 'User';
      if (metaElem) metaElem.innerText = `${currentUser.email || ''} • ${currentUser.year || 'Sophomore'} • Male`;
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0284c7&color=fff`;
      if (avatarElem) avatarElem.src = currentUser.profilePic || fallbackAvatar;

      const bookings = currentUser.bookings || [];
      if (countBadge) countBadge.innerText = `${bookings.length} Events Registered`;

      if (bookings.length === 0) {
        if (container) {
          container.innerHTML = `
            <div class="p-8 text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
              <svg class="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="text-slate-600 dark:text-slate-400 text-sm font-medium">You haven't booked any workshops or events yet.</p>
              <div class="flex items-center justify-center gap-3 mt-4">
                <a href="home.html" class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition shadow-md">Browse Events</a>
                <a href="workshops.html" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition">Browse Workshops</a>
              </div>
            </div>
          `;
        }
        return;
      }

      container.innerHTML = bookings.map((b, idx) => {
        const catInfo = getCategoryFormatting(b.category);
        const ticketId = b.eventSeatId ? b.eventSeatId.replace('seats-', '').toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000) : 'PASS-' + (idx + 100);
        const isOnline = b.location && b.location.toLowerCase().includes('online');
        const locationIcon = isOnline 
          ? `<svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
          : `<svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>`;

        return `
          <div class="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-lg flex flex-col lg:flex-row justify-between transition hover:border-slate-400 dark:hover:border-slate-500">
            <div class="p-6 sm:p-8 flex-grow flex flex-col justify-between space-y-6">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-3 py-1 text-xs font-semibold rounded-xl border ${catInfo.cls}">
                    ${catInfo.label}
                  </span>
                  <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 dark:text-emerald-400">
                    Confirmed Pass ✓
                  </span>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${b.title || 'Event Pass'}</h3>
                <p class="text-xs text-slate-400 font-mono">TICKET #${ticketId}</p>
              </div>

              <div class="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span>${b.date || 'TBD'}</span>
                </div>
                <div class="flex items-center gap-2.5">
                  ${locationIcon}
                  <span>${b.location || 'TBD'}</span>
                </div>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <button type="button" onclick="alert('Digital pass ready for download!')" class="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition shadow-md">Print Pass 🖨️</button>
                <button type="button" onclick="cancelBooking('${b.eventSeatId || ''}', '${b.title || ''}')" class="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-white bg-rose-500/10 hover:bg-rose-600 transition border border-rose-500/20">Cancel Booking</button>
              </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-900/60 p-6 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700/60 gap-3 min-w-[220px]">
              <div class="w-32 h-32 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center">
                <svg class="w-full h-full text-slate-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3m2 2v4h4V5H5m8-2h8v8h-8V3m2 2v4h4V5h-4M3 13h8v8H3v-8m2 2v4h4v-4H5m13-2h3v3h-3v-3m0 5h3v3h-3v-3m-5-5h3v3h-3v-3m0 5h3v3h-3v-3m5 5h3v3h-3v-3m-5 0h3v3h-3v-3z"/>
                </svg>
              </div>
              <p class="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">SCAN AT ENTRANCE</p>
            </div>
          </div>
        `;
      }).join('');
    }

    function cancelBooking(seatId, title) {
      if (!confirm('Are you sure you want to cancel this booking?')) return;
      let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
      if (!currentUser || !currentUser.bookings) return;

      currentUser.bookings = currentUser.bookings.filter(b => b.eventSeatId !== seatId && b.title !== title);
      localStorage.setItem('eventhub_current_user', JSON.stringify(currentUser));

      let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
      const uIdx = users.findIndex(u => u.email === currentUser.email);
      if (uIdx !== -1) {
        users[uIdx] = currentUser;
        localStorage.setItem('eventhub_users', JSON.stringify(users));
      }

      renderUserProfilePasses();
    }