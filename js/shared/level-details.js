// What each level card shows. The names must match the level names in the database exactly.
// The descriptions live here for now, and a later step can move them into the database.
const LEVEL_DETAILS = {
    SEA: { icon: '🌱', tone: 'green', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry'},
    CSEC: { icon: '📘', tone: 'blue', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry'},
    CAPE: { icon: '🎓', tone: 'purple', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry'}
};

// A level that has no entry above still gets a card, so a new level in the database never breaks the page.
const DEFAULT_LEVEL_DETAILS = { icon: '📚', tone: 'amber', description: '' };

function getLevelDetails(levelName) {
    return LEVEL_DETAILS[levelName] ?? DEFAULT_LEVEL_DETAILS;
}