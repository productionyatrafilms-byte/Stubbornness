const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujrati");

const DEFAULT_LANG = "English";
const STORAGE_KEY = "selectedLanguage";

window.translations = window.translations || {};

function setActiveButton(activeBtn) {
  [btnEn, btnHi, btnGu].forEach((btn) => {
    if (btn) btn.classList.remove("active");
  });

  if (activeBtn) activeBtn.classList.add("active");
}

function normalizeLanguage(lang) {
  const value = String(lang || "").toLowerCase();

  if (value === "en" || value === "english") return "English";
  if (value === "hi" || value === "hindi") return "Hindi";
  if (value === "gu" || value === "gujarati" || value === "gujrati") {
    return "Gujarati";
  }

  return DEFAULT_LANG;
}

function applyTooltips(langData) {
  document.querySelectorAll("[data-tooltip-key]").forEach((el) => {
    const key = el.getAttribute("data-tooltip-key");

    if (langData && langData[key] !== undefined) {
      el.setAttribute(
        "data-tooltip",
        String(langData[key]).replace(/\n/g, " ")
      );
    } else {
      el.setAttribute("data-tooltip", key);
    }
  });
}

function applyLanguage(lang) {
  const selectedLang = normalizeLanguage(lang);
  const langData = window.translations[selectedLang];

  if (!langData) {
    console.warn("Language data not found:", selectedLang);
    return;
  }

  if (selectedLang === "English") {
    document.documentElement.setAttribute("lang", "en");
    document.body.setAttribute("data-lang", "en");
    setActiveButton(btnEn);
  }

  if (selectedLang === "Hindi") {
    document.documentElement.setAttribute("lang", "hi");
    document.body.setAttribute("data-lang", "hi");
    setActiveButton(btnHi);
  }

  if (selectedLang === "Gujarati") {
    document.documentElement.setAttribute("lang", "gu");
    document.body.setAttribute("data-lang", "gu");
    setActiveButton(btnGu);
  }

  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const key = el.getAttribute("data-lang-key");

    if (langData[key] !== undefined) {
      el.innerHTML = String(langData[key]).replace(/\n/g, "<br>");
    } else {
      console.warn("Missing translation key:", key);
    }
  });

  applyTooltips(langData);

  localStorage.setItem(STORAGE_KEY, selectedLang);

  setTimeout(() => {
    if (window.textSwiper && window.videoSwiper) {
      window.textSwiper.update();
      window.textSwiper.slideTo(window.videoSwiper.activeIndex, 0);
    }
  }, 50);
}

function loadTranslations() {
  window.translations = typeof data !== "undefined" ? data : {};

  const savedLang = localStorage.getItem(STORAGE_KEY);
  const langToApply = savedLang || DEFAULT_LANG;

  applyLanguage(langToApply);
}

/* ===== sound effects ===== */

const AUDIO_PATH = "./assets/audio/";

const topicClickSound = new Audio(`${AUDIO_PATH}topic.mp3`);
const swiperClickSound = new Audio(`${AUDIO_PATH}swiper.mp3`);
const navClickSound = new Audio(`${AUDIO_PATH}click.mp3`);
const langClickSounds = {
  English: new Audio(`${AUDIO_PATH}Eng.mpeg`),
  Hindi: new Audio(`${AUDIO_PATH}Hin.mpeg`),
  Gujarati: new Audio(`${AUDIO_PATH}Guj.mpeg`),
};

[
  topicClickSound,
  swiperClickSound,
  navClickSound,
  ...Object.values(langClickSounds),
].forEach((audio) => {
  audio.preload = "auto";
});

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// play a sound, then follow the link once it finishes or this cap is hit
function navigateWithSound(link, audio, maxWait) {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href) return;

    e.preventDefault();

    let navigated = false;
    const go = () => {
      if (navigated) return;
      navigated = true;
      window.location.href = href;
    };

    audio.currentTime = 0;
    audio.addEventListener("ended", go, { once: true });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(go);
    }

    setTimeout(go, maxWait);
  });
}

function wireClickSounds() {
  document.querySelectorAll(".pages a").forEach((link) => {
    navigateWithSound(link, topicClickSound, 900);
  });

  document
    .querySelectorAll(".home-btn, .back-btn, .home-btn-1")
    .forEach((link) => {
      navigateWithSound(link, navClickSound, 600);
    });

  document.querySelectorAll(".prev-btn, .next-btn").forEach((btn) => {
    btn.addEventListener("click", () => playSound(swiperClickSound));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTranslations();
  wireClickSounds();

  if (btnEn) {
    btnEn.addEventListener("click", () => {
      playSound(langClickSounds.English);
      applyLanguage("English");
    });
  }

  if (btnHi) {
    btnHi.addEventListener("click", () => {
      playSound(langClickSounds.Hindi);
      applyLanguage("Hindi");
    });
  }

  if (btnGu) {
    btnGu.addEventListener("click", () => {
      playSound(langClickSounds.Gujarati);
      applyLanguage("Gujarati");
    });
  }
});