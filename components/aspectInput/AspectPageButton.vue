<template lang="pug">
  div
    v-btn(nuxt @click="switchToAspectPage") {{aspect.name}}
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
    },
    methods: {
      switchToAspectPage() {
        this.$router.push({
          path: this.destination, query: {
            ref_draft_id: this.aspect.attr.orig,
            aspect_index: this.aspect.attr.aspect_index
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
