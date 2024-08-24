import { defineConfig } from 'vitepress'
import navbar from './config/navbar'
import sidebar from './config/sidebar'

export default defineConfig({
  srcDir: 'src',
  title: 'GALJS · Misakura',
  description: 'Cross-platform chatbot framework base on Node.js and TypeScript',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-NES42R3BKE' }],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-NES42R3BKE');`
    ]
  ],
  themeConfig: {
    logo: '/favicon.svg',
    nav: navbar,
    sidebar: sidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/biyuehu/misakura' }],
    footer: {
      copyright: 'MIT Licensed | Copyright © 2024 Hotaru'
    }
  },
  lastUpdated: true
})
