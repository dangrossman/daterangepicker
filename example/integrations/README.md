# Date Range Picker integration examples

Open an example from the [documentation](../../website/index.html#integrations). Each page includes a working input and the source of the app. The checked-in bundles run from any static HTTP server rooted at `website/`.

## Run locally

From the repository root, start a static server for the checked-in site.

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

Open [the React demo](http://127.0.0.1:8000/examples/react/), [Vue](http://127.0.0.1:8000/examples/vue/), [Angular](http://127.0.0.1:8000/examples/angular/), [Svelte](http://127.0.0.1:8000/examples/svelte/), [TypeScript with ES modules](http://127.0.0.1:8000/examples/esm/), or [CommonJS](http://127.0.0.1:8000/examples/commonjs/).

## Edit an example

The example package is linked to the local version 4 checkout. After changing the app source, run the following commands in `example/integrations` and refresh your browser.

```sh
npm ci
npm run build
```

The build compiles the Vue and Svelte components, TypeScript and JSX. It bundles each framework locally, generates the demo pages from the matching source files, and links the picker stylesheet from the checkout. Angular's small JIT example imports its compiler at startup. A standard Angular CLI project compiles the component during the app build.

In another app, import `daterangepicker` and `daterangepicker/daterangepicker.css` from your bundler entry or component as shown in the examples. For local development before v4 is published, install the packed checkout in that app. Run `npm pack` at the picker repository root, then run `npm install /path/to/daterangepicker-4.0.0.tgz` in the app.
