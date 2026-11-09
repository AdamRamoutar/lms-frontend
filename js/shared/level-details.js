// What each level looks like. The names must match the level names in the database exactly.
// moduleLabel is the word shown for a level's groupings: CAPE calls them modules, and SEA and CSEC call them sections.
// The descriptions live here for now, and a later step can move them into the database.
const LEVEL_DETAILS = {
    SEA: { icon: '🌱', tone: 'green', moduleLabel: 'Section', description: 'This is a des of SEA' },
    CSEC: { icon: '📘', tone: 'blue', moduleLabel: 'Section', description: 'This is a des of CSEC' },
    CAPE: { icon: '🎓', tone: 'purple', moduleLabel: 'Module', description: 'This is a des of CAPE' }
};

// A level that has no entry above still gets sensible defaults, so a new level in the database never breaks a page.
const DEFAULT_LEVEL_DETAILS = { icon: '📚', tone: 'amber', moduleLabel: 'Module', description: '' };

function getLevelDetails(levelName) {
    return LEVEL_DETAILS[levelName] ?? DEFAULT_LEVEL_DETAILS;
}