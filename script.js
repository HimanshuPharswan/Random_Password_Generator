// ===== Settings: change how passwords are made here =====

// The kinds of characters. The names match the value="..." of the switches in index.html.
const CHARACTER_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
};

// Characters removed when "Leave out look-alike characters" is on
const LOOK_ALIKES = 'Il1|O0o';

// Shortest and longest length allowed. Also change min and max on both length inputs in index.html.
const MIN_LENGTH = 4;
const MAX_LENGTH = 64;

// Strength labels, by the number of bits of randomness (more bits means more guesses needed)
const STRENGTH_LEVELS = [
    { below: 45, label: 'Weak' },
    { below: 65, label: 'Fair' },
    { below: 90, label: 'Strong' },
    { below: Infinity, label: 'Very strong' }
];

// Fewest random characters kept next to your own word. If the word doesn't leave room for these,
// the password gets longer than the chosen length.
const MIN_RANDOM_WITH_WORD = 4;

// How long the Copy button says "Copied", in milliseconds
const COPIED_TIME = 1600;


// ===== Page elements =====
const passwordOutput = document.getElementById('password');
const lengthSlider = document.getElementById('length');
const lengthNumber = document.getElementById('length-number');
const setSwitches = document.querySelectorAll('input[data-set]');
const avoidSimilar = document.getElementById('avoid-similar');
const optionsError = document.getElementById('options-error');
const strengthBox = document.getElementById('strength');
const strengthLabel = document.getElementById('strength-label');
const strengthBits = document.getElementById('strength-bits');
const copyButton = document.getElementById('copy');
const copyLabel = document.getElementById('copy-label');
const regenerateButton = document.getElementById('regenerate');
const statusMessage = document.getElementById('status');
const wordInput = document.getElementById('word');
const placeRadios = document.querySelectorAll('input[name="place"]');
const wordNote = document.getElementById('word-note');
const WORD_NOTE_TEXT = wordNote.textContent;
const themeSwitch = document.getElementById('theme-switch');

let currentPassword = '';
let copiedTimer;


// ===== Secure randomness =====

// A whole number from 0 up to (not including) max, from the browser's secure random generator.
// Values that would make some numbers more likely than others are thrown away and drawn again.
function randomIndex(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buffer = new Uint32Array(1);
    do {
        crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);
    return buffer[0] % max;
}

function randomCharacter(characters) {
    return characters[randomIndex(characters.length)];
}

// Mixes the characters into a random order (Fisher-Yates shuffle)
function shuffle(characters) {
    for (let i = characters.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1);
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }
    return characters;
}


// ===== Making the password =====
function chosenSets() {
    const leaveOut = avoidSimilar.checked ? LOOK_ALIKES : '';
    return Array.from(setSwitches)
        .filter(input => input.checked)
        .map(input => Array.from(CHARACTER_SETS[input.dataset.set]).filter(c => !leaveOut.includes(c)).join(''))
        .filter(characters => characters.length > 0);
}

function chosenLength() {
    const value = parseInt(lengthSlider.value, 10);
    return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, value));
}

function makeRandomPart(length, sets) {
    const allCharacters = sets.join('');
    // One character from each chosen kind, so every kind you switched on appears
    const characters = sets.map(randomCharacter);
    while (characters.length < length) {
        characters.push(randomCharacter(allCharacters));
    }
    return shuffle(characters).slice(0, length);
}

function chosenWord() {
    return wordInput.value.trim();
}

function chosenPlace() {
    const checked = document.querySelector('input[name="place"]:checked');
    return checked ? checked.value : 'anywhere';
}

// Where the word goes among the random characters: the start, the end, or a random spot
function wordPosition(randomCount, place) {
    if (place === 'start') return 0;
    if (place === 'end') return randomCount;
    return randomIndex(randomCount + 1);
}

// Shows each random character in its own color. The word stays in one piece,
// so joined letters (such as Hindi text or emoji) are drawn correctly.
function showPassword(randomPart, wordAt, word) {
    passwordOutput.replaceChildren();
    const pieces = [...randomPart.slice(0, wordAt), word, ...randomPart.slice(wordAt)].filter(Boolean);
    pieces.forEach((piece, i) => {
        const span = document.createElement('span');
        span.textContent = piece;
        span.style.setProperty('--i', i);
        if (piece === word && i === wordAt) span.className = 'is-word';
        else if (CHARACTER_SETS.digits.includes(piece)) span.className = 'is-digit';
        else if (CHARACTER_SETS.symbols.includes(piece)) span.className = 'is-symbol';
        passwordOutput.append(span);
    });
    // Restarts the drop-in animation
    passwordOutput.classList.remove('fresh');
    void passwordOutput.offsetWidth;
    passwordOutput.classList.add('fresh');
}

