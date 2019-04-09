<template lang="pug">
  div
    v-text-field("outline" :label="aspect.name"  v-model="i_value" @input="action($event)")
    div {{i_value}}
</template>

<script>
 // import AspectMixin from "./AspectMixin";

  export default {
    name: "TextShort",
    props: ["aspect", "value"],
  //  mixins: [AspectMixin],
    data() {
      return {
        i_value: null
      }
    },
    created() {
      this.i_value = this.value;
    },
    methods: {
      action(event) {
        console.log("action", this.aspect.name, event);
        this.$emit('update:value', event)
      }
    }
  }
</script>

<style scoped>

</style>
