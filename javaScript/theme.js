const themeStorageKey = 'portfolio-theme';
const themeMeta = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    if (themeMeta) {
        themeMeta.content = theme === 'dark' ? '#171a18' : '#f1f0ec';
    }

    document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
        const isDark = theme === 'dark';
        toggle.setAttribute('aria-pressed', String(isDark));
        toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
        toggle.querySelector('[data-theme-icon]').textContent = isDark ? '☼' : '☾';
    });
}

let savedTheme = null;

try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') {
        savedTheme = storedTheme;
    }
} catch (error) {
    console.warn('Could not read the saved theme preference.', error);
}

function getTheme() {
    return savedTheme || (systemTheme.matches ? 'dark' : 'light');
}

applyTheme(getTheme());
document.addEventListener('DOMContentLoaded', () => applyTheme(getTheme()));

systemTheme.addEventListener('change', (event) => {
    if (savedTheme === null) {
        applyTheme(event.matches ? 'dark' : 'light');
    }
});

document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const toggle = event.target.closest('[data-theme-toggle]');
    if (!toggle) {
        return;
    }

    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    savedTheme = theme;

    try {
        localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
        console.error('Could not save the theme preference.', error);
    }
});
