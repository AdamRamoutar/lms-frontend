// A failed request becomes an error that carries its status, so a page can tell "not found" from "something broke".
async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        const error = new Error(`Request failed (${response.status})`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

// Only send the token if the student has one, because free lessons and public pages work without it.
function buildRequestHeaders() {
    return isLoggedIn() ? { Authorization: `Bearer ${getToken()}` } : {};
}