<template>
  <canvas ref="bjsCanvas" />
  <button id="showInspecorBtn" @click="showInspector">Show Inspector</button>
</template>

<style>
#showInspecorBtn {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 10px;
}
</style>

<script>
import { ref, onMounted } from "@vue/runtime-core";
import { createScene } from "../scenes/BabylonScene";
import { Inspector } from 'babylonjs-inspector';

export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref(null);
    let scene = null;
    let engine = null;

    onMounted(async () => {
      engine = new BABYLON.Engine(bjsCanvas.value, true);
      scene = new BABYLON.Scene(engine);

      if (bjsCanvas.value) {
        await createScene(bjsCanvas.value);
      }
    });

    function showInspector() {
      Inspector.Show(scene, {
        embedMode: true,
        handleResize: true,
        overlay: true
    });
    }

    return {
      bjsCanvas,
      scene,
      engine,
      showInspector,
    };
  },
};
</script>