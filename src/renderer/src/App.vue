<script setup lang="ts">
import { Main } from "./engine";
import { Resources, loader } from "./resources";
const ipcHandle = () => window.Electron.ipcRenderer.send("ping");

try {
  const main = new Main();
  main.start();
} catch (err) {
  console.error(err);
}
</script>

<template>
  <div id="gameplay" class="hide">
    <p id="score">Score: 0</p>
  </div>
  <div id="menu" class="hide">
    <p id="title">Landfill</p>
    <p id="highscore">Highscore: 0</p>
    <button id="menu-play"class="play">Play</button>
    <button id="menu-quit" class="quit">Quit</button>
  </div>
  <div id="death" class="hide">
    <p id="label">Game Over</p>
    <button id="death-play" class="play">Play Again</button>
    <button id="death-quit" class="quit">Quit</button>
  </div>
</template>
