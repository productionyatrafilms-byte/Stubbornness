// Start button + video popup for one slide of a topic page (same behaviour as
// the one built into topic-1.html). Call initVideoPopup({ src, slideIndex }),
// then call the returned sync(activeIndex) from the page's swiper init and
// slideChange handlers.
function initVideoPopup({ src, slideIndex }) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="video-btn hidden">
      <button class="start-video-btn" type="button">
        <span class="play-circle"><i class="fa-solid fa-play"></i></span>
        <span>START</span>
      </button>
    </div>

    <div class="video-popup">
      <div class="video-blur-bg"></div>

      <button class="video-close-btn" type="button">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="popup-video-box">
        <video class="popup-video" src="${src}" playsinline></video>

        <div class="video-click-layer"></div>

        <div class="custom-video-controls">
          <button class="custom-play-btn" type="button">
            <i class="fa-solid fa-play"></i>
          </button>

          <span class="video-time current-time">0:00</span>

          <input
            type="range"
            class="video-progress"
            min="0"
            max="100"
            value="0"
            tabindex="-1"
            aria-disabled="true"
          />

          <span class="video-time total-time">0:00</span>

          <button class="zoom-btn" type="button">
            <i class="fa-solid fa-expand"></i>
          </button>
        </div>
      </div>
    </div>`,
  );

  const videoBtnWrap = document.querySelector(".video-btn");
  const startVideoBtn = document.querySelector(".start-video-btn");
  const startVideoIcon = document.querySelector(".start-video-btn i");
  const videoPopup = document.querySelector(".video-popup");
  const videoCloseBtn = document.querySelector(".video-close-btn");

  const popupVideoBox = document.querySelector(".popup-video-box");
  const popupVideo = document.querySelector(".popup-video");
  const videoClickLayer = document.querySelector(".video-click-layer");

  const customPlayBtn = document.querySelector(".custom-play-btn");
  const customPlayIcon = document.querySelector(".custom-play-btn i");

  const zoomBtn = document.querySelector(".zoom-btn");
  const zoomIcon = document.querySelector(".zoom-btn i");

  const progressBar = document.querySelector(".video-progress");
  const currentTimeText = document.querySelector(".current-time");
  const totalTimeText = document.querySelector(".total-time");

  function updatePlayIcons(isPlaying) {
    const add = isPlaying ? "fa-pause" : "fa-play";
    const remove = isPlaying ? "fa-play" : "fa-pause";

    [customPlayIcon, startVideoIcon].forEach((icon) => {
      icon.classList.remove(remove);
      icon.classList.add(add);
    });
  }

  function openPopupVideo() {
    videoPopup.classList.add("active");

    popupVideo.currentTime = 0;
    progressBar.value = 0;
    currentTimeText.textContent = "0:00";

    if (popupVideo.readyState >= 1) {
      popupVideo.play().catch(() => {});
    } else {
      popupVideo.addEventListener(
        "loadedmetadata",
        () => {
          popupVideo.currentTime = 0;
          popupVideo.play().catch(() => {});
        },
        { once: true },
      );
    }

    updatePlayIcons(true);
  }

  function closePopupVideo() {
    videoPopup.classList.remove("active");

    popupVideo.pause();
    popupVideo.currentTime = 0;

    progressBar.value = 0;
    currentTimeText.textContent = "0:00";

    popupVideoBox.classList.remove("zoomed");

    zoomIcon.classList.remove("fa-compress");
    zoomIcon.classList.add("fa-expand");

    updatePlayIcons(false);
  }

  function toggleVideoPlayPause() {
    if (popupVideo.paused) {
      popupVideo.play().catch(() => {});
      updatePlayIcons(true);
    } else {
      popupVideo.pause();
      updatePlayIcons(false);
    }
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  }

  function updateProgress() {
    const current = popupVideo.currentTime;
    const duration = popupVideo.duration;

    if (duration > 0) {
      progressBar.value = (current / duration) * 100;
      currentTimeText.textContent = formatTime(current);
      totalTimeText.textContent = formatTime(duration);
    }
  }

  function seekVideoToProgress() {
    const duration = popupVideo.duration;

    if (!duration || duration <= 0) return;

    popupVideo.currentTime = (Number(progressBar.value) / 100) * duration;
  }

  startVideoBtn.addEventListener("click", openPopupVideo);
  customPlayBtn.addEventListener("click", toggleVideoPlayPause);
  videoClickLayer.addEventListener("click", toggleVideoPlayPause);
  videoCloseBtn.addEventListener("click", closePopupVideo);

  videoPopup.addEventListener("click", (e) => {
    if (
      e.target === videoPopup ||
      e.target.classList.contains("video-blur-bg")
    ) {
      closePopupVideo();
    }
  });

  popupVideo.addEventListener("timeupdate", updateProgress);

  popupVideo.addEventListener("loadedmetadata", () => {
    totalTimeText.textContent = formatTime(popupVideo.duration);
  });

  popupVideo.addEventListener("play", () => updatePlayIcons(true));
  popupVideo.addEventListener("pause", () => updatePlayIcons(false));

  popupVideo.addEventListener("ended", () => {
    updatePlayIcons(false);
    progressBar.value = 100;
  });

  progressBar.addEventListener("input", seekVideoToProgress);
  progressBar.addEventListener("change", seekVideoToProgress);

  zoomBtn.addEventListener("click", () => {
    popupVideoBox.classList.toggle("zoomed");

    const zoomed = popupVideoBox.classList.contains("zoomed");
    zoomIcon.classList.toggle("fa-compress", zoomed);
    zoomIcon.classList.toggle("fa-expand", !zoomed);
  });

  // Show the button only on the slide this video belongs to.
  function sync(activeIndex) {
    if (activeIndex === slideIndex) {
      videoBtnWrap.classList.remove("hidden");
    } else {
      videoBtnWrap.classList.add("hidden");

      if (videoPopup.classList.contains("active")) {
        closePopupVideo();
      }
    }
  }

  return { sync };
}
