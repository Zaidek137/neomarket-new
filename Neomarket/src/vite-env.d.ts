/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_THIRDWEB_CLIENT_ID: string;
  readonly VITE_CROSSMINT_CLIENT_KEY?: string;
  readonly VITE_CROSSMINT_CLIENT_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
