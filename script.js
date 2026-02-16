(function () {
  'use strict';

  // Keys
  const KEY_USERS = 'users';
  const KEY_SESSION_USER = 'loggedInUser';
  const KEY_SESSION_TIME = 'loginTime';
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Helpers
  function byId(id) {
    return document.getElementById(id);
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem(KEY_USERS) || '{}';
      return JSON.parse(raw);
    } catch (e) {
      console.error('getUsers parse error', e);
      return {};
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('saveUsers error', e);
    }
  }

  function setSession(email) {
    try {
      localStorage.setItem(KEY_SESSION_USER, email);
      localStorage.setItem(KEY_SESSION_TIME, String(Date.now()));
    } catch (e) {
      console.error('setSession error', e);
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(KEY_SESSION_USER);
      localStorage.removeItem(KEY_SESSION_TIME);
    } catch (e) {
      console.error('clearSession error', e);
    }
  }

  function isSessionValid() {
    try {
      const user = localStorage.getItem(KEY_SESSION_USER);
      const time = parseInt(localStorage.getItem(KEY_SESSION_TIME) || '0', 10);
      if (!user || !time) return false;
      if (Date.now() - time > SESSION_DURATION) {
        clearSession();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // UI helpers
  function showPortfolio() {
    const loginPage = byId('loginPage');
    const portfolio = byId('portfolioContent');
    if (loginPage) loginPage.style.display = 'none';
    if (portfolio) portfolio.style.display = '';
    updateLogoutButton();
  }

  function showLoginPage() {
    const loginPage = byId('loginPage');
    const portfolio = byId('portfolioContent');
    if (portfolio) portfolio.style.display = 'none';
    if (loginPage) loginPage.style.display = 'flex';
    showAuthLoginView();
    updateLogoutButton();
  }

  function showAuthLoginView() {
    const lf = byId('loginForm');
    const rf = byId('registerForm');
    const authTitle = byId('authTitle');
    const authSub = byId('authSub');
    if (lf) lf.style.display = '';
    if (rf) rf.style.display = 'none';
    if (authTitle) authTitle.textContent = 'Sign in';
    if (authSub) authSub.textContent = 'Enter your credentials to access the portfolio.';
    clearMessages();
  }

  function showAuthRegisterView() {
    const lf = byId('loginForm');
    const rf = byId('registerForm');
    const authTitle = byId('authTitle');
    const authSub = byId('authSub');
    if (lf) lf.style.display = 'none';
    if (rf) rf.style.display = '';
    if (authTitle) authTitle.textContent = 'Create account';
    if (authSub) authSub.textContent = 'Register a new account to access the portfolio.';
    clearMessages();
  }

  function clearMessages() {
    const lm = byId('loginMsg');
    const rm = byId('registerMsg');
    if (lm) lm.textContent = '';
    if (rm) rm.textContent = '';
  }

  function updateLogoutButton() {
    const lb = byId('logoutBtn');
    if (!lb) return;
    const user = localStorage.getItem(KEY_SESSION_USER);
    if (user) {
      lb.style.display = '';
      // show compact user text next to icon
      const icon = '<i class="fa-solid fa-right-from-bracket"></i>';
      lb.innerHTML = `${icon} ${escapeHtml(user)} · Logout`;
    } else {
      lb.style.display = 'none';
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]+/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[s];
    });
  }

  // Handlers
  function handleLoginSubmit(e) {
    e.preventDefault();
    const emailEl = byId('loginEmail');
    const passEl = byId('loginPassword');
    const msgEl = byId('loginMsg');
    const email = (emailEl && emailEl.value || '').trim();
    const pass = passEl && passEl.value || '';
    if (!email || !pass) {
      if (msgEl) msgEl.textContent = 'Please enter email and password.';
      return;
    }
    const users = getUsers();
    if (!users[email] || users[email] !== pass) {
      if (msgEl) msgEl.textContent = 'Invalid email or password. Please register first.';
      return;
    }
    // success
    setSession(email);
    if (msgEl) msgEl.textContent = '';
    showPortfolio();
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();
    const emailEl = byId('registerEmail');
    const passEl = byId('registerPassword');
    const msgEl = byId('registerMsg');
    const email = (emailEl && emailEl.value || '').trim();
    const pass = passEl && passEl.value || '';
    if (!email || !pass) {
      if (msgEl) msgEl.textContent = 'Please enter email and password.';
      return;
    }
    const users = getUsers();
    users[email] = pass; // store (insecure demo)
    saveUsers(users);
    if (msgEl) msgEl.textContent = 'Account created. Please login.';
    // switch to login view and keep email prefilled
    const loginEmailEl = byId('loginEmail');
    if (loginEmailEl) loginEmailEl.value = email;
    showAuthLoginView();
  }

  function handleLogout(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearSession();
    showLoginPage();
  }

  function wireEvents() {
    const loginForm = byId('loginForm');
    const registerForm = byId('registerForm');
    const logoutBtn = byId('logoutBtn');
    const toRegister = byId('toRegister');
    const toLogin = byId('toLogin');
    const loginMsg = byId('loginMsg');
    const registerMsg = byId('registerMsg');

    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    // Also wire login button if present separately
    const loginBtn = byId('loginSubmit');
    if (loginBtn) loginBtn.addEventListener('click', function (ev) { ev.preventDefault(); handleLoginSubmit(ev); });

    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
    const registerBtn = byId('registerSubmit');
    if (registerBtn) registerBtn.addEventListener('click', function (ev) { ev.preventDefault(); handleRegisterSubmit(ev); });

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    if (toRegister) toRegister.addEventListener('click', function (ev) { ev.preventDefault(); showAuthRegisterView(); });
    if (toLogin) toLogin.addEventListener('click', function (ev) { ev.preventDefault(); showAuthLoginView(); });

    // clear messages when user focuses inputs
    const inputs = document.querySelectorAll('#loginForm input, #registerForm input');
    inputs.forEach(function (inp) {
      inp.addEventListener('input', function () { clearMessages(); });
    });
  }

  // Init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    wireEvents();
    // decide initial view
    if (isSessionValid()) {
      showPortfolio();
    } else {
      clearSession();
      showLoginPage();
    }
  });

})();
