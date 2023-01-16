const { build } = require('esbuild');
const envFilePlugin = require('esbuild-envfile-plugin');
const { copy } = require('esbuild-plugin-copy');
const pkg = require('./package.json');

/**
 * SearchSync
 * "esbuild ./node_modules/directus-extension-searchsync/index.js --bundle --platform=node --minify --outfile=./extensions/hooks/searchsync/index.js",

 */
const searchsync = {
  entryPoints: ['./node_modules/directus-extension-searchsync/index.js'],
  bundle: true,
  target: ['node18'],
  platform: 'node',
  minify: true,
  format: 'cjs',
  outfile: './extensions/hooks/searchsync/index.js',
};

const searchsyncrc = {
  entryPoints: ['searchsync/searchsyncrc.js'],
  bundle: true,

  platform: 'node',
  outfile: 'extensions/hooks/searchsync/searchsyncrc.js',
  minify: false,
  sourcemap: false,
  plugins: [envFilePlugin],
};

build(searchsync);
build(searchsyncrc);

/**
 * Slugs
 */

// copy({
//   resolveFrom: 'cwd',
//   assets: {
//     from: ['./node_modules/directus-extension-searchsync/index.js'],
//     to: ['extensions/hooks/searchsync/'],
//   },
// }),
