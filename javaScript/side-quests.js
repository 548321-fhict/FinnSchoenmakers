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

        const galleryName = trigger.dataset.gallery;
        const template = document.querySelector(`#gallery-${galleryName}`);
        if (!(template instanceof HTMLTemplateElement)) {
            console.error(`Missing side quest gallery template: ${galleryName}`);
            return;
        }

        const triggerTitle = trigger.querySelector('span:nth-child(2)');
        if (!triggerTitle) {
            console.error(`Side quest gallery trigger has no title: ${galleryName}`);
            return;
        }

        activeTrigger?.setAttribute('aria-expanded', 'false');
        activeTrigger = trigger;
        trigger.setAttribute('aria-expanded', 'true');
        questGalleryTitle.textContent = triggerTitle.textContent;
        questGalleryContent.replaceChildren(template.content.cloneNode(true));
        questGalleryPanel.inert = false;
        questGalleryPanel.setAttribute('aria-hidden', 'false');
        questGalleryPanel.classList.add('is-open');
        requestAnimationFrame(() => questGalleryTitle.focus());
    });
});

function closeGallery() {
    questGalleryPanel.classList.remove('is-open');
    questGalleryPanel.inert = true;
    questGalleryPanel.setAttribute('aria-hidden', 'true');
    questGalleryContent.replaceChildren();
    activeTrigger?.setAttribute('aria-expanded', 'false');
    activeTrigger?.focus();
    activeTrigger = null;
}

questGalleryClose.addEventListener('click', closeGallery);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeTrigger) {
        closeGallery();
    }
});
