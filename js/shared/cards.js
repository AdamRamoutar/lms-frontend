// One card design for the whole site. Pages decide what goes in a card, and this decides how a card is built.
function createCard({ href, icon, tone, title, text }) {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = href;

    const thumb = document.createElement('div');
    thumb.className = `card-thumb tone-${tone}`;
    thumb.textContent = icon;
    thumb.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    body.className = 'card-body';

    const heading = document.createElement('h2');
    heading.className = 'card-title';
    heading.textContent = title;
    body.append(heading);

    // No empty paragraph when there's no description.
    if (text) {
        const paragraph = document.createElement('p');
        paragraph.className = 'card-text';
        paragraph.textContent = text;
        body.append(paragraph);
    }

    card.append(thumb, body);
    return card;
}