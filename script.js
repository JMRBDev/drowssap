/* Password Generator — Readable Refactor */

const CHARACTER_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  ambiguous: "l1I0Oo",
};

const STRENGTH_LABELS = {
  0: "Awful",
  10: "Awful",
  20: "Very weak",
  30: "Very weak",
  40: "Weak",
  50: "Weak",
  60: "Average",
  70: "Good",
  80: "Strong",
  90: "Very strong",
  100: "Outstanding",
};

const PASSWORD_TYPE_CONFIG = {
  pin: {
    checkboxes: {
      lowercase: false,
      uppercase: false,
      numbers: true,
      symbols: false,
      ambiguous: false,
    },
    disabled: {
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: true,
      ambiguous: true,
    },
    helpText:
      "PIN passwords only use numbers (0-9). All other types are disabled.",
    sliderMin: 4,
    sliderDefault: 4,
  },
  memorable: {
    checkboxes: {
      lowercase: true,
      uppercase: true,
      numbers: false,
      symbols: false,
      ambiguous: false,
    },
    disabled: {
      lowercase: false,
      uppercase: false,
      numbers: true,
      symbols: true,
      ambiguous: true,
    },
    helpText:
      "Memorable passwords only use readable words separated by hyphens.",
    sliderMin: 8,
    sliderDefault: 16,
  },
  random: {
    checkboxes: {
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: true,
      ambiguous: false,
    },
    disabled: {
      lowercase: false,
      uppercase: false,
      numbers: false,
      symbols: false,
      ambiguous: false,
    },
    helpText: "Select which character types to include in your password.",
    sliderMin: 8,
    sliderDefault: 16,
  },
};

const select = (q, ctx = document) => ctx.querySelector(q);
const selectAll = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

const ui = {
  passwordInput: select("#generated-password"),
  strengthFill: select(".strength-fill"),
  strengthLabel: select(".strength-label"),
  strengthBar: select(".strength-bar"),
  lengthSlider: select("#password-length-slider"),
  lengthLabel: select("#password-length-slider-container .slider-label"),
  settingsButton: select("#settings-btn"),
  copyButton: select("#copy-btn"),
  generateButton: select("#generate-btn"),
  bottomSheet: select(".bottom-sheet-container"),
  charCount: select("#char-count"),
  characterHelp: select("#character-help"),
  typeRadios: selectAll('input[name="password-type"]'),
  checkboxes: {
    lowercase: select("#lowercase-checkbox"),
    uppercase: select("#uppercase-checkbox"),
    numbers: select("#numbers-checkbox"),
    symbols: select("#symbols-checkbox"),
    ambiguous: select("#ambiguous-characters-checkbox"),
  },
};

const SETTINGS_STORAGE_KEY = "passwordGeneratorSettings";
let currentPassword = "";

const DICTIONARY_WORDS = [
  "apple",
  "banana",
  "cherry",
  "dragon",
  "eagle",
  "forest",
  "garden",
  "house",
  "island",
  "jungle",
  "knight",
  "lemon",
  "mountain",
  "ocean",
  "planet",
  "queen",
  "river",
  "sunset",
  "tiger",
  "umbrella",
  "village",
  "window",
  "yellow",
  "zebra",
];

/* RNG utilities */
const secureRandomFloat = () => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / (0xffffffff + 1);
};

const randomIntInclusive = (min, max) =>
  Math.floor(secureRandomFloat() * (max - min + 1)) + min;

const fisherYatesShuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomIntInclusive(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/* UI state helpers */
const getSelectedPasswordType = () =>
  ui.typeRadios.find((r) => r.checked)?.value || "random";

const getCharacterOptions = () => ({
  lowercase: ui.checkboxes.lowercase.checked,
  uppercase: ui.checkboxes.uppercase.checked,
  numbers: ui.checkboxes.numbers.checked,
  symbols: ui.checkboxes.symbols.checked,
  ambiguous: ui.checkboxes.ambiguous.checked,
});

const applyCheckboxStates = (checkedMap, disabledMap) => {
  for (const key of Object.keys(ui.checkboxes)) {
    if (checkedMap && key in checkedMap) {
      ui.checkboxes[key].checked = checkedMap[key];
    }
    if (disabledMap && key in disabledMap) {
      ui.checkboxes[key].disabled = disabledMap[key];
    }
  }
};

const updateLengthUI = (value, min) => {
  if (typeof min === "number") ui.lengthSlider.min = String(min);
  if (typeof value === "number") ui.lengthSlider.value = String(value);
  ui.lengthLabel.textContent = ui.lengthSlider.value;
};

const getStrengthLabel = (score) =>
  STRENGTH_LABELS[Math.floor(score / 10) * 10] || STRENGTH_LABELS[100];

/* Settings apply/load/save */
const applyPasswordTypeConfigToUI = (type, opts = {}) => {
  const cfg = PASSWORD_TYPE_CONFIG[type] || PASSWORD_TYPE_CONFIG.random;
  const { preserveChars = false, preserveLength = false } = opts;

  ui.characterHelp.textContent = cfg.helpText;
  applyCheckboxStates(null, cfg.disabled);

  if (!preserveChars) applyCheckboxStates(cfg.checkboxes, null);

  const parsed = parseInt(ui.lengthSlider.value, 10);
  const hasLength = Number.isFinite(parsed) && parsed > 0;
  const currentLen = hasLength ? parsed : 0;
  const min = cfg.sliderMin ?? 8;

  if (preserveLength) {
    updateLengthUI(Math.max(currentLen, min), min);
  } else {
    const desired = cfg.sliderDefault ?? Math.max(currentLen || min, min);
    updateLengthUI(desired, min);
  }
};

const getSettingsFromUI = () => ({
  passwordType: getSelectedPasswordType(),
  passwordLength: parseInt(ui.lengthSlider.value, 10),
  characters: getCharacterOptions(),
});

const applySettingsToUI = (settings, { preserveChars = true } = {}) => {
  const type = settings.passwordType || "random";
  const radio = select(`input[name="password-type"][value="${type}"]`);
  if (radio) radio.checked = true;

  const cfg = PASSWORD_TYPE_CONFIG[type] || PASSWORD_TYPE_CONFIG.random;
  const len = parseInt(settings.passwordLength, 10);
  const hasValidLength = Number.isFinite(len) && len > 0;

  if (hasValidLength) {
    updateLengthUI(len, undefined);
  } else {
    const fallback = cfg.sliderDefault ?? cfg.sliderMin ?? 8;
    updateLengthUI(fallback, undefined);
  }

  // Enforce min for the selected type:
  // - Non-PIN types clamp to >= sliderMin (8)
  // - PIN clamps to >= 4
  applyPasswordTypeConfigToUI(type, {
    preserveChars,
    preserveLength: true,
  });

  if (preserveChars) applyCheckboxStates(settings.characters, null);
};

const saveSettings = () =>
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(getSettingsFromUI())
  );

const loadSettings = () => {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return false;
  try {
    const settings = JSON.parse(raw);
    applySettingsToUI(settings, { preserveChars: true });
    return true;
  } catch {
    return false;
  }
};

/* Password generation */
const ensureUppercaseWhenEnabled = (password, allowAmbiguous) => {
  if (!ui.checkboxes.uppercase?.checked) return password;
  if (/[A-Z]/.test(password)) return password;

  const lowercaseIndex = password
    .split("")
    .findIndex(
      (ch) =>
        /[a-z]/.test(ch) && (allowAmbiguous || !/[IO]/.test(ch.toUpperCase()))
    );

  if (lowercaseIndex !== -1) {
    return (
      password.slice(0, lowercaseIndex) +
      password[lowercaseIndex].toUpperCase() +
      password.slice(lowercaseIndex + 1)
    );
  }

  const uppercasePool = allowAmbiguous
    ? CHARACTER_SETS.uppercase
    : CHARACTER_SETS.uppercase.replace(/[IO]/g, "");
  const chars = password.split("");
  chars[randomIntInclusive(0, chars.length - 1)] =
    uppercasePool[randomIntInclusive(0, uppercasePool.length - 1)];
  return chars.join("");
};

