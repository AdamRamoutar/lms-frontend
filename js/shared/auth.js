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

// Only send the token if the student has one, because free lessons and public pages work without it.
function buildRequestHeaders() {
    return isLoggedIn() ? { Authorization: `Bearer ${getToken()}` } : {};
}

// Asks the server who the logged-in student is. The server is the one that knows the role, so the page never guesses it.
// Returns { state: 'logged-out' }, { state: 'error' } or { state: 'ok', user: { email, role } }.
async function fetchCurrentUser() {
    if (!isLoggedIn()) {
        return { state: 'logged-out' };
    }

    try {
        const response = await fetch(`${API_URL}/me`, { headers: buildRequestHeaders() });

        // The stored token is no longer good, so the student is treated as logged out.
        if (response.status === 401) {
            clearToken();
            return { state: 'logged-out' };
        }

        if (!response.ok) {
            return { state: 'error' };
        }

        return { state: 'ok', user: await response.json() };
    }
    catch (err) {
        console.error(err);
        return { state: 'error' };
    }
}

function getHomePage() {
    return isLoggedIn() ? 'levels.html' : 'index.html';
}