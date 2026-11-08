(() => {
  const get = id => document.getElementById(id);
  const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function renderCode(id, source) {
    // Highlight only tokens from our examples. Escape the text before inserting it.
    const tokens = source.split(/("[^"\n]*"|'[^'\n]*'|\b(?:const|new|import|from|function|return)\b|<\/?[\w-]+)/g);
    get(id).innerHTML = tokens.map((token, index) => {
      if (index % 2 === 0) return escape(token);
      return '<span class="' + (/^["']/.test(token) ? 'str' : 'token') + '">' + escape(token) + '</span>';
    }).join('');
  }

  const start = new Date();
  start.setDate(12);
  const end = new Date(start);
  end.setDate(18);
  const compact = matchMedia('(max-width: 500px)');
  function setupPlayground(first, last) {
    const picker = new DateRangePicker('#hero-range', {
      parentEl: '#hero-calendar', startDate: first, endDate: last,
      autoApply: true, singleCalendar: compact.matches,
      locale: { format: 'MMM D, YYYY', separator: '   →   ' }
    });
    picker.show();
    return picker;
  }
  let playground = setupPlayground(start, end);
  // This example stays open, so readers can make several selections in a row.
  get('hero-range').addEventListener('hide.daterangepicker', () => {
    queueMicrotask(() => { if (!playground.isShowing) playground.show(); });
  });
  compact.addEventListener('change', () => {
    playground = setupPlayground(playground.startDate.toDate(), (playground.endDate || playground.startDate).toDate());
  });

  get('package-manager').addEventListener('change', event => {
    const command = { npm: 'npm install', pnpm: 'pnpm add', Yarn: 'yarn add', Bun: 'bun add' }[event.target.value];
    get('install-command').textContent = command + ' ./daterangepicker-4.0.2.tgz';
  });
  document.querySelector('.mobile-menu nav').addEventListener('click', () => {
    document.querySelector('.mobile-menu').open = false;
  });
  const basic = get('install-code').textContent;
  renderCode('hosted-code', get('hosted-code').textContent);
  const installs = {
    browser: ['index.html', basic, 'Place the JavaScript and CSS beside your page.', 'native/classic.html'],
    module: ['index.html', `<link rel="stylesheet" href="./daterangepicker.css">
<label for="dates">Report dates</label>
<input id="dates">

<script type="module">
  import DateRangePicker from './daterangepicker.mjs';
  new DateRangePicker('#dates');
</script>`, 'Serve the files over HTTP to load browser modules.', 'native/module.html'],
    package: ['main.js', `import DateRangePicker from 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
new DateRangePicker('#dates');`, 'Mount an input with id="dates" before running this module.', 'examples/esm/']
  };
  function selectInstall(button) {
    for (const tab of document.querySelectorAll('[data-install]')) tab.setAttribute('aria-pressed', tab === button);
    const [filename, source, note, url] = installs[button.dataset.install];
    get('package-setup').hidden = button.dataset.install !== 'package';
    get('code-name').textContent = filename;
    renderCode('install-code', source);
    get('install-note').textContent = note;
    get('install-demo').href = url;
  }
  for (const button of document.querySelectorAll('[data-install]')) {
    button.addEventListener('click', () => selectInstall(button));
  }
  selectInstall(document.querySelector('[data-install=browser]'));

  for (const sample of document.querySelectorAll('.samples')) {
    renderCode(sample.querySelector('code').id, sample.querySelector('script').textContent.trim());
  }

  for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', async () => {
      const code = get(button.dataset.copy);
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = 'Copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = document.execCommand('copy') ? 'Copied' : 'Select & copy';
      }
      setTimeout(() => { button.textContent = 'Copy'; }, 1600);
    });
  }

  const sections = [...document.querySelectorAll('.side a[href^="#"]')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of sections) link.classList.toggle('current', link.hash === '#' + entry.target.id);
    }
  }, { rootMargin: '0px 0px -65% 0px' });
  for (const link of sections) observer.observe(document.querySelector(link.hash));

  // Keep links from the v3 documentation usable after the redesign.
  function followLegacyLink() {
    const hash = location.hash.slice(1);
    if (['options', 'events', 'methods'].includes(hash)) location.replace('reference.html#' + hash);
    if (hash === 'config') location.replace('config.html#config');
  }
  window.addEventListener('hashchange', followLegacyLink);
  followLegacyLink();
})();