const buildSelectedCharacterSets = () => {
  const options = getCharacterOptions();
  const sets = [];
  if (options.lowercase) sets.push(CHARACTER_SETS.lowercase);
  if (options.uppercase) sets.push(CHARACTER_SETS.uppercase);
  if (options.numbers) sets.push(CHARACTER_SETS.numbers);
  if (options.symbols) sets.push(CHARACTER_SETS.symbols);

  if (options.ambiguous) {
    sets.push(CHARACTER_SETS.ambiguous);
  } else {
    for (let i = 0; i < sets.length; i++) {
      sets[i] = sets[i].replace(/[l1I0Oo]/g, "");
    }
  }
  return sets;
};

const generatePin = (length) => {
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += randomIntInclusive(0, 9);
  }
  return pin;
};

const generateRandomPassword = (length, characterSets) => {
  if (!characterSets.length)
    throw new Error("At least one character set required");
  let password = "";
  const baseCount = Math.floor(length / characterSets.length);
  const remainder = length % characterSets.length;

  characterSets.forEach((set, index) => {
    const count = baseCount + (index < remainder ? 1 : 0);
    for (let i = 0; i < count; i++) {
      password += set[randomIntInclusive(0, set.length - 1)];
    }
  });

  return fisherYatesShuffle(password.split("")).join("");
};

const generateMemorablePassword = (length, options) => {
  const opts = options || getCharacterOptions();

  if (!opts.lowercase && !opts.uppercase) opts.lowercase = true;

  let result = "";
  const targetLength = Math.max(1, length);

  while (result.length < targetLength) {
    let word =
      DICTIONARY_WORDS[randomIntInclusive(0, DICTIONARY_WORDS.length - 1)];

    if (!opts.lowercase && opts.uppercase) word = word.toUpperCase();

    if (opts.lowercase && opts.uppercase && secureRandomFloat() > 0.5) {
      const candidateIndices = [];
      for (let i = 0; i < word.length; i++) {
        const upper = word[i].toUpperCase();
        if (!opts.ambiguous && (upper === "I" || upper === "O")) continue;
        candidateIndices.push(i);
      }
      if (candidateIndices.length) {
        const idx =
          candidateIndices[randomIntInclusive(0, candidateIndices.length - 1)];
        word =
          word.slice(0, idx) + word[idx].toUpperCase() + word.slice(idx + 1);
      }
    }

    if (result.length) result += "-";
    result += word;

    if (result.length >= targetLength) break;
  }

  while (result.length < targetLength) {
    const pools = [];
    if (opts.lowercase) pools.push(CHARACTER_SETS.lowercase);
    if (opts.uppercase) pools.push(CHARACTER_SETS.uppercase);
    if (!pools.length) pools.push(CHARACTER_SETS.lowercase);

    const pool = pools[randomIntInclusive(0, pools.length - 1)];
    const ch = pool[randomIntInclusive(0, pool.length - 1)];
    if (!opts.ambiguous && CHARACTER_SETS.ambiguous.includes(ch)) continue;
    result += ch;
  }

  return result.slice(0, targetLength);
};

const generatePassword = () => {
  const type = getSelectedPasswordType();
  const length = parseInt(ui.lengthSlider.value, 10);
  let password = "";

  try {
    switch (type) {
      case "pin":
        password = generatePin(length);
        break;
      case "memorable":
        password = generateMemorablePassword(length, getCharacterOptions());
        password = ensureUppercaseWhenEnabled(
          password,
          ui.checkboxes.ambiguous.checked
        );
        break;
      case "random":
      default: {
        const sets = buildSelectedCharacterSets();
        password = sets.length
          ? generateRandomPassword(length, sets)
          : generateRandomPassword(length, [
              CHARACTER_SETS.lowercase,
              CHARACTER_SETS.numbers,
            ]);
        password = ensureUppercaseWhenEnabled(
          password,
          ui.checkboxes.ambiguous.checked
        );
        break;
      }
    }
  } catch (err) {
    console.error("Error generating password:", err);
    password = "password123";
  }

  currentPassword = password;
  ui.passwordInput.value = password;
  updateStrengthUI();
  updateCopyButtonState();
};

