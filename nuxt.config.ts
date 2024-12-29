// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
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
    "vue-toastification/dist/index.css", // Include toastification CSS
  ],
  build: {
    transpile: ["@fortawesome/vue-fontawesome"],
  },
  plugins: ["~/plugins/toast.js"], // Register the toast plugin here
});