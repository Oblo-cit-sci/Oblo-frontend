<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    v-text-field("outline" single-line  v-model="i_value"   :suffix="suffix" mask="####" )
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";

  export default {
    name: "IntAspect",
    components: {Title_Description},
    mixins: [AspectMixin],
    data() {
      return {suffix: "households"}
    },
    watch: {
      i_value(val) {
        this.value_change(parseInt(val))
      }
    }
  }
</script>

<style scoped>

</style>
