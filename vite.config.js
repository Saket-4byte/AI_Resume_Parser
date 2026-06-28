import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Copy the uploaded icon image to public directory
const srcPath = 'C:/Users/KIIT/.gemini/antigravity-ide/brain/0837e7e3-7d62-442f-b30e-c1056b90ae69/media__1782631728366.png';
const destLogo = './public/logo.png';
const destFavicon = './public/favicon.png';

try {
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destLogo);
    fs.copyFileSync(srcPath, destFavicon);
    console.log('Successfully copied logo and favicon!');
  } else {
    console.log('Source image not found at ' + srcPath);
  }
} catch (e) {
  console.error('Failed to copy files:', e);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})

