const container = document.querySelector('.levels-container');

function createLevelCard(level) {
    const card = document.createElement('a');
    card.className = 'level-card';
    card.href = `subjects.html?level=${level.id}`;
    card.textContent = level.name;
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