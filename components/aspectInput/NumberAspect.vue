<template lang="pug">
  div
    v-text-field(
      outline
      single-line
      :value="i_value"
      v-on:input="input($event)"
      :suffix="suffix"
      :disabled="disabled"
      :readonly="!edit"
      type="number"
      :min="min"
      :max="max"
      v-on:update:error="error = $event"
      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"
      :mask="mask" )
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import {INT, FLOAT} from "../../lib/consts";

  export default {
    name: "NumberAspect",
    mixins: [AspectMixin],
    data() {
      return {
        mask: "",
        suffix: this.aspect.attr.suffix || "",
        num_type: null,
        error: false, // todo actually emit it up... and make validation on whole entry...
        min: this.aspect.attr.min,
        max: this.aspect.attr.max,
      }
    },
    created() {
      this.num_type = this.aspect.type
      if(!(this.num_type === INT || this.num_type === FLOAT)) {
        console.log("NumberAspect-error type: aspect, type", this.aspect.name, this.aspect.type)
      }
      /*if (this.aspect.type === INT) {
        this.mask = "################"
      }*/
    },
    methods: {
      input(val){
        this.value_change(this.num_type === INT ?
          parseInt(val) :
          parseFloat(val.replace(",",".")))
      }
    }
  }
</script>

<style scoped>

</style>
