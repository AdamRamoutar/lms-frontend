const panel = document.querySelector('.course-panel');
const mainArea = document.querySelector('.course-main');
const backLink = document.querySelector('.back-link');

const lessonParam = new URLSearchParams(window.location.search).get('subtopic');

// The lesson's public details, what the content request answered, and which sections this lesson has.
// The panel and the heading always draw from the details, even when the content itself is refused.
let context = null;
let access = null;
let availableSections = [];

// Only send the token if the student has one, because free lessons work without it.
function buildRequestHeaders() {
    return isLoggedIn() ? { Authorization: `Bearer ${getToken()}` } : {};
}

// Only web addresses are allowed as video links, so a bad value in the database can't run code when clicked.
// URL.protocol includes the colon, so it is "https:" and not "https".
function isSafeVideoLink(link) {
    try {
        const { protocol } = new URL(link);
        return protocol === 'https:' || protocol === 'http:';
    }
    catch {
        return false;
    }
}

function createMessage(text) {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
}

// A box with a message and an optional button, for lessons the student can't open yet.
function createPrompt(message, linkText, href) {
    const box = document.createElement('div');
    box.className = 'lesson-prompt';
    box.append(createMessage(message));

    if (linkText) {
        const link = document.createElement('a');
        link.className = 'button';
        link.href = href;
        link.textContent = linkText;
        box.append(link);
    }

    return box;
}

function renderVideo(lesson) {
    if (!isSafeVideoLink(lesson.video_link)) {
        return createMessage('The video link for this lesson is not available.');
    }

    const link = document.createElement('a');
    link.className = 'button';
    link.href = lesson.video_link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Watch the video';
    return link;
}

function renderNotes(lesson) {
    const notes = document.createElement('div');
    notes.className = 'lesson-notes-text';
    notes.textContent = lesson.note_content;
    return notes;
}

// Each section is described once here. Adding one later, such as practice, is one more entry.
const SECTIONS = [
    { key: 'video', label: 'Video', exists: (details) => details.has_video, render: renderVideo },
    { key: 'notes', label: 'Notes', exists: (details) => details.has_notes, render: renderNotes }
];

// The prompt depends on why the lesson was refused: no subscription, no login, or something else.
function createBlockedPrompt(blocked) {
    if (blocked.code === 'SUBSCRIPTION_REQUIRED') {
        return createPrompt(`Subscribe to ${context.level_name} to view this lesson. Subscriptions are coming soon.`);
    }

    if (blocked.status === 401) {
        const currentPage = window.location.pathname.split('/').pop() + window.location.search;

        return createPrompt(
            blocked.message || 'Please log in to view this lesson.',
            'Log in or create an account',
            `login.html?${new URLSearchParams({ next: currentPage })}`
        );
    }

    return createPrompt('Sorry, we could not load this lesson. Please try again later.');
}

// The content request answers with the lesson, or with the reason it was refused. Only a network failure throws.
async function fetchContent(lessonId) {
    const response = await fetch(`${API_URL}/subtopics/${lessonId}`, { headers: buildRequestHeaders() });

    if (response.ok) {
        return { lesson: await response.json() };
    }

    const body = await response.json().catch(() => ({}));

    return { blocked: { status: response.status, code: body.code ?? null, message: body.error ?? '' } };
}

function readSection() {
    const requested = new URLSearchParams(window.location.search).get('section');

    return availableSections.find((section) => section.key === requested) ?? availableSections[0] ?? null;
}

// The subject's name on top and the topic under it, so the lesson's own title is not repeated in the panel.
function showPanel() {
    const title = document.createElement('h2');
    title.className = 'course-panel-title';
    title.textContent = context.subject_name;

    const topic = document.createElement('p');
    topic.className = 'course-panel-count';
    topic.textContent = context.topic_title;

    const links = availableSections.map((section) => {
        const link = document.createElement('a');
        link.className = 'course-panel-link';
        link.href = `content.html?subtopic=${context.id}&section=${section.key}`;
        link.dataset.section = section.key;
        link.textContent = section.label;
        return link;
    });

    panel.replaceChildren(title, topic, ...links);
}

function selectSection() {
    const heading = document.createElement('h1');
    heading.textContent = context.title;

    const section = readSection();

    panel.querySelectorAll('[aria-current]').forEach((element) => element.removeAttribute('aria-current'));

    if (section === null) {
        mainArea.replaceChildren(heading, createMessage('No content has been added to this lesson yet.'));
        return;
    }

    panel.querySelector(`[data-section="${section.key}"]`).setAttribute('aria-current', 'page');

    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'lesson-section-title';
    sectionTitle.textContent = section.label;

    const body = access.blocked ? createBlockedPrompt(access.blocked) : section.render(access.lesson);

    mainArea.replaceChildren(heading, sectionTitle, body);
}

function showMessage(title, text) {
    const heading = document.createElement('h1');
    heading.textContent = title;

    panel.replaceChildren();
    mainArea.replaceChildren(heading, createMessage(text));
}

async function loadLesson() {
    const lessonId = Number(lessonParam);

    if (!Number.isInteger(lessonId) || lessonId < 1) {
        showMessage('Lesson not found', 'No lesson was selected. Please go back and choose a lesson.');
        return;
    }

    try {
        // The details and the content don't depend on each other, so they run together.
        const [lessonDetails, lessonAccess] = await Promise.all([
            fetchJson(`${API_URL}/subtopics/${lessonId}/context`),
            fetchContent(lessonId)
        ]);

        context = lessonDetails;
        access = lessonAccess;

        // A stored token that has expired or is invalid will never work again, so it is removed.
        // A visitor with no token has nothing stored, so that case is left alone.
        if (['TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(access.blocked?.code)) {
            clearToken();
        }

        backLink.href = `course.html?subject=${context.subject_id}&topic=${context.topic_id}`;
        backLink.textContent = `Back to ${context.topic_title}`;
        document.title = `${context.title} | ${SITE_NAME}`;

        availableSections = SECTIONS.filter((section) => section.exists(context));

        showPanel();
        selectSection();
    }
    catch (err) {
        console.error(err);

        if (err.status === 404) {
            showMessage('Lesson not found', 'This lesson could not be found. Please go back and choose another.');
            return;
        }

        showMessage('Something went wrong', 'Sorry, we could not load this lesson. Please refresh the page or try again later.');
    }
}

// One listener for the whole panel. Choosing a section changes the address without reloading the page.
panel.addEventListener('click', (event) => {
    const link = event.target.closest('a');

    // Clicks meant for a new tab or window keep their normal behaviour.
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }

    event.preventDefault();

    if (link.href !== window.location.href) {
        window.history.pushState(null, '', link.href);
    }

    selectSection();
});

// Back and Forward change the address without a page load, so the page follows them.
window.addEventListener('popstate', () => {
    if (context) {
        selectSection();
    }
});

loadLesson();