<template>
  <div>
    <RouterView />
  </div>
</template>

<script>
import { RouterView } from "vue-router";
export default {
  name: "MainMenu",
  methods: {
    test() {
      this.$router.push("/play");
    },
  },
  components: { RouterView },
};
</script>
