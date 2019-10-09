<template lang="pug">
  div
    v-text-field(
      outlined
      single-line
      :value="i_value"
      v-on:input="input($event)"
      :suffix="suffix"
      :disabled="disabled"
      :readonly="readOnly"
      type="number"
      :min="min"
      :max="max"
      v-on:update:error="error = $event"
      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"
      :rules="[minmax,valid_num_type]"
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
                min: this.aspect.attr.min,
                max: this.aspect.attr.max,
                minmax: value => {
                    if (this.aspect.attr.min !== undefined && value < this.aspect.attr.min) {
                        return "value must be at least " + (this.aspect.attr.min)
                    } else if (this.aspect.attr.max !== undefined && value > this.aspect.attr.max) {
                        return "value must be lower then " + (this.aspect.attr.max)
                    } else return true
                },
                valid_num_type: value => {
                    if (this.num_type === INT && value % 1 !== 0) {
                        return "value must be an integer"
                    } else if (this.num_type === FLOAT) {
                        let f = parseFloat(value)
                        if (!f) {
                            return "value is not a number"
                        } else {
                            return true
                        }
                    } else
                        return true
                }
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
                this.value_change(val)
            }
        }
    }
</script>

<style scoped>

</style>
