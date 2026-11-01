const container = document.querySelector('.subjects-container');
const backLink = document.querySelector('.back-link');                      // NEW

const levelId = new URLSearchParams(window.location.search).get('level');
const unitParam = new URLSearchParams(window.location.search).get('unit');

function createSubjectCard(subject) {
    const card = document.createElement('a');
    card.className = 'subject-card';
    card.href = `topics.html?subject=${subject.id}`;
    card.textContent = subject.name;
    return card;
}

// NEW: one card per unit, linking to the same page with the unit added to the address.
function createUnitCard(levelNumber, unit) {
    const card = document.createElement('a');
    card.className = 'unit-card';
    card.href = `subjects.html?level=${levelNumber}&unit=${unit}`;
    card.textContent = `Unit ${unit}`;
    return card;
}

// NEW: the distinct unit numbers in a list of subjects, in order, e.g. [1, 2]. Subjects without a unit are ignored.
function getUnits(subjects) {
    const units = subjects
        .map((subject) => subject.unit)
        .filter((unit) => unit !== null);

    return [...new Set(units)].sort((a, b) => a - b);
}

async function loadSubjects() {
    const parsedLevelId = Number(levelId);
    const parsedUnit = unitParam === null ? null : Number(unitParam);

    if (parsedUnit !== null) {
        backLink.textContent = 'Back to units';
        backLink.href = `subjects.html?level=${parsedLevelId}`;
    }

    if (!Number.isInteger(parsedLevelId) || parsedLevelId < 1) {
        container.textContent = 'No level was selected. Please go back and choose a level.';
        return;
    }

    if (parsedUnit !== null && ![1, 2].includes(parsedUnit)) {
        container.textContent = 'That unit does not exist. Please go back and choose a unit.';
        return;
    }

    const unitQuery = parsedUnit === null ? '' : `?unit=${parsedUnit}`;
    const subjectsUrl = `${API_URL}/levels/${parsedLevelId}/subjects${unitQuery}`;

    container.textContent = 'Loading subjects...';

    try {
        const response = await fetch(subjectsUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch subjects (${response.status})`);
        }

        const subjects = await response.json();

        if (subjects.length === 0) {
            container.textContent = 'No subjects are available for this level yet.';
            return;
        }

        // NEW: a level with units shows the Unit choice first, until a unit has been chosen.
        const units = getUnits(subjects);

        if (parsedUnit === null && units.length > 0) {
            container.replaceChildren(...units.map((unit) => createUnitCard(parsedLevelId, unit)));
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

// NEW: send the student back to the page they came from, so Back from a unit's subjects returns to the unit choice.
backLink.addEventListener('click', (event) => {
    if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
    }
});

loadSubjects();