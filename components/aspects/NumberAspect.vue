<template lang="pug">
    div(v-if="!readOnly")
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
    import {INT, FLOAT} from "../../lib/consts";
    import AspectComponentMixin from "./AspectComponentMixin";

    export default {
        name: "NumberAspect",
        mixins: [AspectComponentMixin],
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
                        return "value cannot be higher then " + (this.aspect.attr.max)
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
                this.update_value(val)
            }
        }
    }
</script>

<style scoped>

</style>
