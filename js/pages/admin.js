const adminMain = document.querySelector('.admin');

// A heading, a sentence, and an optional button, for everything the page says instead of the admin home.
function showAdminMessage(title, text, linkText, href) {
    const heading = document.createElement('h1');
    heading.textContent = title;

    const paragraph = document.createElement('p');
    paragraph.textContent = text;

    adminMain.replaceChildren(heading, paragraph);

    if (linkText) {
        const link = document.createElement('a');
        link.className = 'button';
        link.href = href;
        link.textContent = linkText;
        adminMain.append(link);
    }
}

function showAdminHome() {
    const heading = document.createElement('h1');
    heading.textContent = 'Admin';

    const intro = document.createElement('p');
    intro.textContent = 'You are signed in as an administrator.';

    const note = document.createElement('p');
    note.textContent = 'The content manager is coming next.';

    adminMain.replaceChildren(heading, intro, note);
}

async function loadAdmin() {
    const result = await fetchCurrentUser();

    if (result.state === 'logged-out') {
        showAdminMessage(
            'Log in to continue',
            'The admin area is for administrators.',
            'Log in',
            `login.html?${new URLSearchParams({ next: 'admin.html' })}`
        );
        return;
    }

    if (result.state === 'error') {
        showAdminMessage('Something went wrong', 'Sorry, we could not check your account. Please refresh the page or try again later.');
        return;
    }

    if (result.user.role !== 'admin') {
        showAdminMessage('No access', 'This area is for administrators.', 'Back to levels', 'levels.html');
        return;
    }

    showAdminHome();
}

loadAdmin();