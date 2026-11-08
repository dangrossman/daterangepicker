import { copyFile, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = resolve(root, 'website');
for (const name of ['daterangepicker.css', 'daterangepicker.js', 'daterangepicker.mjs']) {
    await copyFile(resolve(root, name), resolve(site, name));
}
const vendor = resolve(site, 'native/vendor');
await copyFile(resolve(root, 'moment.min.js'), resolve(vendor, 'moment.min.js'));
await copyFile(resolve(root, 'example/amd/require.js'), resolve(vendor, 'require.js'));

// Replace the generated export so removed pages and older layouts don't linger.
const output = resolve(root, 'dist/docs');
await rm(output, { recursive: true, force: true });
await cp(site, output, { recursive: true });
console.log('Static documentation is ready in website/ and dist/docs/.');
