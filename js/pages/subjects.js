const container = document.querySelector('.subjects-container');
const backLink = document.querySelector('.back-link');
const hero = document.querySelector('.level-hero');
const heroTitle = document.querySelector('.level-hero-title');

const levelId = new URLSearchParams(window.location.search).get('level');
const unitParam = new URLSearchParams(window.location.search).get('unit');

// Subjects have no colour of their own yet, so neighbouring cards take turns through the tones.
const SUBJECT_TONES = ['blue', 'purple', 'green', 'amber'];
const SUBJECT_ICON = '📖';

// map passes each item's position as the second argument, so a card can pick its tone from where it sits in the list.
function createSubjectCard(subject, index) {
    return createCard({
        href: `topics.html?subject=${subject.id}`,
        icon: SUBJECT_ICON,
        tone: SUBJECT_TONES[index % SUBJECT_TONES.length],
        title: subject.name,
        text: subject.description ?? ''
    });
}

function createUnitCard(levelNumber, unit) {
    const card = document.createElement('a');
    card.className = 'unit-card';
    card.href = `subjects.html?level=${levelNumber}&unit=${unit}`;
    card.textContent = `Unit ${unit}`;
    return card;
}

// The distinct unit numbers in a list of subjects, in order, e.g. [1, 2]. Subjects without a unit are ignored.
function getUnits(subjects) {
    const units = subjects
        .map((subject) => subject.unit)
        .filter((unit) => unit !== null);

    return [...new Set(units)].sort((a, b) => a - b);
}

function showLevel(level) {
    const { tone } = getLevelDetails(level.name);

    hero.classList.add(`tone-${tone}`);
    heroTitle.textContent = level.name;
    document.title = `${level.name} | ${SITE_NAME}`;
}

async function loadSubjects() {
    const parsedLevelId = Number(levelId);
    const parsedUnit = unitParam === null ? null : Number(unitParam);

    if (!Number.isInteger(parsedLevelId) || parsedLevelId < 1) {
        heroTitle.textContent = 'Level not found';
        container.textContent = 'No level was selected. Please go back and choose a level.';
        return;
    }

    if (parsedUnit !== null && ![1, 2].includes(parsedUnit)) {
        heroTitle.textContent = 'Unit not found';
        container.textContent = 'That unit does not exist. Please go back and choose a unit.';
        return;
    }

    if (parsedUnit !== null) {
        backLink.textContent = 'Back to units';
        backLink.href = `subjects.html?level=${parsedLevelId}`;
    }

    const unitQuery = parsedUnit === null ? '' : `?unit=${parsedUnit}`;
    const subjectsUrl = `${API_URL}/levels/${parsedLevelId}/subjects${unitQuery}`;

    container.textContent = 'Loading subjects...';

    try {
        // The two requests don't depend on each other, so they run together and the page waits for both.
        const [level, subjects] = await Promise.all([
            fetchJson(`${API_URL}/levels/${parsedLevelId}`),
            fetchJson(subjectsUrl)
        ]);

        showLevel(level);

        if (subjects.length === 0) {
            container.textContent = 'No subjects are available for this level yet.';
            return;
        }

        const units = getUnits(subjects);

        if (parsedUnit === null && units.length > 0) {
            container.replaceChildren(...units.map((unit) => createUnitCard(parsedLevelId, unit)));
            return;
        }

        container.replaceChildren(...subjects.map(createSubjectCard));
    }
    catch (err) {
        console.error(err);

        if (err.status === 404) {
            heroTitle.textContent = 'Level not found';
            container.textContent = 'This level could not be found. Please go back and choose another.';
            return;
        }

        heroTitle.textContent = 'Something went wrong';
        container.textContent = 'Sorry, we could not load the subjects. Please refresh the page or try again later.';
    }
}

loadSubjects();