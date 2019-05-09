<template lang="pug">
  div
    v-btn(nuxt @click="switchToAspectPage") {{aspect.name}}
</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "AspectPageButton",
    mixins: [AspectMixin],
    methods: {
      switchToAspectPage() {
        this.$router.push(this.$route.path + "/" + this.aspect.name);
      }
    }
  }
</script>

<style scoped>

</style>
