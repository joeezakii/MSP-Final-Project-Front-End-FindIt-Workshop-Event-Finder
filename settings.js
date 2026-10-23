document.addEventListener('DOMContentLoaded', () => {
  loadSettingsData();
});

let uploadedAvatarBase64 = '';

function loadSettingsData() {
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  
 
  currentUser = currentUser || { name: 'Guest User', email: 'guest@fci.**.edu.eg', year: 'Freshman', tracks: [] };

  const nameInput = document.getElementById('settings-name');
  if (nameInput) nameInput.value = currentUser.name || '';

  const emailInput = document.getElementById('settings-email');
  if (emailInput) emailInput.value = currentUser.email || '';

  const dobInput = document.getElementById('settings-dob');
  if (dobInput) {
    dobInput.value = currentUser.dob || '';
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const yyyy = maxDate.getFullYear();
    const mm = String(maxDate.getMonth() + 1).padStart(2, '0');
    const dd = String(maxDate.getDate()).padStart(2, '0');
    dobInput.max = `${yyyy}-${mm}-${dd}`;
  }

  const genderSelect = document.getElementById('settings-gender');
  if (genderSelect) genderSelect.value = currentUser.gender || 'Male';

  const yearSelect = document.getElementById('settings-year');
  if (yearSelect) yearSelect.value = currentUser.year || 'Freshman';

  const avatarImg = document.getElementById('avatar-preview');
  const avatarFallback = document.getElementById('avatar-fallback');

  if (currentUser.profilePic && avatarImg && avatarFallback) {
    avatarImg.src = currentUser.profilePic;
    avatarImg.classList.remove('hidden');
    avatarFallback.classList.add('hidden');
    uploadedAvatarBase64 = currentUser.profilePic;
  } else if (avatarFallback) {
    avatarFallback.innerText = (currentUser.name || 'U').charAt(0).toUpperCase();
  }

  const userTracks = currentUser.tracks || [];
  document.querySelectorAll('.settings-track').forEach(checkbox => {
    checkbox.checked = userTracks.includes(checkbox.value);
  });

  const settings = JSON.parse(localStorage.getItem('eventhub_notifications') || '{}');
  const remindersEl = document.getElementById('notify-reminders');
  if (remindersEl && settings.reminders !== undefined) remindersEl.checked = settings.reminders;

  const alertsEl = document.getElementById('notify-alerts');
  if (alertsEl && settings.alerts !== undefined) alertsEl.checked = settings.alerts;

  const seatsEl = document.getElementById('notify-seats');
  if (seatsEl && settings.seats !== undefined) seatsEl.checked = settings.seats;
}

function saveProfileSettings(e) {
  e.preventDefault();
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user')) || { email: 'guest@fcai.cu.edu.eg' };
  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');

  const nameEl = document.getElementById('settings-name');
  if (nameEl) currentUser.name = nameEl.value.trim();

  const dobEl = document.getElementById('settings-dob');
  if (dobEl && dobEl.value) {
    const birthDate = new Date(dobEl.value);
    const today = new Date();

    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--;
    }

    if (birthDate >= today || ageYears < 1) {
      showSettingsAlert('Date of birth cannot be within the current day, week, month, or year.', true);
      return;
    }
    currentUser.dob = dobEl.value;
  }

  const genderEl = document.getElementById('settings-gender');
  if (genderEl) currentUser.gender = genderEl.value;

  const yearEl = document.getElementById('settings-year');
  if (yearEl) currentUser.year = yearEl.value;

  if (uploadedAvatarBase64) currentUser.profilePic = uploadedAvatarBase64;

  const trackNodes = document.querySelectorAll('.settings-track:checked');
  if (trackNodes.length > 0) {
    currentUser.tracks = Array.from(trackNodes).map(node => node.value);
  }

  const passwordEl = document.getElementById('settings-password');
  if (passwordEl && passwordEl.value.length >= 6) {
    currentUser.password = passwordEl.value;
  }

  const index = users.findIndex(u => u.email === currentUser.email);
  if (index !== -1) {
    users[index] = currentUser;
  }

  localStorage.setItem('eventhub_current_user', JSON.stringify(currentUser));
  localStorage.setItem('eventhub_users', JSON.stringify(users));

  showSettingsAlert('Profile settings updated successfully!');
}

function showSettingsAlert(msg, isError = false) {
  const alertBox = document.getElementById('settings-alert');
  if (!alertBox) return;

  alertBox.innerText = msg;
  if (isError) {
    alertBox.className = 'mb-6 p-4 rounded-2xl text-sm font-medium text-center bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400 transition';
  } else {
    alertBox.className = 'mb-6 p-4 rounded-2xl text-sm font-medium text-center bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 transition';
  }
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 3500);
}

function deleteAccount() {
  const confirmed = confirm("Are you sure you want to permanently delete your account? All your booked tickets and profile settings will be erased.");
  if (!confirmed) return;

  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (currentUser) {
    let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
    users = users.filter(u => u.email !== currentUser.email);
    localStorage.setItem('eventhub_users', JSON.stringify(users));
  }

  localStorage.removeItem('eventhub_current_user');
  localStorage.removeItem('eventhub_notifications');

  showSettingsAlert('Your account has been deleted. Redirecting...', true);

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
}