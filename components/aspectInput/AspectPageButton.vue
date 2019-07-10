<template lang="pug">
  div
    v-btn(nuxt @click="switchToAspectPage") {{aspect.name}}
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import {AUTOSAVE, ENTRYACTION} from "../../lib/consts";

  export default {
    name: "AspectPageButton",
    mixins: [AspectMixin],
    methods: {
      switchToAspectPage() {
        this.$emit(ENTRYACTION, {action:AUTOSAVE})
        this.$router.push(this.$route.path + "/" + this.aspect.name);
      }
    }
  }
</script>

<style scoped>

</style>
