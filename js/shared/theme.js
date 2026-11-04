const THEME_KEY = 'Carivo_theme';

// Storage can be unavailable (private browsing, blocked site data), so every access is guarded and the site still works without it.
function getSavedTheme() {
    try {
        return localStorage.getItem(THEME_KEY);
    }
    catch {
        return null;
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    }
    catch {
        // Not saving is fine: the theme still applies for this visit.
    }
}

// A saved choice wins. If there isn't one, follow the device's setting.
function getPreferredTheme() {
    const storedTheme = getSavedTheme();

    if (['light', 'dark'].includes(storedTheme)) {
        return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);
    saveTheme(nextTheme);
}

applyTheme(getPreferredTheme());