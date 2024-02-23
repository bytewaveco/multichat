// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  telemetry: false,
  ssr: false,
  srcDir: "src",
  modules: ["@nuxt/ui"],
  nitro: {
    preset: "static",
  },
  colorMode: {
    preference: 'light'
  }
});
