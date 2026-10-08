const video = document.querySelector('.hero-video');
const canvas = document.querySelector('.hero-video-canvas');
const hero = document.querySelector('.hero');

if (video && canvas && hero) {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const matte = [235, 228, 223];
    const tolerance = 8;
    const feather = 34;
    let framePending = false;

    const renderFrame = () => {
        framePending = false;
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.min(Math.round(canvas.clientWidth * pixelRatio), 900);
        const height = Math.min(Math.round(canvas.clientHeight * pixelRatio), 900);
        if (!width || !height) return;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const sourceWidth = video.videoWidth;
        const sourceHeight = video.videoHeight;
        const zoom = Number.parseFloat(getComputedStyle(canvas).getPropertyValue('--rock-zoom')) || 1;
        const targetRatio = width / height;
        const sourceRatio = sourceWidth / sourceHeight;
        const cropWidth = (sourceRatio > targetRatio ? sourceHeight * targetRatio : sourceWidth) / zoom;
        const cropHeight = (sourceRatio > targetRatio ? sourceHeight : sourceWidth / targetRatio) / zoom;
        const cropX = (sourceWidth - cropWidth) / 2;
        const cropY = (sourceHeight - cropHeight) / 2;

        context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
        const frame = context.getImageData(0, 0, width, height);
        const pixels = frame.data;
        for (let index = 0; index < pixels.length; index += 4) {
            const distance = Math.max(
                Math.abs(pixels[index] - matte[0]),
                Math.abs(pixels[index + 1] - matte[1]),
                Math.abs(pixels[index + 2] - matte[2])
            );
            const alpha = Math.max(0, Math.min(1, (distance - tolerance) / feather));
            pixels[index + 3] *= alpha;
        }
        context.putImageData(frame, 0, 0);

        if (canvas.style.opacity !== '1') {
            canvas.style.opacity = '1';
            video.style.visibility = 'hidden';
        }
        if (!video.paused && !video.ended) scheduleFrame();
    };

    const scheduleFrame = () => {
        if (framePending || video.ended) return;
        if (video.paused) {
            renderFrame();
            return;
        }
        framePending = true;
        if (video.requestVideoFrameCallback) {
            video.requestVideoFrameCallback(renderFrame);
        } else {
            requestAnimationFrame(renderFrame);
        }
    };

    video.addEventListener('loadeddata', scheduleFrame);
    video.addEventListener('play', scheduleFrame);
    video.addEventListener('seeked', scheduleFrame);
    new ResizeObserver(scheduleFrame).observe(canvas);
    scheduleFrame();
}
