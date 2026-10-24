document.addEventListener('DOMContentLoaded', () => {
  loadSettingsData();
});

let uploadedAvatarBase64 = '';

function loadSettingsData() {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (!currentUser) {
    currentUser = currentUser || { name: 'Guest User', email: 'guest@fcai.cu.edu.eg', year: 'Freshman', tracks: [] };
  }

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
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (!currentUser) return;

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

function downloadUserData() {
  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user')) || {
    name: 'Guest User',
    email: 'guest@fcai.cu.edu.eg',
    year: 'Freshman',
    tracks: [],
    bookings: []
  };

  const notificationSettings = JSON.parse(localStorage.getItem('eventhub_notifications') || '{}');

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: currentUser.name || 'Guest User',
      email: currentUser.email || 'guest@fcai.cu.edu.eg',
      dob: currentUser.dob || 'Not provided',
      gender: currentUser.gender || 'Not specified',
      academicYear: currentUser.year || 'Freshman',
      tracks: currentUser.tracks || [],
      profilePic: currentUser.profilePic ? 'Base64 Encoded Image Included' : 'None'
    },
    notifications: notificationSettings,
    bookingHistory: currentUser.bookings || []
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const sanitizeName = (currentUser.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadAnchor.setAttribute("download", `findit_${sanitizeName}_data.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showSettingsAlert('Your profile and booking history JSON has been downloaded!');
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

function switchSettingsTab(tabName) {
  const profileSection = document.getElementById('profile-section');
  const notifSection = document.getElementById('notifications-section');
  const dangerSection = document.getElementById('danger-section');
  
  const profileBtn = document.getElementById('tab-profile-btn');
  const notifBtn = document.getElementById('tab-notifications-btn');
  
  const activeClasses = 'bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700/60 text-brand-600 dark:text-brand-400 shadow-sm'.split(' ');
  const inactiveClasses = 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/50 border-transparent'.split(' ');
  
  if (tabName === 'profile') {
    profileSection.classList.remove('hidden');
    dangerSection.classList.remove('hidden');
    notifSection.classList.add('hidden');
    
    profileBtn.classList.remove(...inactiveClasses);
    profileBtn.classList.add(...activeClasses);
    
    notifBtn.classList.remove(...activeClasses);
    notifBtn.classList.add(...inactiveClasses);
  } else if (tabName === 'notifications') {
    notifSection.classList.remove('hidden');
    profileSection.classList.add('hidden');
    dangerSection.classList.add('hidden');
    
    notifBtn.classList.remove(...inactiveClasses);
    notifBtn.classList.add(...activeClasses);
    
    profileBtn.classList.remove(...activeClasses);
    profileBtn.classList.add(...inactiveClasses);
  }
}