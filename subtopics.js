const container = document.querySelector('.subtopics-container');
const backLink = document.querySelector('.back-link');

const topicId = new URLSearchParams(window.location.search).get('topic');

function createSubtopicCard(subtopic) {
    const card = document.createElement('a');
    card.className = 'subtopic-card';
    card.href = `content.html?subtopic=${subtopic.id}`;
    card.textContent = subtopic.title;
    return card;
}

async function loadSubtopics() {
    const parsedTopicId = Number(topicId);

    if (!Number.isInteger(parsedTopicId) || parsedTopicId < 1) {
        container.textContent = 'No topic was selected. Please go back and choose a topic.';
        return;
    }

    container.textContent = 'Loading lessons...';

    try {
        const response = await fetch(`${API_URL}/topics/${parsedTopicId}/subtopics`);

        if (!response.ok) {
            throw new Error(`Failed to fetch lessons (${response.status})`);
        }

        const subtopics = await response.json();

        if (subtopics.length === 0) {
            container.textContent = 'No lessons are available for this topic yet.';
            return;
        }

        const subtopicCards = subtopics.map(createSubtopicCard);
        container.replaceChildren(...subtopicCards);
    }
    catch (err) {
        console.error(err);
        container.textContent = 'Sorry, we could not load the lessons. Please refresh the page or try again later.';
    }
}

// Send the student back to the page they came from, so they land on the right topics list.
backLink.addEventListener('click', (event) => {
    if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
    }
});

loadSubtopics();