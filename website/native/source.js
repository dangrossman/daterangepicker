// Build the portable example from the same input and script that power the demo.
const app = document.getElementById('app');
const scripts = Array.from(document.querySelectorAll('script[data-file]'), script =>
  '  <script src="' + script.dataset.file + '"></script>'
);
const controls = Array.from(document.querySelectorAll('.live-panel label, .live-panel input, .live-panel output'), control => {
  const copy = control.cloneNode(false);
  copy.removeAttribute('class');
  copy.removeAttribute('value');
  if (control.tagName === 'LABEL') copy.textContent = control.textContent;
  return '  ' + copy.outerHTML;
});
const documentSource = [
  '<!doctype html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="utf-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  '  <title>Date Range Picker example</title>',
  '  <link rel="stylesheet" href="daterangepicker.css">',
  '</head>',
  '<body>',
  ...controls,
  ...scripts,
  app.type === 'module' ? '  <script type="module">' : '  <script>',
  app.textContent.trim().split('\n').map(line => line ? '    ' + line : '').join('\n'),
  '  </script>',
  '</body>',
  '</html>'
].join('\n');

const source = document.getElementById('source');
source.textContent = documentSource;

const copyButton = document.getElementById('copy');
copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(documentSource);
    copyButton.textContent = 'Copied';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges();
    selection.addRange(range);
    copyButton.textContent = 'Selected for copying';
  }
  window.setTimeout(() => { copyButton.textContent = 'Copy HTML'; }, 2200);
});
