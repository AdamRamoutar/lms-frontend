// ---------- Theme controls ----------

// The label names the theme a click will switch TO.
function getThemeLabel() {
    return document.documentElement.dataset.theme === 'dark' ? 'Light mode' : 'Dark mode';
}

// A text button, shown in the header to visitors who are logged out.
function createThemeToggle() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.textContent = getThemeLabel();

    button.addEventListener('click', () => {
        toggleTheme();
        button.textContent = getThemeLabel();
    });

    return button;
}

// A round icon button for the login and register pages, which have no header.
function createThemeIconButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-icon-button';

    function update() {
        const isDark = document.documentElement.dataset.theme === 'dark';
        button.textContent = isDark ? '☀️' : '🌙';
        button.setAttribute('aria-label', `Switch to ${getThemeLabel().toLowerCase()}`);
    }

    button.addEventListener('click', () => {
        toggleTheme();
        update();
    });

    update();
    return button;
}

// ---------- Account menu ----------

function createMenuItem(label, onClick) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'menu-item';
    item.textContent = label;
    item.addEventListener('click', onClick);
    return item;
}

function createProfileMenu() {
    const wrapper = document.createElement('div');
    wrapper.className = 'profile-menu';

    const menu = document.createElement('div');
    menu.className = 'profile-dropdown';
    menu.id = 'account-menu';
    menu.hidden = true;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'profile-trigger';
    trigger.setAttribute('aria-label', 'Account menu');
    trigger.setAttribute('aria-controls', menu.id);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.textContent = '👤';

    function setOpen(isOpen) {
        menu.hidden = !isOpen;
        trigger.setAttribute('aria-expanded', String(isOpen));
    }

    const themeItem = createMenuItem(getThemeLabel(), () => {
        toggleTheme();
        themeItem.textContent = getThemeLabel();
    });

    const logoutItem = createMenuItem('Log out', () => {
        clearToken();
        window.location.assign('index.html');
    });

    trigger.addEventListener('click', () => setOpen(menu.hidden));

    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target)) {
            setOpen(false);
        }
    });

    wrapper.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setOpen(false);
            trigger.focus();
        }
    });

    wrapper.addEventListener('focusout', (event) => {
        const nextFocus = event.relatedTarget;

        // A null value means focus left the window or landed on something that can't take focus.
        // Mouse clicks outside the menu are handled by the document click listener, so only react to real focus moves.
        if (nextFocus !== null && !wrapper.contains(nextFocus)) {
            setOpen(false);
        }
    });

    menu.append(themeItem, logoutItem);
    wrapper.append(trigger, menu);
    return wrapper;
}

// ---------- Site header ----------

function createAuthControl() {
    if (isLoggedIn()) {
        return createProfileMenu();
    }

    const loginLink = document.createElement('a');
    loginLink.className = 'site-login-link';
    loginLink.href = 'login.html';
    loginLink.textContent = 'Log in';
    return loginLink;
}

function createHeader() {
    const header = document.createElement('header');
    header.className = 'site-header';

    const brand = document.createElement('a');
    brand.className = 'site-brand';
    brand.href = 'index.html';
    brand.textContent = SITE_NAME;

    const nav = document.createElement('nav');
    nav.className = 'site-nav';

    // Logged-in students find the theme option inside their account menu, so the header only shows it to visitors.
    if (!isLoggedIn()) {
        nav.append(createThemeToggle());
    }

    nav.append(createAuthControl());

    header.append(brand, nav);
    return header;
}

// ---------- Page setup ----------

function setUpPage() {
    // Every element marked data-site-name shows the site name, so a rename stays a one-line change in config.js.
    document.querySelectorAll('[data-site-name]').forEach((element) => {
        element.textContent = SITE_NAME;
    });

    const layout = document.body.dataset.layout;

    if (layout === 'auth') {
        const authPanel = document.querySelector('.auth-panel');

        if (authPanel) {
            authPanel.append(createThemeIconButton());
        }

        return;
    }

    // The app layout gets its own shell in a later stage. Until then, app and site pages share the header.
    document.body.prepend(createHeader());
}

setUpPage();