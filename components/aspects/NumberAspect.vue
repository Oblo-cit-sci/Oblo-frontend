<template lang="pug">
  div(v-if="!is_view_mode")
    v-text-field(
      outlined
      single-line
      :value="value"
      v-on:input="input($event)"
      :suffix="suffix"
      :disabled="disabled"
      :hide-details="hide_details"
      type="number"
      :min="min"
      :max="max"
      v-on:update:error="error = $event"
      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('aspectAction', {action: 'clear'})"
      :rules="[minmax,valid_num_type]"
      :mask="mask" )
  div(v-else)
    p(class="body-1") {{value}}
</template>

<script>
import {INT, FLOAT} from "~/lib/consts";
import AspectComponentMixin from "./AspectComponentMixin";

export default {
  name: "NumberAspect",
  mixins: [AspectComponentMixin],
  data() {
    const attr_ = this.$_.get(this.aspect, "attr", {})
    const min = this.attr.min
    const max = this.attr.max
    return {
      // todo what?
      mask: "",
      suffix: this.attr.suffix || "",
      num_type: null,
      min,
      max,
      minmax: value => {
        if (min !== undefined && value < min) {
          return "value must be at least " + (min)
        } else if (max !== undefined && value > attr_.max) {
          return "value cannot be higher then " + (attr_.max)
        } else return true
      },
      valid_num_type: value => {
        if (this.num_type === INT) {
          let i = parseInt(value)
          if (isNaN(i) || value % 1 !== 0) {
            return "value is not a integer number"
          } else {
            return true
          }
        } else if (this.num_type === FLOAT) {
          let f = parseFloat(value)
          if (isNaN(f)) {
            return "value is not a number"
          } else {
            return true
          }
        } else
          return true
      },
      error: null
    }
  },
  created() {
    this.num_type = this.aspect.type
    if (!(this.num_type === INT || this.num_type === FLOAT)) {
      console.log("NumberAspect-error type: aspect, type", this.aspect.name, this.aspect.type)
    }
  },
  methods: {
    input(val) {
      this.update_value(val)
    }
  },
  watch: {
    error(err) {
      this.$emit('update:error', err)
    }
  }
}
</script>

<style scoped>

</style>
