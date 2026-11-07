const container = document.querySelector('.levels-container');

// What each level card shows. The names must match the level names in the database exactly.
// The descriptions live here for now, and a later step can move them into the database.
const LEVEL_DETAILS = {
    SEA: { icon: '🌱', tone: 'green', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry'},
    CSEC: { icon: '📘', tone: 'blue', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry'},
    CAPE: { icon: '🎓', tone: 'purple', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry'}
};

// A level that has no entry above still gets a card, so a new level in the database never breaks the page.
const DEFAULT_LEVEL_DETAILS = { icon: '📚', tone: 'amber', description: '' };

function createLevelCard(level) {
    const { icon, tone, description } = LEVEL_DETAILS[level.name] ?? DEFAULT_LEVEL_DETAILS;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = `subjects.html?level=${level.id}`;

    const thumb = document.createElement('div');
    thumb.className = `card-thumb tone-${tone}`;
    thumb.textContent = icon;
    thumb.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = level.name;
    body.append(title);

    // A level with no description gets no empty paragraph.
    if (description) {
        const text = document.createElement('p');
        text.className = 'card-text';
        text.textContent = description;
        body.append(text);
    }

    card.append(thumb, body);
    return card;
}

async function loadLevels() {
    container.textContent = 'Loading levels...';

    try {
        const response = await fetch(`${API_URL}/levels`);

        if (!response.ok) {
            throw new Error(`Failed to fetch levels (${response.status})`);
        }

        const levels = await response.json();

        if (levels.length === 0) {
            container.textContent = 'No levels are available yet.';
            return;
        }

        const levelCards = levels.map(createLevelCard);
        container.replaceChildren(...levelCards);
    }
    catch (err) {
        console.error(err);
        container.textContent = 'Sorry, we could not load the levels. Please refresh the page or try again later.';
    }
}

loadLevels();