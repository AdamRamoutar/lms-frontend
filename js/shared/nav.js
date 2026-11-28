// The destinations in the sidebar and, on phones, the bottom bar. To add a destination, add one item here.
// "pages" lists every page that belongs to the destination, so it stays highlighted while a student browses inside it.
const NAV_ITEMS = [
    {
        label: 'All levels',
        href: 'levels.html',
        icon: '📚',
        pages: ['levels.html', 'subjects.html', 'course.html', 'content.html']
    }
];

// The Admin item isn't in the list above, because only admins see it. It is added once the server confirms the role.
const ADMIN_NAV_ITEM = { label: 'Admin', href: 'admin.html', icon: '🛠️', pages: ['admin.html'] };

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
    label.className = 'nav-label'

    link.append(icon, label);

    if (isCurrentSection(item)) {
        link.setAttribute('aria-current', 'page');
    }

    return link;
}

// The brand: a round mark with the site's first letter, plus the full name. When the sidebar collapses, only the name is hidden.
function createBrand() {
    const brand = document.createElement('a');
    brand.className = 'brand';
    brand.href = getHomePage();
    // The visible name can be hidden when the sidebar collapses, so the link keeps its own accessible name.
    brand.setAttribute('aria-label', SITE_NAME);

    const mark = document.createElement('span');
    mark.className = 'brand-mark';
    mark.textContent = SITE_NAME.charAt(0);
    mark.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'brand-name';
    name.textContent = SITE_NAME;

    brand.append(mark, name);
    return brand;
}

const SIDEBAR_KEY = `${SITE_NAME}_sidebar`;

// Storage can be unavailable, so a failure just means the choice isn't remembered.
function isSidebarCollapsed() {
    try {
        return localStorage.getItem(SIDEBAR_KEY) === 'collapsed';
    }
    catch {
        return false;
    }
}

// A page can ask for the narrow icon strip, so a second panel next to the sidebar has room.
// This only sets where the sidebar starts. The arrow still works, and a student's saved choice isn't overwritten.
function getInitialSidebarState() {
    return document.body.dataset.sidebar === 'collapsed' || isSidebarCollapsed();
}

function saveSidebarState(isCollapsed) {
    try {
        localStorage.setItem(SIDEBAR_KEY, isCollapsed ? 'collapsed' : 'expanded');
    }
    catch {
        // Not saving is fine: the sidebar still changes for this visit.
    }
}

function setSidebarCollapsed(shell, isCollapsed) {
    shell.classList.toggle('is-collapsed', isCollapsed);

    const toggle = shell.querySelector('.sidebar-toggle');
    toggle.setAttribute('aria-expanded', String(!isCollapsed));
    toggle.setAttribute('aria-label', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
    toggle.textContent = isCollapsed ? '>' : '<';

    // Icons stand alone when collapsed, so each one gets a tooltip with its label.
    shell.querySelectorAll('.nav-link').forEach((link) => {
        if(isCollapsed) {
            link.title = link.textContent.trim();
        }
        else  {
            link.removeAttribute('title');
        }
    });
}

function createSidebarToggle(sidebar) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'sidebar-toggle';

    toggle.addEventListener('click', () => {
        const shell = sidebar.closest('.app-shell');
        const nextCollapsed = !shell.classList.contains('is-collapsed');

        setSidebarCollapsed(shell, nextCollapsed);
        saveSidebarState(nextCollapsed);
    });

    return toggle;
}

function createSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';

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
    sidebar.append(createBrand(), nav, createSidebarToggle(sidebar));
    return sidebar;
}

function createBottomNav() {
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Main');

    NAV_ITEMS.forEach((item) => {
        nav.append(createNavLink(item));
    });

    return nav;
}

// Adds the Admin item to the sidebar and the bottom bar for admins. This only decides what to show:
// the real protection is on the server, which refuses every admin request from anyone who isn't an admin.
async function addAdminNavItem() {
    const result = await fetchCurrentUser();

    if (result.state !== 'ok' || result.user.role !== 'admin') {
        return;
    }

    const sidebarList = document.querySelector('.sidebar .nav-list');
    const bottomNav = document.querySelector('.bottom-nav');

    if (sidebarList) {
        const listItem = document.createElement('li');
        listItem.append(createNavLink(ADMIN_NAV_ITEM));
        sidebarList.append(listItem);
    }

    if (bottomNav) {
        bottomNav.append(createNavLink(ADMIN_NAV_ITEM));
    }

    // A collapsed sidebar shows tooltips on its icons, so they are refreshed to include the new item.
    const shell = document.querySelector('.app-shell');

    if (shell) {
        setSidebarCollapsed(shell, shell.classList.contains('is-collapsed'));
    }
}