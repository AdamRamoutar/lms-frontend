// On a phone the course panel is a drawer that slides in from the left. On larger screens the toggle, the close button
// and the backdrop are hidden by CSS and the panel is always shown, so this script changes nothing you can see.
// Everything lives inside a function because top-level names are shared by every script on the page, and the page
// scripts already use names such as "panel".
function setUpDrawer() {
    const drawerPanel = document.querySelector('.course-panel');
    const layout = document.querySelector('.course-layout');
    const closeButton = document.querySelector('.drawer-close');

    if (!drawerPanel || !layout || !closeButton) {
        return;
    }

    drawerPanel.id = 'course-panel';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'drawer-toggle';
    toggle.textContent = drawerPanel.dataset.drawerLabel ?? 'Contents';
    toggle.setAttribute('aria-controls', drawerPanel.id);
    toggle.setAttribute('aria-expanded', 'false');
    layout.before(toggle);

    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.hidden = true;
    document.body.append(backdrop);

    // Everything outside the drawer. While it is open, none of this can be reached with the keyboard or a screen reader.
    const behindDrawer = document.querySelectorAll('.topbar, .bottom-nav, .back-link, .drawer-toggle, .course-main');

    function isOpen() {
        return drawerPanel.classList.contains('is-open');
    }

    // Sets everything that depends on the state in one place, so the panel, the backdrop and the button can't disagree.
    function applyState(open) {
        drawerPanel.classList.toggle('is-open', open);
        backdrop.hidden = !open;
        document.body.classList.toggle('drawer-open', open);
        toggle.setAttribute('aria-expanded', String(open));

        behindDrawer.forEach((element) => {
            element.inert = behindDrawer.forEach((element) => {
                element.inert = open;
            });;
        });
    }

    function openDrawer() {
        applyState(true);
        closeButton.focus();
    }

    function closeDrawer() {
        applyState(false);
        toggle.focus();
    }

    toggle.addEventListener('click', openDrawer);
    closeButton.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            closeDrawer();
        }
    });

    // Picking a topic or a section closes the drawer, so the student sees what they chose.
    // A click meant for a new tab or window keeps its normal behaviour, and leaves the drawer open.
    drawerPanel.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        const isPlainClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

        if (link && isPlainClick) {
            closeDrawer();
        }
    });

    // If the window is widened while the drawer is open, the panel becomes a normal column, so the drawer is put away.
    // Focus isn't moved, because the student didn't ask to close it.
    window.matchMedia('(max-width: 48rem)').addEventListener('change', (event) => {
        if (!event.matches && isOpen()) {
            applyState(false);
        }
    });
}

setUpDrawer();