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
  fetch("./assets/json/data.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error("data.json not found");
      }

      return res.json();
    })
    .then((data) => {
      window.translations = data;

      const savedLang = localStorage.getItem(STORAGE_KEY);
      const langToApply = savedLang || DEFAULT_LANG;

      applyLanguage(langToApply);
    })
    .catch((err) => {
      console.error("Error loading translations:", err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTranslations();

  if (btnEn) {
    btnEn.addEventListener("click", () => applyLanguage("English"));
  }

  if (btnHi) {
    btnHi.addEventListener("click", () => applyLanguage("Hindi"));
  }

  if (btnGu) {
    btnGu.addEventListener("click", () => applyLanguage("Gujarati"));
  }
});