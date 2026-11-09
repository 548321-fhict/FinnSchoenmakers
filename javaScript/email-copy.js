const emailCopyStatus = document.createElement('div');
emailCopyStatus.className = 'email-copy-status';
emailCopyStatus.setAttribute('role', 'status');
emailCopyStatus.setAttribute('aria-live', 'polite');
emailCopyStatus.hidden = true;
document.body.append(emailCopyStatus);

let emailCopyTimeout;

function showEmailCopyStatus(message) {
    emailCopyStatus.textContent = message;
    emailCopyStatus.hidden = false;
    clearTimeout(emailCopyTimeout);
    emailCopyTimeout = window.setTimeout(() => {
        emailCopyStatus.hidden = true;
    }, 3000);
}

function copyWithFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.append(textArea);
    textArea.select();

    try {
        if (!document.execCommand('copy')) {
            throw new Error('The browser could not copy the email address.');
        }
    } finally {
        textArea.remove();
    }
}

document.addEventListener('click', async (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const link = event.target.closest('a[href^="mailto:"]');
    if (!(link instanceof HTMLAnchorElement)) {
        return;
    }

    event.preventDefault();
    const email = link.getAttribute('href').slice('mailto:'.length).split('?')[0];

    try {
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(decodeURIComponent(email));
            } catch {
                copyWithFallback(decodeURIComponent(email));
            }
        } else {
            copyWithFallback(decodeURIComponent(email));
        }

        showEmailCopyStatus('Email address copied to clipboard.');
    } catch (error) {
        console.error('Could not copy the email address.', error);
        showEmailCopyStatus('Could not copy the email address. Please try again.');
    }
});
