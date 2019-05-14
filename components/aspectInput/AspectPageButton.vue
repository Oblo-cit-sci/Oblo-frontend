<template lang="pug">
  div
    Title_Description(:title="title_description().title" :description="title_description().description")
    v-btn(nuxt @click="switchToAspectPage") {{aspect.name}}
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";

  export default {
    name: "AspectPageButton",
    components: {Title_Description},
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
