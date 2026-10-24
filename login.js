document.addEventListener('DOMContentLoaded', () => {
  setupDobRestrictions();
  checkAuthState();
});

function checkAuthState() {
  const currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  const guestAuthButtons = document.getElementById('guest-auth-buttons');
  const profileMenu = document.getElementById('user-profile-menu');
  const userAvatar = document.getElementById('user-avatar');
  const userDisplayName = document.getElementById('user-display-name');
  const dropdownName = document.getElementById('dropdown-user-name');
  const dropdownEmail = document.getElementById('dropdown-user-email');

  if (currentUser) {
    if (guestAuthButtons) guestAuthButtons.classList.add('hidden');
    if (profileMenu) profileMenu.classList.remove('hidden');

    if (userDisplayName) userDisplayName.innerText = currentUser.name || 'User';
    if (dropdownName) dropdownName.innerText = currentUser.name || 'User';
    if (dropdownEmail) dropdownEmail.innerText = currentUser.email || '';
    if (userAvatar) {
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0284c7&color=fff`;
      userAvatar.src = currentUser.profilePic || fallbackAvatar;
    }
  } else {
    if (guestAuthButtons) guestAuthButtons.classList.remove('hidden');
    if (profileMenu) profileMenu.classList.add('hidden');
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const profileMenu = document.getElementById('user-profile-menu');
  const dropdown = document.getElementById('user-dropdown');
  if (profileMenu && dropdown && !profileMenu.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

function handleLogout() {
  localStorage.removeItem('eventhub_current_user');
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  checkAuthState();
  window.location.reload();
}

function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const registerBtn = document.getElementById('tab-register-btn');
  const alertBanner = document.getElementById('alert-banner');

  alertBanner.classList.add('hidden');

  const activeClasses = 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-900 bg-white dark:text-white dark:bg-slate-800 shadow transition-all duration-200';
  const inactiveClasses = 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-200';

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginBtn.className = activeClasses;
    registerBtn.className = inactiveClasses;
  } else {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerBtn.className = activeClasses;
    loginBtn.className = inactiveClasses;
  }
}

function showAlert(message, isError = false) {
  const banner = document.getElementById('alert-banner');
  banner.innerText = message;
  banner.classList.remove('hidden', 'bg-rose-500/20', 'text-rose-300', 'border-rose-500/30', 'bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/30');

  if (isError) {
    banner.classList.add('bg-rose-500/20', 'text-rose-300', 'border', 'border-rose-500/30');
  } else {
    banner.classList.add('bg-emerald-500/20', 'text-emerald-300', 'border', 'border-emerald-500/30');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  setupDobRestrictions();
});

function setupDobRestrictions() {
  const dobInput = document.getElementById('reg-dob');
  if (dobInput) {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const yyyy = maxDate.getFullYear();
    const mm = String(maxDate.getMonth() + 1).padStart(2, '0');
    const dd = String(maxDate.getDate()).padStart(2, '0');
    dobInput.max = `${yyyy}-${mm}-${dd}`;
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const dob = document.getElementById('reg-dob').value;
  const gender = document.getElementById('reg-gender').value;
  const year = document.getElementById('reg-year').value;
  const password = document.getElementById('reg-password').value;

  if (!dob) {
    showAlert('Please select a valid Date of Birth.', true);
    return;
  }
  const birthDate = new Date(dob);
  const today = new Date();
  
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
  }

  if (birthDate >= today || ageYears < 1) {
    showAlert('Date of birth cannot be within the current day, week, month, or year.', true);
    return;
  }

  const trackNodes = document.querySelectorAll('.track-checkbox:checked');
  const tracks = Array.from(trackNodes).map(node => node.value);


  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');

  if (users.some(u => u.email === email)) {
    showAlert('An account with this email address already exists.', true);
    return;
  }

  const newUser = { 
    id: Date.now(), 
    name, 
    email, 
    dob, 
    gender, 
    year, 
    tracks, 
    password, 
    profilePic: '', 
    bookings: [] 
  };

  users.push(newUser);
  localStorage.setItem('eventhub_users', JSON.stringify(users));
  localStorage.setItem('eventhub_current_user', JSON.stringify(newUser));

  showAlert('Account created successfully! Redirecting...');
  setTimeout(() => {
    window.location.href = 'home.html';
  }, 1000);
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showAlert('Invalid email or password.', true);
    return;
  }

  localStorage.setItem('eventhub_current_user', JSON.stringify(user));
  showAlert('Signed in successfully! Redirecting...');
  setTimeout(() => {
    window.location.href = 'home.html';
  }, 1000);
}

function openForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  const alertBanner = document.getElementById('modal-alert-banner');
  if (alertBanner) alertBanner.classList.add('hidden');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.add('hidden');
}

function handleResetPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const newPassword = document.getElementById('forgot-new-password').value;

  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    showModalAlert('No registered account found with this email address.', true);
    return;
  }

  users[userIndex].password = newPassword;
  localStorage.setItem('eventhub_users', JSON.stringify(users));

  let currentUser = JSON.parse(localStorage.getItem('eventhub_current_user'));
  if (currentUser && currentUser.email === email) {
    currentUser.password = newPassword;
    localStorage.setItem('eventhub_current_user', JSON.stringify(currentUser));
  }

  showModalAlert('Password successfully reset! You can now log in.');

  setTimeout(() => {
    closeForgotPasswordModal();
    switchTab('login');
    const loginEmail = document.getElementById('login-email');
    if (loginEmail) loginEmail.value = email;
  }, 1500);
}

function togglePasswordVisibility(inputId, eyeIconId) {
  const input = document.getElementById(inputId);
  const eyeIcon = document.getElementById(eyeIconId);
  if (!input || !eyeIcon) return;

  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.122-.563c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />`;
  } else {
    input.type = 'password';
    eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
  }
}

