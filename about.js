function toggleBio(bioId, arrowId) {
  const bio = document.getElementById(bioId);
  const arrow = document.getElementById(arrowId);
  
  if (bio) {
    bio.classList.toggle('hidden');
  }
  if (arrow) {
    arrow.classList.toggle('rotate-180');
  }
}

    function toggleFaq(faqId, iconId) {
      const faq = document.getElementById(faqId);
      const icon = document.getElementById(iconId);
      
      faq.classList.toggle('hidden');
      icon.classList.toggle('rotate-180');
    }