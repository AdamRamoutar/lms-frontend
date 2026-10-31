const lessonTitle = document.querySelector('.lesson-title');
const message = document.querySelector('.lesson-message');
const videoSection = document.querySelector('.lesson-video');
const videoLink = document.querySelector('.lesson-video-link');
const notesSection = document.querySelector('.lesson-notes');
const notesText = document.querySelector('.lesson-notes-text');
const backLink = document.querySelector('.back-link');

const subtopicId = new URLSearchParams(window.location.search).get('subtopic');

function showMessage(text) {
    message.textContent = text;
}

// Only send the token if the student has one, because free lessons work without it.
function buildRequestHeaders() {
    return isLoggedIn() ? { Authorization: `Bearer ${getToken()}` } : {};
}

function showLoginPrompt(text) {
    // This page's own address without a leading slash, e.g. "content.html?subtopic=3", so the student comes back here after logging in.
    const currentPage = window.location.pathname.split('/').pop() + window.location.search;

    lessonTitle.textContent = 'Log in to view this lesson';
    // The trailing space separates this sentence from the link that follows it.
    showMessage(`${text} `);

    const loginLink = document.createElement('a');
    loginLink.href = `login.html?${new URLSearchParams({ next: currentPage })}`;
    loginLink.textContent = 'Log in or create an account';
    message.append(loginLink);
}

// Only web addresses are allowed as video links, so a bad value in the database can't run code when clicked.
function isSafeVideoLink(link) {
    try {
        const { protocol } = new URL(link);
        return protocol === 'https:' || protocol === 'http:';
    }
    catch {
        return false;
    }
}

function showLesson(lesson) {
    lessonTitle.textContent = lesson.title;
    document.title = `${lesson.title} | Caribbean Learning Management System`;
    showMessage('');

    if (lesson.video_link && isSafeVideoLink(lesson.video_link)) {
        videoLink.href = lesson.video_link;
        videoSection.hidden = false;
    }

    if (lesson.note_content) {
        notesText.textContent = lesson.note_content;
        notesSection.hidden = false;
    }
}

async function loadLesson() {
    const parsedSubtopicId = Number(subtopicId);

    if (!Number.isInteger(parsedSubtopicId) || parsedSubtopicId < 1) {
        lessonTitle.textContent = 'Lesson not found';
        showMessage('No lesson was selected. Please go back and choose a lesson.');
        return;
    }

    showMessage('Loading lesson...');

    try {
        const response = await fetch(`${API_URL}/subtopics/${parsedSubtopicId}`, {
            headers: buildRequestHeaders()
        });

        if (response.status === 401) {
            const { error, code } = await response.json();

            if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
                clearToken();
            }

            showLoginPrompt(error);
            return;
        }

        if (response.status === 404) {
            lessonTitle.textContent = 'Lesson not found';
            showMessage('This lesson could not be found. Please go back and choose another.');
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch the lesson (${response.status})`);
        }

        const lesson = await response.json();
        showLesson(lesson);
    }
    catch (err) {
        console.error(err);
        lessonTitle.textContent = 'Something went wrong';
        showMessage('Sorry, we could not load this lesson. Please refresh the page or try again later.');
    }
}

// Send the student back to the lessons list they came from.
backLink.addEventListener('click', (event) => {
    if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
    }
});

loadLesson();