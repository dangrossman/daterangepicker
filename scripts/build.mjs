import { build, transform } from 'esbuild';
import ts from 'typescript';
import { readFile, writeFile } from 'node:fs/promises';

const licenses = await Promise.all(['dayjs', 'cash-dom'].map(name =>
    readFile('node_modules/' + name + '/LICENSE', 'utf8')));
const notice = '/*! Date Range Picker | Copyright Dan Grossman | MIT\nGenerated from src/picker.js and src/dates.js with npm run build.\n' + licenses.join('\n') + '\n*/';
const options = { bundle: true, minify: true, target: 'es2018', legalComments: 'none', write: false };
const factory = await build({ ...options, entryPoints: ['src/picker.js'], format: 'iife', globalName: 'library' });

// Classic scripts and historical module loaders share the same standalone file.
// CommonJS optional peers preserve side-effect imports in older Browserify apps.
const umd = `(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        var loader = root.requirejs;
        var deps = ['jquery', 'moment'].filter(function(name) {
            return loader && (loader.specified(name) || loader.s.contexts._.config.paths[name]);
        });
        define(deps, function() {
            var supplied = {};
            for (var i = 0; i < deps.length; i++) supplied[deps[i]] = arguments[i];
            return factory(supplied.jquery || root.jQuery, supplied.moment || root.moment);
        });
    } else if (typeof module === 'object' && module.exports) {
        var jq = root.jQuery, dates = root.moment;
        try { if (!jq) jq = require('jquery'); } catch (_) {}
        try { if (!dates) dates = require('moment'); } catch (_) {}
        module.exports = factory(jq && jq.fn ? jq : undefined, dates);
    } else {
        root.DateRangePicker = root.daterangepicker = factory(root.jQuery, root.moment);
    }
})(typeof window === 'undefined' ? globalThis : window, function(jquery, moment) {
    ${factory.outputFiles[0].text}
    return library.createPicker(jquery, moment && (moment.default || moment));
});`;
// Keep classic script syntax compatible with the older jQuery installations.
const legacy = ts.transpileModule(umd, { compilerOptions: { target: ts.ScriptTarget.ES5 } });
const classic = await transform(legacy.outputText, { target: 'es5', minify: true });
await writeFile('daterangepicker.js', notice + '\n' + classic.code);
const esm = await build({ ...options, stdin: {
    contents: "import { createPicker } from './src/picker.js'; const Picker = createPicker(globalThis.jQuery, globalThis.moment); export { Picker as DateRangePicker, Picker as default };",
    resolveDir: process.cwd()
}, format: 'esm' });
await writeFile('daterangepicker.mjs', notice + '\n' + esm.outputFiles[0].text);