function showStrength(length, poolSize) {
    const bits = Math.round(length * Math.log2(poolSize));
    const index = STRENGTH_LEVELS.findIndex(level => bits < level.below);
    strengthBox.dataset.level = index + 1;
    strengthLabel.textContent = STRENGTH_LEVELS[index].label;
    strengthBits.textContent = `≈ ${bits} bits`;
}

function generate(announceIt) {
    const sets = chosenSets();
    const hasSets = sets.length > 0;
    optionsError.hidden = hasSets;
    copyButton.disabled = !hasSets;
    regenerateButton.disabled = !hasSets;
    // Dims the last password, so it doesn't look like a match for the current choices
    passwordOutput.classList.toggle('is-stale', !hasSets);
    strengthBox.classList.toggle('is-stale', !hasSets);
    if (!hasSets) return;

    const length = chosenLength();
    const word = chosenWord();
    const wordLength = Array.from(word).length;
    const randomCount = word ? Math.max(length - wordLength, MIN_RANDOM_WITH_WORD) : length;
    const randomPart = makeRandomPart(randomCount, sets);
    const wordAt = word ? wordPosition(randomCount, chosenPlace()) : randomCount;
    const password = randomPart.slice(0, wordAt).join('') + word + randomPart.slice(wordAt).join('');
    const total = randomCount + wordLength;

    currentPassword = password;
    showPassword(randomPart, wordAt, word);
    showStrength(randomCount, sets.join('').length);
    wordNote.textContent = total > length
        ? `Your word needs room for at least ${MIN_RANDOM_WITH_WORD} random characters, so this password is ${total} characters long.`
        : WORD_NOTE_TEXT;
    resetCopyButton();
    if (announceIt) announce(`New ${total}-character password made.`);
}

function announce(message) {
    statusMessage.textContent = '';
    // A short pause lets screen readers repeat the same message
    setTimeout(() => { statusMessage.textContent = message; }, 50);
}


// ===== Length controls =====
lengthSlider.addEventListener('input', () => {
    lengthNumber.value = lengthSlider.value;
    generate(false);
});

lengthNumber.addEventListener('input', () => {
    const value = parseInt(lengthNumber.value, 10);
    if (value >= MIN_LENGTH && value <= MAX_LENGTH) {
        lengthSlider.value = value;
        generate(false);
    }
});

// Fixes an out-of-range number when you leave the box
lengthNumber.addEventListener('change', () => {
    const value = parseInt(lengthNumber.value, 10);
    const fixed = Number.isNaN(value) ? lengthSlider.value : Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, value));
    lengthNumber.value = fixed;
    lengthSlider.value = fixed;
    generate(false);
});


// ===== Switches and buttons =====
setSwitches.forEach(input => input.addEventListener('change', () => generate(true)));
avoidSimilar.addEventListener('change', () => generate(true));
wordInput.addEventListener('input', () => generate(false));
placeRadios.forEach(input => input.addEventListener('change', () => generate(true)));
regenerateButton.addEventListener('click', () => generate(true));

// Enter in the length box makes a new password
lengthNumber.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        lengthNumber.dispatchEvent(new Event('change'));
        announce(`New ${chosenLength()}-character password made.`);
    }
});

function resetCopyButton() {
    clearTimeout(copiedTimer);
    copyButton.classList.remove('copied');
    copyLabel.textContent = 'Copy';
}

function copyBySelecting() {
    const range = document.createRange();
    range.selectNodeContents(passwordOutput);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (copyError) {
        copied = false;
    }
    return copied;
}

copyButton.addEventListener('click', async () => {
    let copied = false;
    try {
        await navigator.clipboard.writeText(currentPassword);
        copied = true;
    } catch (clipboardError) {
        copied = copyBySelecting();
    }

    if (copied) {
        copyButton.classList.add('copied');
        copyLabel.textContent = 'Copied';
        announce('Password copied.');
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(resetCopyButton, COPIED_TIME);
    } else {
        // The password is selected, so it can be copied by hand
        announce('Copying is blocked here. The password is selected, so press Ctrl+C or Cmd+C.');
    }
});


// ===== Dark theme button =====
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
    const picked = document.documentElement.getAttribute('data-theme');
    if (picked) return picked;
    return systemDark.matches ? 'dark' : 'light';
}

function updateThemeSwitch() {
    const dark = currentTheme() === 'dark';
    themeSwitch.dataset.show = dark ? 'sun' : 'moon';
    themeSwitch.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    const barColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute('content', barColor));
}

themeSwitch.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
        localStorage.setItem('pw-theme', next);
    } catch (storageError) {
        // Storage is blocked, so the choice lasts until the page is closed.
    }
    updateThemeSwitch();
});

systemDark.addEventListener('change', updateThemeSwitch);


// ===== Start =====
updateThemeSwitch();
generate(false);
