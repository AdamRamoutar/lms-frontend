// Pages that already have their own login or register form, so the header skips its Log in link there.
const PAGES_WITHOUT_LOGIN_LINK = ['login.html', 'register.html'];
const currentPageName = window.location.pathname.split('/').pop();

// The label names the theme a click will switch TO.
function getThemeLabel() {
    return document.documentElement.dataset.theme === 'dark' ? 'Light mode' : 'Dark mode';
}

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

function createAuthControl() {
    if (isLoggedIn()) {
        return createProfileMenu();
    }

    if (PAGES_WITHOUT_LOGIN_LINK.includes(currentPageName)) {
        return null;
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

    const authControl = createAuthControl();
    if (authControl) {
        nav.append(authControl);
    }

    header.append(brand, nav);
    return header;
}

document.body.prepend(createHeader());