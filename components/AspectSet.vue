<template lang="pug">
  div
    v-row(v-for="aspect in aspects" :key="aspect.name")
      v-col.py-0(cols=10)
        Aspect(:aspect="aspect"
          :ext_value.sync="i_values[aspect.name]"
          :conditionals="i_values"
          @update:error="errors[aspect.name] = $event"
          :is_set.sync="i_values_set[aspect.name]"
          :extra="{clearable:false}"
          :mode="mode")
    v-row(v-if="show_validation")
      AspectSetValidation(:aspects="aspects" :aspects_set="i_values_set")
</template>

<script>
import {aspect_default_value} from "~/lib/aspect"
import Aspect from "~/components/Aspect"
import {VIEW} from "~/lib/consts"
import AspectSetValidation from "~/components/AspectSetValidation";

export default {
  name: "AspectSet",
  components: {AspectSetValidation, Aspect},
  mixins: [],
  props: {
    aspects: {
      type: Array,
      required: true
    },
    mode: {
      type: String,
      default: VIEW
    },
    values: {
      type: Object
    },
    store_init: {
      type: Boolean,
      default: true
    },
    values_set: {
      type: Object
    },
    include_validation: {
      type: Boolean
    },
    hide_validation_if_valid: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const aspectMap = this.$_.keyBy(this.aspects, "name")
    let i_values = {}
    if (this.values) {
      i_values = this.$_.mapValues(aspectMap, a => this.values[a.name] || aspect_default_value(a))
    } else {
      i_values = this.$_.mapValues(aspectMap, a => aspect_default_value(a))
    }
    return {
      i_values: i_values,
      errors: this.$_.mapValues(aspectMap, () => null),
      initial_values: null,
      has_changes: false,
      i_values_set: this.$_.mapValues(aspectMap, () => false)
    }
  },
  computed: {
    has_error() {
      // console.log("check errs")
      return this.$_.filter(this.errors, e => e).length > 0
    },
    is_complete() {
      return Object.values(this.i_values_set).every(is_set => is_set)
    },
    show_validation() {
      return this.include_validation && !(this.hide_validation_if_valid && this.is_complete)
    }
  },
  created() {
    // initialize update values, if some are not set
    if (this.values) {
      if (this.$_.some(this.i_values, a_name => !this.values.hasOwnProperty(a_name))) {
        this.$emit("update:values", this.i_values)
      }
    }
    if (this.store_init) {
      this.initial_values = this.$_.cloneDeep(this.i_values)
    }
  },
  methods: {},
  watch: {
    i_values: {
      deep: true,
      handler(vals) {
        this.$emit("update:values", this.i_values)
        this.has_changes = !this.$_.isEqual(this.initial_values, this.i_values)
      }
    },
    has_errors: {
      deep: true,
      handler(has_errs) {
        console.log("er up")
        this.$emit("has_errors", has_errs)
      }
    },
    i_values_set: {
      immediate: true,
      deep: true,
      handler: function (is_set) {
        this.$emit("update:is_set", is_set)
      }
    },
    is_complete: {
      immediate: true,
      handler: function (is_complete) {
        this.$emit("is_complete", is_complete)
      }
    }
  }
}
</script>

<style scoped>

</style>
