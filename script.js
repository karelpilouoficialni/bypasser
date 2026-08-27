const LETTERS = {
  A: "а",
  E: "е",
  Y: "у",
  K: "к",
  H: "н",
  X: "х",
  B: "в",
  P: "р",
  O: "о",
  M: "м",
  C: "с",
  T: "т",
};

const checkboxes = Array.from(document.querySelectorAll('#checkboxes [data-letter]'));
const input = document.getElementById('input');
const output = document.getElementById('output');
const replaceBtn = document.getElementById('replace');
const copyBtn = document.getElementById('copy');
const selectAllBtn = document.getElementById('select-all');
const deselectAllBtn = document.getElementById('deselect-all');

let resultText = '';

const replacementMap = new Map(
  Object.entries(LETTERS).map(([latin, cyr]) => [latin, cyr])
);

function selectedLetters() {
  return [...replacementMap.keys()].filter((letter) => {
    const box = checkboxes.find((c) => c.dataset.letter === letter);
    return box && box.checked;
  });
}

function updateButtons() {
  const hasText = input.value.length > 0;
  const hasSelection = selectedLetters().length > 0;
  replaceBtn.disabled = !(hasText && hasSelection);
  copyBtn.disabled = resultText.length === 0;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceOne(char) {
  const upper = char.toUpperCase();
  const cyr = replacementMap.get(upper);
  return char === upper ? cyr.toUpperCase() : cyr.toLowerCase();
}

function replaceText() {
  const selected = selectedLetters();
  if (selected.length === 0) return;

  const charClass = `[${selected.map(escapeRegExp).join('')}]`;
  const charPattern = new RegExp(charClass, 'gi');
  const text = input.value;

  resultText = text.replace(new RegExp(charClass, 'gi'), replaceOne);
  output.innerHTML = '';

  let lastIndex = 0;
  let match;
  while ((match = charPattern.exec(text)) !== null) {
    output.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    const span = document.createElement('span');
    span.className = 'cyr';
    span.textContent = replaceOne(match[0]);
    output.appendChild(span);
    lastIndex = match.index + match[0].length;
    if (charPattern.lastIndex === match.index) charPattern.lastIndex++;
  }
  output.appendChild(document.createTextNode(text.slice(lastIndex)));

  updateButtons();
}

input.addEventListener('input', updateButtons);
checkboxes.forEach((box) => box.addEventListener('change', updateButtons));

replaceBtn.addEventListener('click', replaceText);

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(resultText);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = 'Copy Result';
  }, 1500);
});

selectAllBtn.addEventListener('click', () => {
  checkboxes.forEach((box) => (box.checked = true));
  updateButtons();
});

deselectAllBtn.addEventListener('click', () => {
  checkboxes.forEach((box) => (box.checked = false));
  updateButtons();
});

updateButtons();
