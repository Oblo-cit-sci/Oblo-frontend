<template lang="pug">
  div
    v-autocomplete(
      :items="options"
      v-model="selection"
      :readonly="readOnly"
      single-line outline chips multiple)
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import SelectMixin from "./SelectMixin";

  export default {
    name: "MultiselectAspect",
    mixins: [AspectMixin, SelectMixin],
    created() {
      // todo BOTH possibilites not tested
      /*if (this.select_check) { // todo plan this
        this.check_box_value = this.$_.fill(new Array(options.length), false) // or maybe a value/default...
      }*/
      if (this.value !== null) {
        this.selection = this.$_.filter(this.options, (o) => {
          return this.value.indexOf(o.value) > -1
        })
      }
    },
    watch: {
      selection() {
        if (this.selection === null)
          this.value_change(null)
        else {
          this.i_value = this.selection
          this.value_change(this.i_value)
        }

      }
    }
  }
</script>

<style scoped>

</style>
