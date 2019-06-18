<template lang="pug">
  div
    v-text-field(
      outline
      single-line
      v-model="i_value"
      :suffix="suffix"
      :rules="[minmax]"
      :disabled="disabled"
      :readonly="!edit"
      v-on:update:error="error = $event"

      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"

      :mask="mask" )
</template>

<script>
  import AspectMixin from "./AspectMixin";

  const INT = "int"
  const FLOAT = "float"

  export default {
    name: "NumberAspect",
    mixins: [AspectMixin],
    data() {
      return {
        mask: "",
        suffix: this.aspect.attr.suffix || "",
        num_type: null,
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
      this.num_type = this.aspect.type
      if(!(this.num_type === INT || this.num_type === FLOAT)) {
        console.log("NumberAspect-error type: aspect, type", this.aspect.name, this.aspect.type)
      }
      if (this.aspect.type === INT) {
        this.mask = "##########"
      } /*else {
        // todo. maybe use the type, prop but vuetify doesnt have any docs
        this.mask = undefined // "############.##########"
      }*/
    },
    watch: {
      i_value(val) {
        this.value_change(this.num_type === INT ? parseInt(val) : parseFloat(val))
      }
    }
  }
</script>

<style scoped>

</style>
