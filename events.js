document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  let eventId = urlParams.get('id');
  
  if (!eventId) {
    eventId = 'evt_001';
  }

  fetch('events-data.json')
    .then(response => response.json())
    .then(data => {
      let eventData = null;
      if (data.events) {
        eventData = data.events.find(e => e.id === eventId);
      }
      if (!eventData && data.workshops) {
        eventData = data.workshops.find(w => w.id === eventId);
      }
      
      if (eventData) {
        const seatId = eventId.startsWith('evt_') 
          ? `seats-event-${parseInt(eventId.replace('evt_0', '').replace('evt_', ''))}`
          : `seats-ws-${parseInt(eventId.replace('ws_0', '').replace('ws_', ''))}`;

        const seatsEl = document.getElementById('event-seats');
        if (seatsEl) {
          seatsEl.id = seatId;
        }

        const bookBtn = document.getElementById('book-details-btn');
        if (bookBtn) {
          bookBtn.setAttribute('data-seat-id', seatId);
        }

        const seatCounts = JSON.parse(localStorage.getItem('eventhub_seat_counts') || '{}');
        const availableSeats = seatCounts.hasOwnProperty(seatId) ? seatCounts[seatId] : eventData.available_seats;

        if (seatsEl) {
          seatsEl.textContent = availableSeats;
          if (availableSeats <= 0) {
            seatsEl.className = "text-3xl font-extrabold text-rose-600 dark:text-rose-400";
          }
        }

        document.getElementById('event-title').textContent = eventData.title;
        
        const fullDesc = eventData.full_description || "";
        const shortDesc = eventData.short_description || (fullDesc.length > 100 ? fullDesc.substring(0, 100) + '...' : fullDesc);
        
        const descEl = document.getElementById('event-description');
        const showMoreBtn = document.getElementById('show-more-btn');
        
        if (fullDesc.length > shortDesc.length) {
          descEl.textContent = shortDesc;
          showMoreBtn.classList.remove('hidden');
          
          showMoreBtn.addEventListener('click', function() {
            if (this.textContent === 'Show more') {
              descEl.textContent = fullDesc;
              this.textContent = 'Show less';
            } else {
              descEl.textContent = shortDesc;
              this.textContent = 'Show more';
            }
          });
        } else {
          descEl.textContent = fullDesc;
        }
        
        const badge = document.getElementById('event-category-badge');
        badge.textContent = eventData.category.toUpperCase();
        
        const color = eventData.badge_color || 'emerald';
        badge.className = `px-3 py-1 text-xs font-semibold rounded-lg bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 border border-${color}-500/20 mb-4 inline-block`;
        
        document.getElementById('event-datetime').textContent = `${eventData.date} • ${eventData.time}`;
        document.getElementById('event-location').textContent = eventData.location;

        if (window.syncSeatCountsAndState) {
          window.syncSeatCountsAndState();
        }

        const speakersContainer = document.getElementById('speakers-container');
        speakersContainer.innerHTML = '';
        
        if (eventData.speakers && eventData.speakers.length > 0) {
          eventData.speakers.forEach(speaker => {
            const bioText = speaker.bio || "";
            const hasLongBio = bioText.length > 70;
            
            speakersContainer.innerHTML += `
              <div class="snap-start shrink-0 w-64 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center hover:border-brand-500/50 transition">
                <img src="${speaker.image}" alt="${speaker.name}" class="w-24 h-24 rounded-2xl object-cover mb-4 shadow-md" />
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">${speaker.name}</h3>
                <p class="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">${speaker.role}</p>
                <div class="mt-3 text-xs text-slate-500 dark:text-slate-400 w-full">
                  <p class="speaker-bio-text ${hasLongBio ? 'line-clamp-3' : ''}">${bioText}</p>
                  ${hasLongBio ? '<button type="button" onclick="toggleSpeakerBio(this)" class="text-brand-600 hover:text-brand-500 dark:text-brand-400 font-semibold mt-1 focus:outline-none transition-colors duration-200">Read more</button>' : ''}
                </div>
              </div>
            `;
          });
          
          let autoScrollInterval;
          const cardWidth = 256 + 24;
          
          function startAutoScroll() {
              autoScrollInterval = setInterval(() => {
                  if (!speakersContainer) return;
                  if (speakersContainer.scrollLeft + speakersContainer.clientWidth >= speakersContainer.scrollWidth - 5) {
                      speakersContainer.scrollTo({ left: 0, behavior: 'smooth' });
                  } else {
                      speakersContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
                  }
              }, 3000);
          }
          
          function stopAutoScroll() {
              clearInterval(autoScrollInterval);
          }
          
          startAutoScroll();
          
          speakersContainer.addEventListener('mouseenter', stopAutoScroll);
          speakersContainer.addEventListener('mouseleave', startAutoScroll);
          speakersContainer.addEventListener('touchstart', stopAutoScroll);
          speakersContainer.addEventListener('touchend', startAutoScroll);
          
          const scrollLeftBtn = document.getElementById('scroll-left');
          const scrollRightBtn = document.getElementById('scroll-right');

          if(scrollLeftBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                speakersContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });
          }
          if(scrollRightBtn) {
            scrollRightBtn.addEventListener('click', () => {
                if (speakersContainer.scrollLeft + speakersContainer.clientWidth >= speakersContainer.scrollWidth - 5) {
                    speakersContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    speakersContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            });
          }

        } else {
          speakersContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400 italic w-full text-center py-4">No speakers announced yet for this event.</p>';
          const leftBtn = document.getElementById('scroll-left');
          const rightBtn = document.getElementById('scroll-right');
          if(leftBtn) leftBtn.classList.add('hidden');
          if(rightBtn) rightBtn.classList.add('hidden');
        }
      } else {
        const titleEl = document.getElementById('event-title');
        const descEl = document.getElementById('event-description');
        const speakersContainer = document.getElementById('speakers-container');
        
        if(titleEl) titleEl.textContent = "Event Not Found";
        if(descEl) descEl.textContent = "We couldn't find the details for this event or workshop.";
        if(speakersContainer) speakersContainer.innerHTML = '';
      }
    })
    .catch(error => {
      console.error('Error fetching event data:', error);
      const titleEl = document.getElementById('event-title');
      const descEl = document.getElementById('event-description');
      
      if(titleEl) titleEl.textContent = "Data Error";
      if(descEl) descEl.textContent = "There was a problem loading the event data.";
    });
});

window.toggleSpeakerBio = function(button) {
  const container = button.previousElementSibling;
  if (container.classList.contains('line-clamp-3')) {
    container.classList.remove('line-clamp-3');
    button.textContent = 'Read less';
  } else {
    container.classList.add('line-clamp-3');
    button.textContent = 'Read more';
  }
};