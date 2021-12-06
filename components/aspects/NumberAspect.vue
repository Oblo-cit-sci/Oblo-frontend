<template lang="pug">
  div(v-if="!is_view_mode")
    v-text-field(
      outlined
      single-line
      :value="value"
      v-on:input="input($event)"
      :suffix="suffix"
      :disabled="disabled"
      type="number"
      v-on:update:error="error = $event"
      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('aspectAction', {action: 'clear'})"
      :rules="validation_rules"
      :mask="mask")
  div(v-else)
    p(class="body-1") {{value}}
</template>

<script>
import {INT, FLOAT} from "~/lib/consts";
import AspectComponentMixin from "./AspectComponentMixin";
import {resolve_number} from "~/lib/util"

/**
 * details are never hidden. cuz the input could be invalid
 */
export default {
  name: "NumberAspect",
  mixins: [AspectComponentMixin],
  data() {
    const attr = this.$_.get(this.aspect, "attr", {})
    const min = resolve_number(attr.min)
    const max = resolve_number(attr.max)
    const validation_rules = [value => {
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
            return "value is not a float number"
          } else {
            return true
          }
        } else
          return true
      }]
    if(min !== undefined || max !== undefined) {
      validation_rules.push(value => {
        if (min !== undefined && value < min) {
          return "value must be at least " + (min)
        } else if (max !== undefined && value > max) {
          return "value cannot be higher then " + (max)
        } else return true
      })
    }
    return {
      // todo what?
      suffix: attr.suffix || "",
      num_type: null,
      validation_rules,
      error: null // just emit it up
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
      // console.log(val, this.error, this.minmax(val), this.valid_num_type(val))
      // const minmax_val = this.minmax(val)
      // console.log("MM", typeof minmax_val === "string", !minmax_val)
      // if (typeof minmax_val === "string" || (typeof minmax_val === "boolean" && !minmax_val)) {
        // console.log("MM")
        // return
      // }
      // const valid_num_type_val = this.valid_num_type(val)
      // if (typeof valid_num_type_val === "string" || typeof valid_num_type_val === "boolean" && !valid_num_type_val) {
      //   return
      // }
      this.update_value(val)
    }
  },
  computed: {
    mask() {
      return this.extra.mask || ""
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
