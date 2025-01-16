import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss", "@pinia/nuxt"],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: "/login",
      callback: "/",
      exclude: ["/*"],
    },
  },
  pinia: {
    autoImports: ["defineStore", "storeToRefs"],
  },
  css: [
    "~/assets/css/main.css",
    "@fortawesome/fontawesome-svg-core/styles.css",
    "tippy.js/dist/tippy.css",
    "vue-toastification/dist/index.css",
  ],
  build: {
    transpile: ["@fortawesome/vue-fontawesome", "vue-toastification"],
  },
  plugins: ["~/plugins/toast.js", "~/plugins/chart.ts"],
});
