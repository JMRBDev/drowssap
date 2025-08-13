/* Password Generator - Refactored */

const SETTINGS_STORAGE_KEY = "passwordGeneratorSettings";
const wordlist = new Map();
let currentPassword = "";

const CHARACTER_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|:,.<>?",
  ambiguous: "l1I0Oo",
};

const STRENGTH_LABELS = {
  0: "Awful",
  20: "Very weak",
  40: "Weak",
  60: "Average",
  70: "Good",
  80: "Strong",
  90: "Very strong",
  100: "Outstanding",
};

const PASSWORD_TYPE_CONFIG = {
  random: {
    slider: "length",
    min: 8,
    default: 16,
    help: "Select character types to include.",
    disabled: [],
  },
  memorable: {
    slider: "words",
    min: 2,
    default: 4,
    help: "Uses dictionary words.",
    disabled: ["numbers", "symbols", "ambiguous"],
  },
  pin: {
    slider: "length",
    min: 4,
    default: 4,
    help: "Only uses numbers.",
    disabled: ["lowercase", "uppercase", "symbols", "ambiguous"],
  },
};

const $ = (id) => document.querySelector(id);
const $$ = (id) => document.querySelectorAll(id);

const ui = {
  passwordInput: $("#generated-password"),
  strengthFill: $(".strength-fill"),
  strengthLabel: $(".strength-label"),
  strengthBar: $(".strength-bar"),
  closeBottomSheet: $(".close-bottom-sheet"),
  charCount: $("#char-count"),
  copyButton: $("#copy-btn"),
  settingsSheet: $(".bottom-sheet-container"),
  sliders: {
    length: $("#password-length-slider"),
    words: $("#words-count-slider"),
  },
  sliderContainers: {
    length: $("#password-length-slider-container"),
    words: $("#words-count-slider-container"),
  },
  sliderLabels: {
    length: $("#password-length-slider-container .slider-label"),
    words: $("#words-count-slider-container .slider-label"),
  },
  characterHelp: $("#character-help"),
  checkboxes: Object.fromEntries(
    ["lowercase", "uppercase", "numbers", "symbols", "ambiguous"].map((id) => [
      id,
      $(`#${id}-checkbox`),
    ])
  ),
  typeRadios: Array.from($$('input[name="password-type"]')),
  themeRadios: Array.from($$('input[name="theme"]')),
};

/* Utilities */
const secureRandomFloat = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);
const randomIntInclusive = (min, max) =>
  Math.floor(secureRandomFloat() * (max - min + 1)) + min;
const fisherYatesShuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIntInclusive(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const rollDice = () => randomIntInclusive(1, 6);

/* Core Logic */
async function loadWordlist() {
  try {
    const response = await fetch("assets/wordlist.txt");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.text();
    data.split("\n").forEach((line) => {
      const [key, word] = line.trim().split("\t");
      if (key && word) wordlist.set(key, word);
    });
    if (!wordlist.size) throw new Error("Wordlist is empty.");
    ui.typeRadios.find((r) => r.value === "memorable").disabled = false;
  } catch (error) {
    console.error("Failed to load wordlist:", error);
    const memorableRadio = ui.typeRadios.find((r) => r.value === "memorable");
    if (memorableRadio) {
      memorableRadio.disabled = true;
      if (memorableRadio.checked) {
        ui.typeRadios.find((r) => r.value === "random").checked = true;
        updateUIForPasswordType(false);
      }
    }
  }
}

const getSettings = () => ({
  type: ui.typeRadios.find((r) => r.checked)?.value || "random",
  length: parseInt(ui.sliders.length.value, 10),
  words: parseInt(ui.sliders.words.value, 10),
  theme: ui.themeRadios.find((r) => r.checked)?.value || "system",
  ...Object.fromEntries(
    Object.entries(ui.checkboxes).map(([key, cb]) => [key, cb.checked])
  ),
});

function applyTheme(theme) {
  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.body.classList.toggle("dark", prefersDark);
  } else {
    document.body.classList.toggle("dark", theme === "dark");
  }
}

function updateUIForPasswordType(fromInteraction = true) {
  const settings = getSettings();
  const config = PASSWORD_TYPE_CONFIG[settings.type];

  ui.characterHelp.textContent = config.help;
  Object.values(ui.checkboxes).forEach((cb) => (cb.disabled = false));
  config.disabled.forEach((id) => (ui.checkboxes[id].disabled = true));

  Object.keys(ui.sliderContainers).forEach((key) => {
    ui.sliderContainers[key].style.display =
      key === config.slider ? "" : "none";
  });

  const slider = ui.sliders[config.slider];
  const label = ui.sliderLabels[config.slider];
  slider.min = config.min;

  if (fromInteraction) {
    let value = settings[config.slider] || config.default;
    if (value < config.min) {
      value = config.min;
    }
    slider.value = value;
  }

  label.textContent = slider.value;

  saveAndGenerate();
}

function saveAndGenerate() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(getSettings()));
  generatePassword();
}

