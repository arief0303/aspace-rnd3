<template>
    <div>
      <h1>Welcome to the Metaverse!</h1>
      <p>Please select an option:</p>
      <ul>
        <li><router-link to="/play">Play</router-link></li>
        <li><router-link to="/settings">Settings</router-link></li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: "MainMenu",
  };
  </script>