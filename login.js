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

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const dob = document.getElementById('reg-dob').value;
  const gender = document.getElementById('reg-gender').value;
  const year = document.getElementById('reg-year').value;
  const password = document.getElementById('reg-password').value;

  const trackNodes = document.querySelectorAll('.track-checkbox:checked');
  const tracks = Array.from(trackNodes).map(node => node.value);

  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
  
  if (users.some(u => u.email === email)) {
    showAlert('An account with this email already exists.', true);
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