# LeadConnector Plugin — Frontend

This repository contains the **Vue 3 frontend** for the [LeadConnector WordPress Plugin](https://wordpress.org/plugins/leadconnector/), built with [Vite](https://vitejs.dev/). It powers the plugin's admin UI embedded inside the WordPress dashboard.

> This is the **frontend sub-repo only**. The full plugin (PHP backend + compiled frontend) lives in the main plugin repository.

---

## License

This project is licensed under the **GNU General Public License v3.0 or later**.
See [LICENSE](./LICENSE) for the full text.

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 20+ (see `.nvmrc`) |
| npm or yarn | any recent version |

---

## 1. Install Node.js

Use [nvm](https://github.com/nvm-sh/nvm) to match the exact version pinned in `.nvmrc`:

```sh
nvm install
nvm use
```

---

## 2. Install dependencies

All dependencies are published on the public npm registry — no private registry or auth token needed.

```sh
npm install
# or
yarn install
```

---

## 3. Configure the WordPress plugin path

Open `auto_build.js` and set the `WP_PLUGIN_PATH` constant at the top to the absolute path of your local plugin's `trunk` folder:

```js
const WP_PLUGIN_PATH = "/absolute/path/to/wp-content/plugins/lead-connector/trunk";
```

> This value only lives in your local copy of `auto_build.js` and is never committed.

---

## 4. Build

### One-time build

```sh
node auto_build.js --once
```

Runs a full Vite build (with type-check) and copies the output into your WordPress plugin directory, then exits.

### Watch mode (rebuild on every save)

```sh
node auto_build.js
```

Runs an initial build, then watches `src/` and re-runs automatically on every file change.

### Build artifacts

| File | Destination in plugin |
|------|-----------------------|
| `dist/app.js` | `trunk/admin/app.js` |
| `dist/app.css` | `trunk/admin/app.css` |

---

## 5. Development (hot-reload, no WordPress)

```sh
npm run dev
```

Starts Vite's dev server. Because the app reads its configuration from `window.leadConnectorConfig` (injected by PHP at runtime), some features will not work without the full WordPress backend. Useful for isolated component work.

---

## Project structure

```
.
├── public/               Static assets (favicon, etc.)
├── src/
│   ├── assets/           Images, global styles
│   ├── components/       Vue components grouped by feature
│   ├── layouts/          App shell / header
│   ├── pages/            Top-level route views
│   ├── ui/               Shared UI primitives
│   ├── App.vue           Root component
│   ├── config.ts         Runtime config bridge (reads window.leadConnectorConfig)
│   ├── constants.ts      App-wide constants
│   ├── helper.ts         Utility functions
│   ├── main.ts           Vue app entry point
│   ├── services.ts       API service layer
│   └── types.ts          TypeScript type definitions
├── auto_build.js         File watcher + build runner
├── move_to_wp.js         Copies build output to WP plugin directory
├── vite.config.ts        Vite bundler configuration
├── tailwind.config.js    Tailwind CSS configuration
├── tsconfig.json         TypeScript configuration
└── LICENSE               GNU GPLv3
```

---

## How it integrates with WordPress

The PHP plugin enqueues `admin/app.js` and `admin/app.css` on the plugin's admin page and injects a `window.leadConnectorConfig` global containing runtime values (API URLs, OAuth client ID, etc.). The Vue app reads this object via `src/config.ts` — no `.env` files are involved at runtime.

---

## Recommended IDE setup

- [VS Code](https://code.visualstudio.com/) with the [Volar extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar) for full Vue 3 + TypeScript support.
- Disable **Vetur** if installed — it conflicts with Volar.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Follow the existing code style (Vue 3 Composition API, TypeScript).
3. Run `npm run build` and verify there are no type errors before opening a PR.
4. Do **not** commit `dist/` or any file containing credentials or local paths.
5. Keep `WP_PLUGIN_PATH` out of committed files — use your shell profile or a gitignored `.env.local`.

---

## Changelog

See the main plugin's readme on [WordPress.org](https://wordpress.org/plugins/leadconnector/) for release notes.
