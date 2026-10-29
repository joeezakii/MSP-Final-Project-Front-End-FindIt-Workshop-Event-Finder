document.addEventListener('DOMContentLoaded', () => {
  // 1. Get the ID from the URL (e.g. event-details.html?id=evt_001)
  const urlParams = new URLSearchParams(window.location.search);
  let eventId = urlParams.get('id');
  
  // Default to evt_001 if loaded without an ID for preview purposes
  if (!eventId) {
    eventId = 'evt_001';
  }

  // 2. Fetch the JSON data
  fetch('events-data.json')
    .then(response => response.json())
    .then(data => {
      
      // 3. Find the matching event or workshop
      let eventData = null;
      if (data.events) {
        eventData = data.events.find(e => e.id === eventId);
      }
      if (!eventData && data.workshops) {
        eventData = data.workshops.find(w => w.id === eventId);
      }
      
      if (eventData) {
        // 4. Update Header Data
        document.getElementById('event-title').textContent = eventData.title;
        
        // Description logic (Short vs Full)
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
        
        // Optional: apply badge color class dynamically based on JSON
        const color = eventData.badge_color || 'emerald';
        badge.className = `px-3 py-1 text-xs font-semibold rounded-lg bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 border border-${color}-500/20 mb-4 inline-block`;
        
        document.getElementById('event-datetime').textContent = `${eventData.date} • ${eventData.time}`;
        document.getElementById('event-location').textContent = eventData.location;
        
        const seatsEl = document.getElementById('event-seats');
        seatsEl.textContent = eventData.available_seats;
        if(eventData.available_seats === 0) {
          seatsEl.className = "text-3xl font-extrabold text-rose-600 dark:text-rose-400";
        }

        // 5. Build Speakers Carousel
        const speakersContainer = document.getElementById('speakers-container');
        speakersContainer.innerHTML = ''; // Clear loading state
        
        if (eventData.speakers && eventData.speakers.length > 0) {
          eventData.speakers.forEach(speaker => {
            speakersContainer.innerHTML += `
              <div class="snap-start shrink-0 w-64 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center hover:border-brand-500/50 transition">
                <img src="${speaker.image}" alt="${speaker.name}" class="w-24 h-24 rounded-2xl object-cover mb-4 shadow-md" />
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">${speaker.name}</h3>
                <p class="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">${speaker.role}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-3">${speaker.bio}</p>
              </div>
            `;
          });
          
          // 6. Carousel Auto-Scroll Logic
          let autoScrollInterval;
          const cardWidth = 256 + 24; // w-64 (256px) + gap-6 (24px)
          
          function startAutoScroll() {
              autoScrollInterval = setInterval(() => {
                  if (!speakersContainer) return;
                  // Check if reached the end (with a small buffer for precision)
                  if (speakersContainer.scrollLeft + speakersContainer.clientWidth >= speakersContainer.scrollWidth - 5) {
                      // Loop back to beginning
                      speakersContainer.scrollTo({ left: 0, behavior: 'smooth' });
                  } else {
                      speakersContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
                  }
              }, 3000); // 3 seconds timeout
          }
          
          function stopAutoScroll() {
              clearInterval(autoScrollInterval);
          }
          
          // Start automatically
          startAutoScroll();
          
          // Pause when user interacts
          speakersContainer.addEventListener('mouseenter', stopAutoScroll);
          speakersContainer.addEventListener('mouseleave', startAutoScroll);
          speakersContainer.addEventListener('touchstart', stopAutoScroll);
          speakersContainer.addEventListener('touchend', startAutoScroll);
          
          // Manual navigation buttons
          const scrollLeftBtn = document.getElementById('scroll-left');
          const scrollRightBtn = document.getElementById('scroll-right');

          if(scrollLeftBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                speakersContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });
          }
          if(scrollRightBtn) {
            scrollRightBtn.addEventListener('click', () => {
                // If at the end, wrap to start on right click too
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
        // Handle error if ID not found
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