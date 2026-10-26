// A site-specific key, so this site can't read tokens saved by other projects on the same address.
const TOKEN_KEY = 'lms_token';

function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function isLoggedIn() {
    return Boolean(getToken());
}