<template lang="pug">
  div
    v-row(v-for="aspect in aspects" :key="aspect.name")
      v-col.py-0(cols=10)
        Aspect(:aspect="aspect"
          :ext_value.sync="i_values[aspect.name]"
          :conditionals="i_values"
          @update:error="errors[aspect.name] = $event"
          :extra="{clearable:false}"
          :mode="mode")
</template>

<script>
import {aspect_default_value} from "~/lib/aspect"
import Aspect from "~/components/Aspect"
import {VIEW} from "~/lib/consts"

export default {
  name: "AspectSet",
  components: {Aspect},
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
    }
  },
  data() {
    const aspectMap = this.$_.keyBy(this.aspects, "name")
    let i_values = {}
    if(this.values) {
      i_values =  this.$_.mapValues(aspectMap, a => this.values[a.name] || aspect_default_value(a))
    } else {
      i_values =  this.$_.mapValues(aspectMap, a => aspect_default_value(a))
    }
    return {
      i_values: i_values,
      errors: this.$_.mapValues(aspectMap, a => null),
      initial_values: null,
      has_changes: false
    }
  },
  computed: {
    has_error() {
      return this.$_.filter(this.errors, e => e).length > 0
    }
  },
  created() {
    // initialize update values, if some are not set
    if(this.values) {
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
    }
  }
}
</script>

<style scoped>

</style>
