/**
 * esbuild config for UXP MP3 bundle
 * Output: analysis-mp3-bundle.js
 */

const esbuild = require('esbuild');
const path    = require('path');

esbuild.build({
  entryPoints: ['src/analysis-mp3.js'],
  bundle:      true,
  format:      'cjs',
  platform:    'node',
  outfile:     'analysis-mp3-bundle.js',
  inject:      [path.resolve(__dirname, 'src/stubs/globals.js')],
  alias: {
    'url':            path.resolve(__dirname, 'src/stubs/url.js'),
    'vm':             path.resolve(__dirname, 'src/stubs/vm.js'),
    'worker_threads': path.resolve(__dirname, 'src/stubs/worker_threads.js'),
    '@eshaz/web-worker': path.resolve(__dirname, 'src/stubs/web-worker.js'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify:    false,
  sourcemap: false,
}).then(() => {
  console.log('✓ Bundle gerado: analysis-mp3-bundle.js');
}).catch(err => {
  console.error('✗ Erro no build:', err.message);
  process.exit(1);
});
