import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

const base = '/au-trip-map/'

function stripVantCdnFontFallback() {
  return {
    name: 'strip-vant-cdn-font-fallback',
    transform(code: string, id: string) {
      if (!id.includes('vant') || !code.includes('at.alicdn.com')) return
      return {
        code: code.replace(
          /,url\(\/\/at\.alicdn\.com[^)]+\) format\("woff"\)/g,
          '',
        ),
        map: null,
      }
    },
  }
}

export default defineConfig({
  base,
  plugins: [
    vue(),
    stripVantCdnFontFallback(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'offline.html', 'robots.txt'],
      manifest: {
        name: '澳洲行程路书',
        short_name: '澳洲路书',
        description: '2026 澳大利亚自驾行程离线路书',
        theme_color: '#176b87',
        background_color: '#f3f6f7',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: base,
        scope: base,
        lang: 'zh-CN',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: `${base}index.html`,
        globPatterns: ['**/*.{js,css,html,json,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
