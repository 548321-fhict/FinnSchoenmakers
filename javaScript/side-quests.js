const questGalleryPanel = document.querySelector('#quest-gallery-panel');
const questGalleryTitle = document.querySelector('#quest-gallery-title');
const questGalleryContent = document.querySelector('#quest-gallery-content');
const questGalleryClose = document.querySelector('.quest-drawer-close');

if (!questGalleryPanel || !questGalleryTitle || !questGalleryContent || !questGalleryClose) {
    throw new Error('Side quest gallery controls are missing from the page.');
}

let activeTrigger = null;

document.querySelectorAll('.quest-item[data-gallery]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
        if (activeTrigger === trigger && questGalleryPanel.classList.contains('is-open')) {
            closeGallery();
            return;
        }

        openGallery(trigger);
    });
});

function openGallery(trigger, focusHeading = true) {
    const galleryName = trigger.dataset.gallery;
    const template = document.querySelector(`#gallery-${galleryName}`);
    if (!(template instanceof HTMLTemplateElement)) {
        console.error(`Missing side quest gallery template: ${galleryName}`);
        return;
    }

    const triggerTitle = trigger.querySelector('.quest-title');
    const triggerAction = trigger.querySelector('.quest-action');
    const triggerMark = trigger.querySelector('.quest-mark');
    if (!triggerTitle || !triggerAction || !triggerMark) {
        console.error(`Side quest gallery trigger has no title: ${galleryName}`);
        return;
    }

    if (activeTrigger) {
        setTriggerExpanded(activeTrigger, false);
    }
    activeTrigger = trigger;
    setTriggerExpanded(trigger, true);
    questGalleryTitle.textContent = triggerTitle.textContent;
    questGalleryContent.replaceChildren(template.content.cloneNode(true));
    questGalleryPanel.inert = false;
    questGalleryPanel.setAttribute('aria-hidden', 'false');
    questGalleryPanel.classList.add('is-open');
    if (focusHeading) {
        requestAnimationFrame(() => questGalleryTitle.focus());
    }
}

const initialArtTrigger = document.querySelector('.quest-item[data-gallery="art"]');
if (!(initialArtTrigger instanceof HTMLButtonElement)) {
    throw new Error('The initial 3D art gallery button is missing from the page.');
}
openGallery(initialArtTrigger, false);

function closeGallery() {
    questGalleryPanel.classList.remove('is-open');
    questGalleryPanel.inert = true;
    questGalleryPanel.setAttribute('aria-hidden', 'true');
    questGalleryContent.replaceChildren();
    if (activeTrigger) {
        setTriggerExpanded(activeTrigger, false);
    }
    activeTrigger?.focus();
    activeTrigger = null;
}

function setTriggerExpanded(trigger, expanded) {
    trigger.setAttribute('aria-expanded', String(expanded));
    trigger.querySelector('.quest-action').textContent = expanded ? 'Close gallery' : 'View gallery';
    trigger.querySelector('.quest-mark').textContent = expanded ? '×' : '↗';
}

questGalleryClose.addEventListener('click', closeGallery);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeTrigger) {
        closeGallery();
    }
});
