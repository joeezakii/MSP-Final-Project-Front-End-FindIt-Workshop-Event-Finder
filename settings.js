document.addEventListener('DOMContentLoaded', () => {
  loadSettingsData();
});

let uploadedAvatarBase64 = '';

function loadSettingsData() {
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  
  
  currentUser = currentUser || { name: 'Guest User', email: 'guest@fcai.cu.edu.eg', year: 'Freshman', tracks: [] };

  const nameInput = document.getElementById('settings-name');
  if (nameInput) nameInput.value = currentUser.name || '';

  const emailInput = document.getElementById('settings-email');
  if (emailInput) emailInput.value = currentUser.email || '';

  const dobInput = document.getElementById('settings-dob');
  if (dobInput) dobInput.value = currentUser.dob || '';

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

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    uploadedAvatarBase64 = event.target.result;
    const avatarImg = document.getElementById('avatar-preview');
    const avatarFallback = document.getElementById('avatar-fallback');

    if (avatarImg && avatarFallback) {
      avatarImg.src = uploadedAvatarBase64;
      avatarImg.classList.remove('hidden');
      avatarFallback.classList.add('hidden');
    }
  };
  reader.readAsDataURL(file);
}

function saveProfileSettings(e) {
  e.preventDefault();
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user')) || { email: 'guest@fcai.cu.edu.eg' };
  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');

  const nameEl = document.getElementById('settings-name');
  if (nameEl) currentUser.name = nameEl.value.trim();

  const dobEl = document.getElementById('settings-dob');
  if (dobEl) currentUser.dob = dobEl.value;

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

function saveNotificationSettings() {
  const remindersEl = document.getElementById('notify-reminders');
  const alertsEl = document.getElementById('notify-alerts');
  const seatsEl = document.getElementById('notify-seats');

  const preferences = {
    reminders: remindersEl ? remindersEl.checked : true,
    alerts: alertsEl ? alertsEl.checked : true,
    seats: seatsEl ? seatsEl.checked : false
  };

  localStorage.setItem('eventhub_notifications', JSON.stringify(preferences));
  showSettingsAlert('Notification preferences saved.');
}

function showSettingsAlert(msg) {
  const alertBox = document.getElementById('settings-alert');
  if (!alertBox) return;

  alertBox.innerText = msg;
  alertBox.className = 'mb-6 p-4 rounded-2xl text-sm font-medium text-center bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 transition';
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 3000);
}