/* Strength meter */
const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;
  const length = password.length;

  // Length up to 40 points
  score += Math.min(40, length * 4);

  // Variety up to 40 points
  const variety =
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);
  score += variety * 10;

  // Bonuses
  if (variety >= 3 && length >= 8) score += 10;
  if (length >= 12) score += 10;

  // Penalties
  if (/(.)\1{2,}/.test(password)) score -= 10;
  if (
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password
    )
  ) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
};

const updateStrengthUI = () => {
  const password = ui.passwordInput.value || "";
  const score = calculatePasswordStrength(password);

  ui.strengthFill.classList.remove("weak", "average", "strong");
  if (score < 60) ui.strengthFill.classList.add("weak");
  else if (score < 80) ui.strengthFill.classList.add("average");
  else ui.strengthFill.classList.add("strong");

  const label = getStrengthLabel(score);
  ui.strengthLabel.innerText = label;
  ui.strengthFill.style.width = `${score}%`;
  ui.charCount.textContent = String(password.length);

  if (ui.strengthBar) {
    ui.strengthBar.setAttribute("aria-valuenow", String(score));
    ui.strengthBar.setAttribute(
      "aria-label",
      `Password strength: ${label} (${score}%)`
    );
  }
};

const updateCopyButtonState = () => {
  ui.copyButton.disabled = !currentPassword;
};

/* Clipboard */
const copyPasswordToClipboard = async () => {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
    const original = ui.copyButton.innerHTML;
    ui.copyButton.innerHTML = '<img src="/assets/check.svg" alt="" />';
    ui.copyButton.disabled = true;
    setTimeout(() => {
      ui.copyButton.innerHTML = original;
      ui.copyButton.disabled = false;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy password:", e);
    ui.passwordInput.select();
    document.execCommand("copy");
  }
};

/* Bottom sheet (settings) */
const toggleSettingsSheet = () => ui.bottomSheet.classList.toggle("open");
const handleSheetOutsideClick = (event) => {
  if (event.target === ui.bottomSheet) ui.bottomSheet.classList.remove("open");
};

/* Events */
const registerEventListeners = () => {
  ui.passwordInput.addEventListener("input", updateStrengthUI);

  ui.lengthSlider.addEventListener("input", () => {
    ui.lengthLabel.textContent = ui.lengthSlider.value;
    saveSettings();
  });
  ui.lengthSlider.addEventListener("change", generatePassword);

  ui.generateButton.addEventListener("click", generatePassword);
  ui.copyButton.addEventListener("click", copyPasswordToClipboard);
  ui.settingsButton.addEventListener("click", toggleSettingsSheet);
  ui.bottomSheet.addEventListener("click", handleSheetOutsideClick);

  Object.values(ui.checkboxes).forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.disabled) return;
      saveSettings();
      generatePassword();
    });
  });

  ui.typeRadios.forEach((radio) =>
    radio.addEventListener("change", () => {
      const type = getSelectedPasswordType();
      applyPasswordTypeConfigToUI(type, {
        preserveChars: false,
        preserveLength: false,
      });
      saveSettings();
      generatePassword();
    })
  );

  document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key === "g") {
      event.preventDefault();
      generatePassword();
    } else if (
      event.key === "c" &&
      document.activeElement === ui.passwordInput
    ) {
      event.preventDefault();
      copyPasswordToClipboard();
    }
  });
};

/* Init */
const initializeApp = () => {
  if (!loadSettings()) {
    const defaultType = "random";
    const radio = select(`input[name="password-type"][value="${defaultType}"]`);
    if (radio) radio.checked = true;

    applyPasswordTypeConfigToUI(defaultType, {
      preserveChars: false,
      preserveLength: false, // uses sliderDefault for the type
    });

    saveSettings();
  }
  registerEventListeners();
  generatePassword();
};

initializeApp();
