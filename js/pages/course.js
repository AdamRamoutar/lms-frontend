const panel = document.querySelector('.course-panel');
const mainArea = document.querySelector('.course-main');
const backLink = document.querySelector('.back-link');

const subjectParam = new URLSearchParams(window.location.search).get('subject');

// The outline is loaded once and kept, so choosing a topic only changes the main area and the panel stays as it is.
let currentOutline = null;
// Counts selections, so a slow response for an earlier topic can't overwrite a later one.
let latestSelection = 0;

// A missing or malformed topic means "no topic chosen".
function readActiveTopicId() {
    const value = new URLSearchParams(window.location.search).get('topic');
    const parsed = Number(value);

    return value !== null && Number.isInteger(parsed) ? parsed : null;
}

function getAllTopics(outline) {
    return outline.modules.flatMap((moduleRow) => moduleRow.topics);
}

function createModule(outline, moduleRow, index, moduleLabel) {
    const details = document.createElement('details');
    details.className = 'course-module';

    const summary = document.createElement('summary');
    summary.textContent = `${moduleLabel} ${index + 1}: ${moduleRow.title}`;

    const list = document.createElement('ol');
    list.className = 'course-topics';

    moduleRow.topics.forEach((topic) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `course.html?subject=${outline.id}&topic=${topic.id}`;
        link.dataset.topicId = topic.id;
        link.textContent = topic.title;

        item.append(link);
        list.append(item);
    });

    details.append(summary, list);
    return details;
}

// Built once. Which entry is highlighted, and which modules are open, is handled by selectTopic.
function showPanel(outline) {
    const { moduleLabel } = getLevelDetails(outline.level_name);
    const topicCount = getAllTopics(outline).length;

    const title = document.createElement('h2');
    title.className = 'course-panel-title';
    title.textContent = outline.name;

    const count = document.createElement('p');
    count.className = 'course-panel-count';
    count.textContent = `${topicCount} ${topicCount === 1 ? 'topic' : 'topics'}`;

    const aboutLink = document.createElement('a');
    aboutLink.className = 'course-panel-link';
    aboutLink.href = `course.html?subject=${outline.id}`;
    aboutLink.dataset.about = 'true';
    aboutLink.textContent = 'About this subject';

    const modules = outline.modules.map((moduleRow, index) =>
        createModule(outline, moduleRow, index, moduleLabel)
    );

    panel.replaceChildren(title, count, aboutLink, ...modules);

    if (modules.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'No content has been added yet.';
        panel.append(empty);
    }
}

function showOverview(outline) {
    const heading = document.createElement('h1');
    heading.textContent = outline.name;
    mainArea.replaceChildren(heading);

    if (outline.description) {
        const description = document.createElement('p');
        description.textContent = outline.description;
        mainArea.append(description);
    }

    const topics = getAllTopics(outline);
    const lessonCount = topics.reduce((total, topic) => total + topic.lesson_count, 0);

    const stats = document.createElement('ul');
    stats.className = 'course-stats';

    [
        `${outline.modules.length} ${outline.modules.length === 1 ? 'module' : 'modules'}`,
        `${topics.length} ${topics.length === 1 ? 'topic' : 'topics'}`,
        `${lessonCount} ${lessonCount === 1 ? 'lesson' : 'lessons'}`
    ].forEach((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        stats.append(item);
    });

    mainArea.append(stats);
}

function createLessonRow(lesson) {
    const item = document.createElement('li');
    item.className = 'lesson-row';

    const link = document.createElement('a');
    link.className = 'lesson-link';
    link.href = `content.html?subtopic=${lesson.id}`;

    const title = document.createElement('span');
    title.className = 'lesson-title-text';
    title.textContent = lesson.title;

    const badge = document.createElement('span');
    badge.className = lesson.is_free ? 'badge badge-free' : 'badge badge-locked';
    badge.textContent = lesson.is_free ? 'Free' : 'Locked';

    link.append(title, badge);
    item.append(link);
    return item;
}

async function showTopic(topic, selection) {
    const heading = document.createElement('h1');
    heading.textContent = topic.title;

    const status = document.createElement('p');
    status.textContent = 'Loading lessons...';

    mainArea.replaceChildren(heading, status);

    try {
        const lessons = await fetchJson(`${API_URL}/topics/${topic.id}/subtopics`);

        // The student has already chosen something else, so this answer is out of date.
        if (selection !== latestSelection) {
            return;
        }

        if (lessons.length === 0) {
            status.textContent = 'No lessons have been added to this topic yet.';
            return;
        }

        const list = document.createElement('ol');
        list.className = 'lesson-list';
        // Removing the list markers in CSS makes Safari drop the list meaning, so it's restored here.
        list.setAttribute('role', 'list');
        list.append(...lessons.map(createLessonRow));

        mainArea.replaceChildren(heading, list);
    }
    catch (err) {
        console.error(err);

        if (selection === latestSelection) {
            status.textContent = 'Sorry, we could not load the lessons. Please try again.';
        }
    }
}

function showMessage(title, text) {
    const heading = document.createElement('h1');
    heading.textContent = title;

    const paragraph = document.createElement('p');
    paragraph.textContent = text;

    panel.replaceChildren();
    mainArea.replaceChildren(heading, paragraph);
}

// Highlights the chosen entry, opens its module, and fills the main area. Modules the student opened earlier stay open.
function selectTopic(requestedTopicId) {
    latestSelection += 1;
    const selection = latestSelection;

    const activeTopic = getAllTopics(currentOutline).find((topic) => topic.id === requestedTopicId) ?? null;

    panel.querySelectorAll('[aria-current]').forEach((element) => element.removeAttribute('aria-current'));

    const link = activeTopic === null
        ? panel.querySelector('[data-about]')
        : panel.querySelector(`[data-topic-id="${activeTopic.id}"]`);

    link.setAttribute('aria-current', 'page');

    const moduleElement = link.closest('details');

    if (moduleElement) {
        moduleElement.open = true;
    }

    if (activeTopic === null) {
        showOverview(currentOutline);
        return;
    }

    showTopic(activeTopic, selection);
}

async function loadCourse() {
    const subjectId = Number(subjectParam);

    if (!Number.isInteger(subjectId) || subjectId < 1) {
        showMessage('Subject not found', 'No subject was selected. Please go back and choose a subject.');
        return;
    }

    try {
        currentOutline = await fetchJson(`${API_URL}/subjects/${subjectId}/outline`);

        // Back goes to the subject list for this level, and for a CAPE unit, to that unit's list.
        backLink.href = `subjects.html?level=${currentOutline.level_id}${currentOutline.unit ? `&unit=${currentOutline.unit}` : ''}`;
        document.title = `${currentOutline.name} | ${SITE_NAME}`;

        showPanel(currentOutline);
        selectTopic(readActiveTopicId());
    }
    catch (err) {
        console.error(err);

        if (err.status === 404) {
            showMessage('Subject not found', 'This subject could not be found. Please go back and choose another.');
            return;
        }

        showMessage('Something went wrong', 'Sorry, we could not load this subject. Please refresh the page or try again later.');
    }
}

// One listener for the whole panel, instead of one per link.
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

    selectTopic(readActiveTopicId());
});

// The browser's Back and Forward buttons change the address without a page load, so the page follows them.
window.addEventListener('popstate', () => {
    if (currentOutline) {
        selectTopic(readActiveTopicId());
    }
});

loadCourse();