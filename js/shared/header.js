// Pages that already have their own login or register form, so the header skips its Log in link there.
const PAGES_WITHOUT_LOGIN_LINK = ['login.html', 'register.html'];
const currentPageName = window.location.pathname.split('/').pop();


function createAuthControl() {
    if (isLoggedIn()) {
        const logoutButton = document.createElement('button');
        logoutButton.type = 'button';
        logoutButton.className = 'logout-button';
        logoutButton.textContent = 'Log out';
        logoutButton.addEventListener('click', () => {
            clearToken();
            window.location.assign('index.html');
        });
        return logoutButton;
    }

    if (PAGES_WITHOUT_LOGIN_LINK.includes(currentPageName)) {
        return null;
    }

    const loginLink = document.createElement('a');
    loginLink.className = 'login-link';
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
    brand.textContent = 'Caribbean Learning Management System';

    const nav = document.createElement('nav');
    nav.className = 'site-nav';

    const authControl = createAuthControl();
    if (authControl) {
        nav.append(authControl);
    }

    header.append(brand, nav);
    return header;
}

document.body.prepend(createHeader());