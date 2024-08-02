<script setup lang="ts">
function click() {
  const voice = new Audio('/assets/kotori.mp3');
  voice.play();
}
</script>

<template>
  <span>
    <input
      type="image"
      src="https://cn.vitejs.dev/voice.svg#voice"
      @click="click()"
      class="voice"
      style="
        background-color: rgb(243, 244, 245);
        border: none;
        padding: 3px;
        border-radius: 4px;
        vertical-align: bottom;
        height: 1.5em;
        width: 1.5em;
      "
    />
  </span>
</template>

<style></style>
