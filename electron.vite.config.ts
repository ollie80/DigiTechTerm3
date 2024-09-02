import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { PluginOption } from 'vite';

const tiledPlugin = () => {
  return {
    name: 'tiled-tileset-plugin',
    resolveId: {
      order: 'pre',
      handler(sourceId) {
        if (!sourceId.endsWith(".tsx")) return;
        return { id: 'tileset:' + sourceId, external: 'relative' }
      }
    }
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue(), tiledPlugin() as PluginOption],
    build: {
      assetsInlineLimit: 0, // excalibur cannot handle inlined xml in prod mode
      sourcemap: true
    }
  }
})
