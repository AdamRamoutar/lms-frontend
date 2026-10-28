const container = document.querySelector('.topics-container');
const backLink = document.querySelector('.back-link');

const subjectId = new URLSearchParams(window.location.search).get('subject');

function createTopicCard(topic) {
    const card = document.createElement('a');
    card.className = 'topic-card';
    card.href = `subtopics.html?topic=${topic.id}`;
    card.textContent = topic.title;
    return card;
}

async function loadTopics() {
    const parsedSubjectId = Number(subjectId);

    if (!Number.isInteger(parsedSubjectId) || parsedSubjectId < 1) {
        container.textContent = 'No subject was selected. Please go back and choose a subject.';
        return;
    }

    container.textContent = 'Loading topics...';

    try {
        const response = await fetch(`${API_URL}/subjects/${parsedSubjectId}/topics`);

        if (!response.ok) {
            throw new Error(`Failed to fetch topics (${response.status})`);
        }

        const topics = await response.json();

        if (topics.length === 0) {
            container.textContent = 'No topics are available for this subject yet.';
            return;
        }

        const topicCards = topics.map(createTopicCard);
        container.replaceChildren(...topicCards);
    }
    catch (err) {
        console.error(err);
        container.textContent = 'Sorry, we could not load the topics. Please refresh the page or try again later.';
    }
}

// Send the student back to the page they came from, so they land on the right level.
backLink.addEventListener('click', (event) => {
    if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
    }
});

loadTopics();