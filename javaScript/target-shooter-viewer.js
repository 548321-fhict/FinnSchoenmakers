const imageViewer = document.querySelector("[data-target-viewer]");

if (!(imageViewer instanceof HTMLDialogElement)) {
    throw new Error("The Target Shooter image viewer is missing.");
}

const viewerImage = imageViewer.querySelector("img");

if (!(viewerImage instanceof HTMLImageElement)) {
    throw new Error("The Target Shooter image viewer image is missing.");
}

document.querySelectorAll("[data-target-viewer-image]").forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
        return;
    }

    link.addEventListener("click", (event) => {
        const image = link.querySelector("img");

        if (!(image instanceof HTMLImageElement)) {
            throw new Error("A Target Shooter image link does not contain an image.");
        }

        event.preventDefault();
        viewerImage.src = link.href;
        viewerImage.alt = image.alt;
        imageViewer.showModal();
    });
});

imageViewer.addEventListener("click", (event) => {
    if (event.target === imageViewer) {
        imageViewer.close();
    }
});
