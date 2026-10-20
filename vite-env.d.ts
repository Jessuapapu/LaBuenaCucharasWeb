// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Agrega aquí cualquier otra variable que definas en el futuro
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}