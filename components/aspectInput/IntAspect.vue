<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    v-text-field("outline" :label="aspect.name"  v-model="i_value"  mask="####" @input="value_change($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";

  export default {
    name: "IntAspect",
    components: {Title_Description},
    props: ["aspect"],
    mixins: [AspectMixin],
    data() {
      return {}
    },
    created() {
      this.value = 0;
    },
  }
</script>

<style scoped>

</style>
