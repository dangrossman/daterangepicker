import { build } from 'esbuild';
import { compile } from 'svelte/compiler';
import { parse, compileScript } from 'vue/compiler-sfc';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const apps = {
  react: {
    title: 'React', entry: 'main.jsx', files: ['main.jsx'],
    description: 'Attach the picker to an input ref in an effect. Returning a cleanup function also handles the extra mount cycle in Strict Mode.'
  },
  vue: {
    title: 'Vue', entry: 'main.js', files: ['ReportDates.vue', 'main.js'],
    description: 'Use a template ref in a Vue 3 single-file component. Create the picker on mount and release it before the component unmounts.'
  },
  angular: {
    title: 'Angular', entry: 'main.ts', files: ['report-dates.ts', 'main.ts'],
    description: 'Read the input with ViewChild after the view initializes. The standalone component removes its picker when Angular destroys the view.'
  },
  svelte: {
    title: 'Svelte', entry: 'main.js', files: ['ReportDates.svelte', 'main.js'],
    description: 'Bind the input element and create the picker inside onMount. Svelte calls the returned cleanup function when the component unmounts.'
  },
  esm: {
    title: 'TypeScript & ES modules', entry: 'main.ts', files: ['main.ts'],
    description: 'Import the constructor, stylesheet and option types directly from the package. The picker writes the applied range back to the input.'
  },
  commonjs: {
    title: 'CommonJS', entry: 'main.cjs', files: ['main.cjs'],
    description: 'Require the constructor from a browser bundle. The example build handles the stylesheet import and runs the app after the input exists.'
  }
};

const publicExamples = fileURLToPath(new URL('../../website/examples/', import.meta.url));
const assets = join(publicExamples, 'assets');
await mkdir(assets, { recursive: true });
const result = await build({
  absWorkingDir: root,
  entryPoints: Object.fromEntries(Object.entries(apps).map(([id, app]) => [id, id + '/' + app.entry])),
  outdir: assets,
  bundle: true,
  minify: true,
  metafile: true,
  format: 'esm',
  platform: 'browser',
  conditions: ['browser', 'production'],
  external: ['jquery', 'moment'],
  tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } },
  define: {
    'process.env.NODE_ENV': '"production"',
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    ngDevMode: 'false'
  },
  plugins: [{
    name: 'example-components',
    setup(build) {
      // Share the same checkout distribution and stylesheet as the documentation.
      // CommonJS keeps the real require() path so it exercises that package entry.
      build.onResolve({ filter: /^daterangepicker$/ }, args =>
        args.kind === 'require-call' ? undefined : { path: '../../daterangepicker.mjs', external: true });
      build.onResolve({ filter: /^daterangepicker\/daterangepicker\.css$/ }, () =>
        ({ path: 'picker-stylesheet', namespace: 'linked-css' }));
      build.onLoad({ filter: /.*/, namespace: 'linked-css' }, () => ({ contents: '', loader: 'js' }));
      build.onLoad({ filter: /\.svelte$/ }, async args => {
        const source = await readFile(args.path, 'utf8');
        const component = compile(source, { filename: args.path, generate: 'client' });
        return { contents: component.js.code, resolveDir: dirname(args.path) };
      });
      build.onLoad({ filter: /\.vue$/ }, async args => {
        const source = await readFile(args.path, 'utf8');
        const { descriptor } = parse(source, { filename: args.path });
        const component = compileScript(descriptor, { id: 'report-dates', inlineTemplate: true });
        return { contents: component.content, resolveDir: dirname(args.path) };
      });
    }
  }]
});

// Ship the notices for the runtime code included in each downloadable bundle.
const packages = new Set();
for (const input of Object.keys(result.metafile.inputs)) {
  const match = /^node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(input);
  if (match) packages.add(match[1]);
}
const notices = [];
for (const name of [...packages].sort()) {
  const folder = join(root, 'node_modules', name);
  const file = (await readdir(folder)).find(name => /^licen[cs]e(\.|$)/i.test(name));
  if (file) notices.push(name + '\n\n' + await readFile(join(folder, file), 'utf8'));
}
await writeFile(join(assets, 'licenses.txt'), notices.join('\n\n'));

function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

for (const [id, app] of Object.entries(apps)) {
  const directory = join(root, id);
  const markup = id === 'angular' ? '<report-dates></report-dates>'
    : ['esm', 'commonjs'].includes(id) ? '<label>Report dates<input id="dates" type="text"></label>'
    : '<div id="app"></div>';
  const sources = [];
  for (const file of app.files) sources.push([file, (await readFile(join(directory, file), 'utf8')).trimEnd()]);
  sources.push(['index.html', `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Report dates</title>
  <link rel="stylesheet" href="../../daterangepicker.css">
  <script type="module" src="../assets/${id}.js"></script>
</head>
<body>
  ${markup}
</body>
</html>`]);
  const examples = sources.map(([file, code], index) =>
    '<details' + (index === 0 ? ' open' : '') + '><summary>' + file +
    '</summary><pre><code>' + escapeHtml(code) + '</code></pre></details>').join('\n');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9095657276960731" crossorigin="anonymous"></script>
  <title>${escapeHtml(app.title)} example · Date Range Picker</title>
  <link rel="stylesheet" href="../../website.css">
  <link rel="stylesheet" href="../../native/guide.css">
  <link rel="stylesheet" href="../../daterangepicker.css">
  <link rel="stylesheet" href="../examples.css">
  <script type="module" src="../assets/${id}.js"></script>
</head>
<body class="subpage">
  <header class="shell guide-header">
    <a class="wordmark" href="../../">Date Range Picker</a>
    <a href="../../#integrations">Integrations</a>
  </header>
  <main class="shell guide-page example-page">
    <h1>${escapeHtml(app.title)}</h1>
    <p class="guide-lead">${escapeHtml(app.description)}</p>
    <section class="demo" aria-label="Interactive date picker">${markup}</section>
    <h2>App source</h2>
    ${examples}
    <details><summary>Run this example locally</summary>
      <p>Serve the <code>website</code> directory over HTTP and open <code>/examples/${id}/</code>. To edit the app, change its files in <code>example/integrations/${id}</code> and run these commands from <code>example/integrations</code>.</p>
      <pre><code>npm ci
npm run build</code></pre>
    </details>
    <p class="example-links"><a href="../../#usage">Install the picker</a><a href="../assets/licenses.txt">Third-party licenses</a></p>
  </main>

<!-- W3Counter -->
<script src="https://www.w3counter.com/tracker.js?id=90840"></script>

<!-- Improvely -->
<script type="text/javascript">
var im_domain = 'awio';
var im_project_id = 48;
(function(e,t){window._improvely=[];var n=e.getElementsByTagName("script")[0];var r=e.createElement("script");r.type="text/javascript";r.src="https://"+im_domain+".iljmp.com/improvely.js";r.async=true;n.parentNode.insertBefore(r,n);if(typeof t.init=="undefined"){t.init=function(e,t){window._improvely.push(["init",e,t])};t.goal=function(e){window._improvely.push(["goal",e])};t.conversion=function(e){window._improvely.push(["conversion",e])};t.label=function(e){window._improvely.push(["label",e])}}window.improvely=t;t.init(im_domain,im_project_id)})(document,window.improvely||[])
</script>
</body>
</html>
`;
  const publicDirectory = join(publicExamples, id);
  await mkdir(publicDirectory, { recursive: true });
  await writeFile(join(publicDirectory, 'index.html'), html);
}

