const form = document.querySelector('#login-form');
const emailInput = document.querySelector('#login-email');
const passwordInput = document.querySelector('#login-password');
const message = document.querySelector('.form-message');
const submitButton = form.querySelector('button[type="submit"]');
const registerLink = document.querySelector('.register-link a');

const submitLabel = submitButton.textContent;
const next = new URLSearchParams(window.location.search).get('next');

// Only follow a "next" address that is a plain page in this site, such as content.html?subtopic=3.
// A full web address or one starting with // is ignored, so a crafted link can't send students elsewhere.
function getSafeNextPage() {
    const isLocalPage = next !== null && /^[\w-]+\.html(\?[\w=&-]*)?$/.test(next);
    return isLocalPage ? next : 'index.html';
}

// Keep the student's "next" address when they switch to registering, so they still reach their lesson afterwards.
function buildRegisterUrl() {
    if (!next) {
        return 'register.html';
    }
    return `register.html?${new URLSearchParams({ next })}`;
}

function showMessage(text) {
    message.textContent = text;
}

registerLink.href = buildRegisterUrl();

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage('');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error || 'Login failed. Please try again.');
            return;
        }

        if (!result.token) {
            throw new Error('The login response did not include a token');
        }

        saveToken(result.token);
        window.location.assign(getSafeNextPage());
    }
    catch (err) {
        console.error(err);
        showMessage('Sorry, we could not log you in. Please check your connection and try again.');
    }
    finally {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
    }
});