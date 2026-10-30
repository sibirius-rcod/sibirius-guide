import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// В ограниченном Windows-окружении esbuild не может обходить родительские
// каталоги. Этот необязательный адаптер читает зависимости через Node.js.
const sandboxResolver = {
  name: 'sandbox-dependency-reader',
  setup(build) {
    build.onResolve({ filter: /.*/ }, args => {
      if (args.kind === 'entry-point') return;
      const require = createRequire(path.isAbsolute(args.importer) ? args.importer : path.join(process.cwd(), 'package.json'));
      return { path: require.resolve(args.path), namespace: 'node-file' };
    });
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, async args => ({
      contents: await readFile(args.path, 'utf8'),
      loader: args.path.endsWith('.json') ? 'json' : 'js',
      resolveDir: path.dirname(args.path),
    }));
  },
};

export default defineConfig({
  plugins: [react()],
  // GitHub Pages supplies /sibirius-guide/; local and Netlify builds stay portable.
  base: process.env.VITE_BASE_PATH || './',
  optimizeDeps: process.env.SIBIRIUS_SANDBOX === '1'
    ? { noDiscovery: true, include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'lucide-react'], esbuildOptions: { plugins: [sandboxResolver] } }
    : undefined,
  server: { port: 5173, strictPort: true },
});
