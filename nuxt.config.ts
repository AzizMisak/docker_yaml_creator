import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'], // @nuxtjs/tailwindcss kaldırıldı
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  css: ['~/assets/css/tailwind.css']
})
