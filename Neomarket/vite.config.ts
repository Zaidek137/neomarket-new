import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

type BuildWarning = {
  code?: string;
  id?: string;
  message?: string;
};

const ignoredInvalidAnnotationPackages = [
  '/node_modules/thirdweb/',
  '/node_modules/ox/',
  '/node_modules/@walletconnect/utils/',
];

function isKnownThirdPartyInvalidAnnotation(warning: BuildWarning) {
  const source = `${warning.id ?? ''} ${warning.message ?? ''}`.replace(/\\/g, '/');

  return (
    warning.code === 'INVALID_ANNOTATION' &&
    ignoredInvalidAnnotationPackages.some((packagePath) => source.includes(packagePath))
  );
}

function isKnownThirdPartyNodeFallbackWarning(warning: BuildWarning) {
  const source = `${warning.id ?? ''} ${warning.message ?? ''}`.replace(/\\/g, '/');

  return (
    source.includes('Module "crypto" has been externalized for browser compatibility') &&
    source.includes('/node_modules/thirdweb/dist/esm/x402/sign.js')
  );
}

export default defineConfig(({ mode }) => {
  const enableProductionSourcemaps = process.env.VITE_ENABLE_PRODUCTION_SOURCEMAPS === 'true';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
      },
    },
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (
            isKnownThirdPartyInvalidAnnotation(warning) ||
            isKnownThirdPartyNodeFallbackWarning(warning)
          ) {
            return;
          }

          defaultHandler(warning);
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'react-vendor';
            }

            if (
              id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/lucide-react')
            ) {
              return 'ui-vendor';
            }

            if (id.includes('node_modules/thirdweb')) {
              return 'web3-vendor';
            }

            if (id.includes('node_modules/@supabase/supabase-js')) {
              return 'data-vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 10000,
      sourcemap: mode === 'production' ? enableProductionSourcemaps : true
    },
    envPrefix: 'VITE_'
  };
});