function generatePassword() {
  const settings = getSettings();
  let password = "";

  try {
    if (settings.type === "pin") {
      password = Array.from({ length: settings.length }, () =>
        randomIntInclusive(0, 9)
      ).join("");
    } else if (settings.type === "memorable") {
      const words = Array.from({ length: settings.words }, () => {
        let word = "";
        while (!word)
          word = wordlist.get(
            Array.from({ length: 5 }, () => rollDice()).join("")
          );
        if (settings.uppercase && !settings.lowercase)
          return word.toUpperCase();
        if (settings.uppercase && settings.lowercase) {
          return [...word]
            .map((c) => (secureRandomFloat() > 0.5 ? c.toUpperCase() : c))
            .join("");
        }
        return word;
      });
      password = words.join("-");
    } else {
      // random
      const charPool = Object.entries(settings)
        .filter(([key, value]) => value && CHARACTER_SETS[key])
        .map(([key]) =>
          settings.ambiguous
            ? CHARACTER_SETS[key]
            : CHARACTER_SETS[key].replace(/[l1I0Oo]/g, "")
        )
        .join("");

      if (charPool) {
        password = fisherYatesShuffle(
          Array.from(
            { length: settings.length },
            () => charPool[randomIntInclusive(0, charPool.length - 1)]
          )
        ).join("");
      } else {
        password = fisherYatesShuffle(
          Array.from(
            { length: settings.length },
            () =>
              "abcdefghijklmnopqrstuvwxyz0123456789"[randomIntInclusive(0, 35)]
          )
        ).join("");
      }
    }
  } catch (err) {
    console.error("Error generating password:", err);
    password = "error-generating";
  }

  currentPassword = password;
  ui.passwordInput.value = password;
  updateStrengthUI();
  ui.copyButton.disabled = !password;
}

function updateStrengthUI() {
  const password = ui.passwordInput.value || "";
  let score = 0;
  if (password.length > 0) {
    score += Math.min(40, password.length * 2.5);
    const variety = new Set(password).size;
    score += Math.min(40, variety * 1.5);
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/".\d."/.test(password)) score += 5;
    if (/[^a-zA-Z0-9]/.test(password)) score += 5;
  }
  score = Math.max(0, Math.min(100, score));

  const strength = score < 40 ? "weak" : score < 80 ? "average" : "strong";
  ui.strengthFill.className = `strength-fill ${strength}`;
  ui.strengthFill.style.width = `${score}%`;
  ui.strengthLabel.textContent =
    STRENGTH_LABELS[Math.floor(score / 10) * 10] || "Awful";
  ui.charCount.textContent = `${password.length} characters`;
  ui.strengthBar.setAttribute("aria-valuenow", score);
}

async function copyToClipboard() {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
    const original = ui.copyButton.innerHTML;
    ui.copyButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z"/><path fill="var(--success)" d="M21.192 5.465a1 1 0 0 1 0 1.414L9.95 18.122a1.1 1.1 0 0 1-1.556 0l-5.586-5.586a1 1 0 1 1 1.415-1.415l4.95 4.95L19.777 5.465a1 1 0 0 1 1.414 0Z"/></g></svg>';
    setTimeout(() => {
      ui.copyButton.innerHTML = original;
      ui.copyButton.disabled = false;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
}

function loadSettings() {
  const settings = JSON.parse(
    localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}"
  );
  if (settings.type) {
    ui.typeRadios.find((r) => r.value === settings.type).checked = true;
    Object.keys(ui.checkboxes).forEach(
      (id) => (ui.checkboxes[id].checked = !!settings[id])
    );

    const config = PASSWORD_TYPE_CONFIG[settings.type];
    ui.sliders[config.slider].value = settings[config.slider] || config.default;

    const otherSlider = config.slider === "length" ? "words" : "length";
    const otherConfig =
      PASSWORD_TYPE_CONFIG[otherSlider === "length" ? "random" : "memorable"];
    ui.sliders[otherSlider].value =
      settings[otherSlider] || otherConfig.default;
  }
  if (settings.theme) {
    ui.themeRadios.find((r) => r.value === settings.theme).checked = true;
    applyTheme(settings.theme);
  } else {
    applyTheme("system");
  }
}

/* Initialization */
document.addEventListener("DOMContentLoaded", async () => {
  await loadWordlist();
  loadSettings();
  updateUIForPasswordType(false);

  $("#generate-btn").addEventListener("click", generatePassword);
  $("#settings-btn").addEventListener("click", () =>
    ui.settingsSheet.classList.toggle("open")
  );
  $("#close-bottom-sheet").addEventListener("click", () =>
    ui.settingsSheet.classList.remove("open")
  );
  ui.settingsSheet.addEventListener(
    "click",
    (e) =>
      e.target === ui.settingsSheet && ui.settingsSheet.classList.remove("open")
  );
  ui.copyButton.addEventListener("click", copyToClipboard);

  ui.typeRadios.forEach((radio) =>
    radio.addEventListener("change", () => updateUIForPasswordType(true))
  );
  Object.values(ui.checkboxes).forEach((cb) =>
    cb.addEventListener("change", saveAndGenerate)
  );
  Object.values(ui.sliders).forEach((slider) => {
    slider.addEventListener("input", () => {
      const sliderId = slider.id.includes("length") ? "length" : "words";
      ui.sliderLabels[sliderId].textContent = slider.value;
    });
    slider.addEventListener("change", saveAndGenerate);
  });
  ui.themeRadios.forEach((radio) =>
    radio.addEventListener("change", () => {
      const theme = ui.themeRadios.find((r) => r.checked).value;
      applyTheme(theme);
      saveAndGenerate();
    })
  );

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const settings = getSettings();
      if (settings.theme === "system") {
        applyTheme("system");
      }
    });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "g") {
        e.preventDefault();
        generatePassword();
      }
      if (e.key === "c") {
        e.preventDefault();
        copyToClipboard();
      }
    }
  });
});
