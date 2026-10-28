const form = document.querySelector('#register-form');
const emailInput = document.querySelector('#register-email');
const passwordInput = document.querySelector('#register-password');
const confirmPasswordInput = document.querySelector('#register-confirm-password');
const message = document.querySelector('.form-message');
const submitButton = form.querySelector('button[type="submit"]');
const loginLink = document.querySelector('.login-link a');

const submitLabel = submitButton.textContent;
const next = new URLSearchParams(window.location.search).get('next');

// Keep the student's "next" address, so after registering and logging in they still reach the lesson they wanted.
// The login page checks that the address is safe before following it.
function buildLoginUrl() {
    if (!next) {
        return 'login.html';
    }
    return `login.html?${new URLSearchParams({ next })}`;
}

function showMessage(text) {
    message.textContent = text;
}

loginLink.href = buildLoginUrl();

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage('');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        showMessage('The passwords do not match. Please try again.');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Creating account...';

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error || 'Registration failed. Please try again.');
            return;
        }

        form.reset();
        showMessage('Account created. Taking you to the login page...');
        setTimeout(() => window.location.assign(buildLoginUrl()), 1500);
    }
    catch (err) {
        console.error(err);
        showMessage('Sorry, we could not create your account. Please check your connection and try again.');
    }
    finally {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
    }
});