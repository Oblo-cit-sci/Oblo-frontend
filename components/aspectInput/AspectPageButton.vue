<template lang="pug">
  div
    v-btn(nuxt :to="destination") {{aspect.name}}
</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "AspectPageButton",
    mixins: [AspectMixin],
    data() {
      return {
        destination: null
      }
    },
    created() {
      this.destination = "/create/aspect/" + this.aspect.name;
    }
  }
</script>

<style scoped>

</style>
