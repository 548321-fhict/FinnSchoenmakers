const imageViewer = document.querySelector("[data-image-viewer]");

if (!(imageViewer instanceof HTMLDialogElement)) {
    throw new Error("The Sublevel image viewer dialog is missing.");
}

const viewerImage = imageViewer.querySelector("img");
const viewerPrevious = imageViewer.querySelector("[data-viewer-previous]");
const viewerNext = imageViewer.querySelector("[data-viewer-next]");

if (
    !(viewerImage instanceof HTMLImageElement) ||
    !(viewerPrevious instanceof HTMLButtonElement) ||
    !(viewerNext instanceof HTMLButtonElement)
) {
    throw new Error("The Sublevel image viewer content is incomplete.");
}

const galleryStates = new WeakMap();
let activeViewerGallery = null;

if (document.body.classList.contains("project-page--splitstar")) {
    document.querySelectorAll("img").forEach((image) => {
        image.draggable = false;
    });

    document.querySelectorAll("a").forEach((link) => {
        if (link.querySelector("img")) {
            link.draggable = false;
        }
    });
}

document.querySelectorAll("[data-viewer-image]").forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
        return;
    }

    link.addEventListener("click", (event) => {
        const image = link.querySelector("img");

        if (!(image instanceof HTMLImageElement)) {
            throw new Error("A Sublevel gallery link does not contain an image.");
        }

        event.preventDefault();
        viewerImage.src = link.href;
        viewerImage.alt = image.alt;
        const gallery = link.closest("[data-room-gallery], [data-image-gallery]");
        activeViewerGallery = galleryStates.get(gallery) || null;
        viewerPrevious.hidden = !activeViewerGallery;
        viewerNext.hidden = !activeViewerGallery;
        imageViewer.showModal();
    });
});

document.querySelectorAll("[data-room-gallery], [data-image-gallery]").forEach((gallery) => {
    const imageLink = gallery.querySelector("[data-viewer-image]");
    const image = imageLink?.querySelector("img");
    const status = gallery.querySelector("[data-gallery-status]");
    const previousButton = gallery.querySelector("[data-gallery-previous]");
    const nextButton = gallery.querySelector("[data-gallery-next]");
    const slides = gallery.querySelector("[data-gallery-slides]");

    if (
        !(imageLink instanceof HTMLAnchorElement) ||
        !(image instanceof HTMLImageElement) ||
        !(status instanceof HTMLElement) ||
        !(previousButton instanceof HTMLButtonElement) ||
        !(nextButton instanceof HTMLButtonElement) ||
        !(slides instanceof HTMLOListElement)
    ) {
        throw new Error("A Sublevel room gallery is incomplete.");
    }

    const items = Array.from(slides.querySelectorAll("li"));

    if (items.length < 2) {
        throw new Error("Each Sublevel gallery must contain at least two images.");
    }

    let activeIndex = 0;
    const showItem = (index) => {
        const item = items[index];
        const source = item?.dataset.src;
        const alt = item?.dataset.alt;
        const stage = item?.dataset.stage;

        if (!source || !alt || !stage) {
            throw new Error("A Sublevel room gallery version is missing its image details.");
        }

        activeIndex = index;
        imageLink.href = source;
        image.src = source;
        image.alt = alt;
        status.textContent = `${activeIndex + 1} of ${items.length}`;

        if (activeViewerGallery === galleryState) {
            viewerImage.src = source;
            viewerImage.alt = alt;
        }
    };

    const showPrevious = () => {
        showItem((activeIndex + items.length - 1) % items.length);
    };

    const showNext = () => {
        showItem((activeIndex + 1) % items.length);
    };

    const galleryState = { showPrevious, showNext };
    galleryStates.set(gallery, galleryState);
    previousButton.addEventListener("click", showPrevious);
    nextButton.addEventListener("click", showNext);
});

viewerPrevious.addEventListener("click", () => activeViewerGallery?.showPrevious());
viewerNext.addEventListener("click", () => activeViewerGallery?.showNext());

imageViewer.addEventListener("click", (event) => {
    if (event.target === imageViewer) {
        imageViewer.close();
        activeViewerGallery = null;
    }
});

imageViewer.addEventListener("close", () => {
    activeViewerGallery = null;
});

imageViewer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        event.preventDefault();
        imageViewer.close();
    } else if (activeViewerGallery && event.key === "ArrowLeft") {
        event.preventDefault();
        activeViewerGallery.showPrevious();
    } else if (activeViewerGallery && event.key === "ArrowRight") {
        event.preventDefault();
        activeViewerGallery.showNext();
    }
});

const cinema = document.querySelector("[data-cinema]");

if (!(cinema instanceof HTMLElement)) {
    throw new Error("The Sublevel walkthrough scene is missing.");
}

