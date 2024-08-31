<script setup lang="ts">
import { Main } from "./engine"
import { Resources, loader } from './resources';
const ipcHandle = () => window.Electron.ipcRenderer.send('ping')

try {
const main = new Main();
main.start();
} catch(err) {
    console.error(err)
}
</script>

<template>
</template>
