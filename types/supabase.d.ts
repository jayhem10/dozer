// types/supabase.d.ts
declare module '@nuxt/types' {
    interface NuxtConfig {
      supabase?: {
        url: string;
        key: string;
        redirectOptions: {
          login: string;
          callback: string;
          exclude: string[];
        };
      };
    }
  }
  