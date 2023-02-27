const { build } = require('esbuild');
const envFilePlugin = require('esbuild-envfile-plugin');
const { copy } = require('esbuild-plugin-copy');
const vue = require('esbuild-plugin-vue3');

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
copy({
  resolveFrom: 'cwd',
  assets: {
    from: ['./node_modules/directus-extension-wpslug-interface/dist/index.js'],
    to: ['./extensions/interfaces/slugs'],
  },
});
/**
 * Sincronizar Lugares Obras
 */
const sincronizarLugaresObras = {
  entryPoints: ['sincronizar-lugares-obras/index.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'extensions/hooks/sincronizar-lugares-obras/index.js',
  minify: true,
  format: 'cjs',
};

build(sincronizarLugaresObras);

/**
 * Registro Obras
 */
const registroObras = {
  entryPoints: ['registro-obras/index.js'],
  bundle: true,
  outfile: 'extensions/interfaces/registro-obras/index.js',
  minify: true,
  plugins: [vue()],
};

build(registroObras);
