<template>
  <div>
    <div id="main-menu" v-if="showMainMenu">
      <div class="menu-content">
        <!-- Modal content goes here -->
        <h1>ASPACE</h1>
        <div class="menu-children-container">
          <button class="menu-children" @click="showMainMenu = false">Start</button>
          <button class="menu-children">Settings</button>
        </div>
      </div>
    </div>

    <div>
      <canvas ref="bjsCanvas" width="500" height="500" />
      <div class="menu-button" @click="showModal = !showModal">
        <button>Map</button>
      </div>
    </div>
    <!-- <div id="emoji-container">
      <button @click="playHappyAnim">Happy</button>
      <br />
      <button>Wave</button>
      <br />
      <button>Sad</button>
    </div> -->
    <div id="map-modal" v-if="showModal">
      <button class="close-button" @click="showModal = false">X</button>
      <!-- Modal content goes here -->
      <!-- <button @click="changePlayerRotation">Rotate player</button> -->
      <div id="map-container">
        <button id="moveBtn1" @click="changePlayerPosition1">
          Change Player Position
        </button>
        <button id="moveBtn2" @click="changePlayerPosition2">
          Change Player Position
        </button>
        <img id="map-image" src="/assets/img/Map.png" alt="map.png" />
      </div>
    </div>
  </div>
</template>

<style>
.menu-children-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-children {
  width: 100%;
  margin: 10px;
  padding: 10px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

#main-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 20px;
  border: 1px solid black;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
}

.menu-content {
  margin: auto;
  text-align: center;
}

button {
  background-color: transparent;
  color: white;
  border-radius: 20px;
  padding: 10px;
  border: 1px solid white;
  cursor: pointer;
}

#emoji-container {
  position: fixed;
  top: 75vh;
  left: 10px;
  z-index: 999;
}

.menu-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
}

#map-modal {
  z-index: 999;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  /* padding: 50px; */
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.close-button {
  z-index: 999;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  font-weight: bold;
  color: black;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

#moveBtn1 {
  /* position: inherit; */
  position: absolute;
  z-index: 1;
  transform: translate(550%, 2000%);
}

#moveBtn2 {
  /* position: inherit; */
  position: absolute;
  z-index: 1;
  transform: translate(100%, 150%);
}

#map-container {
  width: 70vw;
  height: 70vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
</style>

<script>
import { ref, onMounted } from "@vue/runtime-core";
import {
  createScene,
  updatePlayerPosition,
  updatePlayerRotation,
  happyAnim,
} from "./scenes/Scene";

export default {
  name: "BabylonScene",
  data() {
    return {
      showMainMenu: true,
    };
  },
  mounted() {
    // Show the main menu modal on startup
    this.showMainMenu = false;
  },
  setup() {
    const bjsCanvas = ref(null);
    let engine, scene;
    const showModal = ref(false);

    onMounted(() => {
      if (bjsCanvas.value) {
        const result = createScene(bjsCanvas.value);
        engine = result.engine;
        scene = result.scene;
      }
    });

    const playHappyAnim = () => {
      happyAnim(scene);
    };

    const changePlayerPosition1 = () => {
      updatePlayerPosition(scene, new BABYLON.Vector3(0, 0, 100));
    };

    const changePlayerPosition2 = () => {
      updatePlayerPosition(scene, new BABYLON.Vector3(0, 0, -70));
    };

    const changePlayerRotation = () => {
      updatePlayerRotation(scene, new BABYLON.Vector3(0, Math.PI, 0));
    };

    return {
      bjsCanvas,
      showModal,
      changePlayerPosition1,
      changePlayerPosition2,
      changePlayerRotation,
      playHappyAnim,
    };
  },
};
</script>
