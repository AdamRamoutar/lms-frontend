// The destinations in the sidebar and, on phones, the bottom bar. To add a destination, add one item here.
// "pages" lists every page that belongs to the destination, so it stays highlighted while a student browses inside it.
const NAV_ITEMS = [
    {
        label: 'All levels',
        href: 'index.html',
        icon: '📚',
        pages: ['index.html', 'subjects.html', 'topics.html', 'subtopics.html', 'content.html']
    }
];

// A page opened at "/" is the home page. This only affects which item is highlighted, so a mismatch is harmless.
function getCurrentPageName() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

function isCurrentSection(item) {
    return item.pages.includes(getCurrentPageName());
}

function createNavLink(item) {
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.href = item.href;

    const icon = document.createElement('span');
    icon.className = 'nav-icon';
    icon.textContent = item.icon;
    icon.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.textContent = item.label;

    link.append(icon, label);

    if (isCurrentSection(item)) {
        link.setAttribute('aria-current', 'page');
    }

    return link;
}

function createSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';

    const brand = document.createElement('a');
    brand.className = 'sidebar-brand';
    brand.href = 'index.html';
    brand.textContent = SITE_NAME;

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Main');

    const list = document.createElement('ul');
    list.className = 'nav-list';

    NAV_ITEMS.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.append(createNavLink(item));
        list.append(listItem);
    });

    nav.append(list);
    sidebar.append(brand, nav);
    return sidebar;
}