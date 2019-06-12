<template lang="pug">
  div
    v-text-field(
      outline
      single-line
      v-model="i_value"
      :suffix="suffix"
      :rules="[minmax]"
      v-on:update:error="error = $event"
      :mask="mask" )
    div(v-if="error") ERROR
</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "NumberAspect",
    mixins: [AspectMixin],
    data() {
      return {
        mask: "",
        suffix: this.aspect.attr.suffix || "",
        error: false, // todo actually emit it up... and make validation on whole entry...
        minmax: value => {
          if (this.aspect.attr.min && value < this.aspect.attr.min)
            return "value must be higher than " + this.aspect.attr.min
          else if (this.aspect.attr.max && value > this.aspect.attr.max)
            return "value must be lower than " + this.aspect.attr.max
          else return true
        }
      }
    },
    created() {
      if (this.aspect.type === "int") {
        this.mask = "##########"
      } else {
        // todo. maybe use the type, prop but vuetify doesnt have any docs
        this.mask = undefined // "############.##########"
      }
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
