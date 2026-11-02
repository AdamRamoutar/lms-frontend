const THEME_KEY = 'Carivo_theme';

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
        //it is silent
    }
}

function getPreferredTheme() {
    const savedTheme = getSavedTheme();

    if(['light', 'dark'].includes(saveTheme)) {
        return savedTheme;
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
