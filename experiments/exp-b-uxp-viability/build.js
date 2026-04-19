const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: ['src/analysis.js'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: 'analysis-bundle.js',
  inject: [path.resolve(__dirname, 'src/stubs/globals.js')],
  alias: {
    'url':            path.resolve(__dirname, 'src/stubs/url.js'),
    'vm':             path.resolve(__dirname, 'src/stubs/vm.js'),
    'worker_threads': path.resolve(__dirname, 'src/stubs/worker_threads.js'),
    '@eshaz/web-worker': path.resolve(__dirname, 'src/stubs/web-worker.js'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}).then(() => {
  console.log('✓ Bundle gerado: analysis-bundle.js');
}).catch((err) => {
  console.error('✗ Erro no build:', err.message);
  process.exit(1);
});