const walkthrough = cinema.querySelector("video");
const source = cinema.querySelector("source");
const playButton = cinema.querySelector("[data-cinema-play]");
const playIcon = cinema.querySelector("[data-cinema-play-icon]");
const playLabel = cinema.querySelector("[data-cinema-play-label]");
const muteButton = cinema.querySelector("[data-cinema-mute]");
const muteIcon = cinema.querySelector("[data-cinema-mute-icon]");
const muteLabel = cinema.querySelector("[data-cinema-mute-label]");
const progress = cinema.querySelector("[data-cinema-progress]");
const time = cinema.querySelector("[data-cinema-time]");
const status = cinema.querySelector("[data-cinema-status]");

if (
    !(walkthrough instanceof HTMLVideoElement) ||
    !(source instanceof HTMLSourceElement) ||
    !(playButton instanceof HTMLButtonElement) ||
    !(playIcon instanceof HTMLElement) ||
    !(playLabel instanceof HTMLElement) ||
    !(muteButton instanceof HTMLButtonElement) ||
    !(muteIcon instanceof HTMLElement) ||
    !(muteLabel instanceof HTMLElement) ||
    !(progress instanceof HTMLInputElement) ||
    !(time instanceof HTMLOutputElement) ||
    !(status instanceof HTMLElement)
) {
    throw new Error("The Sublevel walkthrough controls are incomplete.");
}

let userPaused = false;
let sourceLoaded = false;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const saveData = "connection" in navigator && navigator.connection.saveData;

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
};

const updatePlaybackControls = () => {
    const playing = !walkthrough.paused && !walkthrough.ended;
    playButton.setAttribute("aria-pressed", String(playing));
    playButton.setAttribute("aria-label", playing ? "Pause walkthrough" : walkthrough.ended ? "Replay walkthrough" : "Play walkthrough");
    playIcon.textContent = playing ? "Ⅱ" : "▶";
    playLabel.textContent = playing ? "Pause" : walkthrough.ended ? "Replay" : "Play";
    status.dataset.state = playing ? "playing" : "paused";

    if (!playing && !walkthrough.ended && status.textContent !== "Playback unavailable") {
        status.textContent = "Walkthrough paused";
    }
};

const updateTime = () => {
    const duration = walkthrough.duration;
    const currentTime = walkthrough.currentTime;

    if (!Number.isFinite(duration) || duration <= 0) {
        return;
    }

    progress.disabled = false;
    progress.value = String(Math.round((currentTime / duration) * Number(progress.max)));
    time.value = `${formatTime(currentTime)} / ${formatTime(duration)}`;
};

const loadSource = () => {
    if (sourceLoaded) {
        return;
    }

    const sourcePath = source.dataset.src;

    if (!sourcePath) {
        throw new Error("The Sublevel walkthrough source is missing.");
    }

    source.src = sourcePath;
    sourceLoaded = true;
    walkthrough.load();
};

const playWalkthrough = () => {
    loadSource();

    if (walkthrough.ended) {
        walkthrough.currentTime = 0;
    }

    walkthrough.play().catch(() => {
        status.dataset.state = "error";
        status.textContent = "Playback unavailable — select play to try again";
    });
};

playButton.addEventListener("click", () => {
    if (walkthrough.paused || walkthrough.ended) {
        userPaused = false;
        playWalkthrough();
    } else {
        userPaused = true;
        walkthrough.pause();
    }
});

muteButton.addEventListener("click", () => {
    walkthrough.muted = !walkthrough.muted;
    muteButton.setAttribute("aria-pressed", String(!walkthrough.muted));
    muteButton.setAttribute("aria-label", walkthrough.muted ? "Unmute walkthrough" : "Mute walkthrough");
    muteIcon.textContent = walkthrough.muted ? "♪" : "♫";
    muteLabel.textContent = walkthrough.muted ? "Sound off" : "Sound on";
});

progress.addEventListener("input", () => {
    if (Number.isFinite(walkthrough.duration) && walkthrough.duration > 0) {
        walkthrough.currentTime = (Number(progress.value) / Number(progress.max)) * walkthrough.duration;
    }
});

walkthrough.addEventListener("playing", () => {
    status.textContent = "Now playing";
    updatePlaybackControls();
});
walkthrough.addEventListener("pause", updatePlaybackControls);
walkthrough.addEventListener("ended", () => {
    status.dataset.state = "paused";
    status.textContent = "Walkthrough complete";
    updatePlaybackControls();
});
walkthrough.addEventListener("timeupdate", updateTime);
walkthrough.addEventListener("loadedmetadata", updateTime);
walkthrough.addEventListener("durationchange", updateTime);
walkthrough.addEventListener("error", () => {
    status.dataset.state = "error";
    status.textContent = "Walkthrough could not be loaded";
});

if ("IntersectionObserver" in window && !reduceMotion && !saveData) {
    const cinemaObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !userPaused && walkthrough.paused && !walkthrough.ended) {
                playWalkthrough();
            } else if (!entry.isIntersecting && !walkthrough.paused) {
                walkthrough.pause();
            }
        });
    }, { threshold: 0.35 });

    cinemaObserver.observe(cinema);
}
