const container = document.querySelector('.subjects-container');

const levelId = new URLSearchParams(window.location.search).get('level');

function createSubjectCard(subject) {
    const card = document.createElement('a');
    card.className = 'subject-card';
    card.href = `topics.html?subject=${subject.id}`;
    card.textContent = subject.name;
    return card;
}

async function loadSubjects() {
    const parsedLevelId = Number(levelId);

    if (!Number.isInteger(parsedLevelId) || parsedLevelId < 1) {
        container.textContent = 'No level was selected. Please go back and choose a level.';
        return;
    }

    container.textContent = 'Loading subjects...';

    try {
        const response = await fetch(`${API_URL}/levels/${parsedLevelId}/subjects`);

        if (!response.ok) {
            throw new Error(`Failed to fetch subjects (${response.status})`);
        }

        const subjects = await response.json();

        if (subjects.length === 0) {
            container.textContent = 'No subjects are available for this level yet.';
            return;
        }

        const subjectCards = subjects.map(createSubjectCard);
        container.replaceChildren(...subjectCards);
    }
    catch (err) {
        console.error(err);
        container.textContent = 'Sorry, we could not load the subjects. Please refresh the page or try again later.';
    }
}

loadSubjects();