<template lang="pug">
  div
    v-select(
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
      this.set_selection()
    },
    methods: {
      set_selection() {
        if (this.value !== null) {
          this.selection = this.$_.filter(this.options, (o) => {
            return this.value.indexOf(o.value) > -1
          })
        } else {
          this.selection = null
        }
      }
    },
    watch: {
      value() {
        //this.set_selection()
      },
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
