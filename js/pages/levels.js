const container = document.querySelector('.levels-container');

function createLevelCard(level) {
    const { icon, tone, description } = getLevelDetails(level.name);

    return createCard({ 
        href: `subjects.html?level=${level.id}`,
        icon, 
        tone, 
        title: level.name,
        text: description
    });
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