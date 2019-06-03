<template lang="pug">
  div
    v-autocomplete(:items="options" v-model="selected" single-line outline multiple chips)
</template>

<script>
  export default {
    name: "MultiSelect",
    props: {
      options: Array,
      selection: Array,
      select_sync: {
        type: Boolean,
        default: true
      },
    },
    data() {
      return {
        selected: []
      }
    },
    watch: {
      selected(item) {
        if (this.select_sync) {
          this.$emit('update:selection', item); // refactor to use the item
        } else {
          this.$emit("selection", item);
        }
      }
    }
  }
</script>

<style scoped>

</style>
