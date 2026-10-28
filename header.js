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
    nav.append(createAuthControl());

    header.append(brand, nav);
    return header;
}

document.body.prepend(createHeader());