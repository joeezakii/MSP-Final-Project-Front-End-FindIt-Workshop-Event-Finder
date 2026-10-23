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

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);

    const openEyeSvg = `
      <svg class="w-5 h-5 text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5V2" />
        <path d="M6.5 6.5L4.5 4.5" />
        <path d="M17.5 6.5L19.5 4.5" />
      </svg>`;

    const closedEyeSvg = `
      <svg class="w-5 h-5 text-slate-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>`;

    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = openEyeSvg;
    } else {
      input.type = 'password';
      btn.innerHTML = closedEyeSvg;
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
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;

  if (password !== confirmPassword) {
    showAlert('Passwords do not match.', true);
    return;
  }

  let users = JSON.parse(localStorage.getItem('eventhub_users') || '[]');
  
  if (users.some(u => u.email === email)) {
    showAlert('An account with this email already exists.', true);
    return;
  }

  const newUser = { id: Date.now(), name, email, password, bookings: [] };
  users.push(newUser);
  localStorage.setItem('eventhub_users', JSON.stringify(users));
  localStorage.setItem('eventhub_current_user', JSON.stringify(newUser));

  showAlert('Account created successfully! Redirecting...');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
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
    window.location.href = 'index.html';
  }, 1000);
}