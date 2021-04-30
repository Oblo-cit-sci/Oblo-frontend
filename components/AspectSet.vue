<template lang="pug">
  div
    div(v-if="normal_grid")
      v-row(v-for="aspect in aspects" :key="aspect.name")
        v-col.py-0(cols=10)
          Aspect(:aspect="aspect"
            :ext_value.sync="i_values[aspect.name]"
            :conditionals="i_values"
            @update:error="errors[aspect.name] = $event"
            @update:state="state[aspect.name] = $event"
            @aspectAction="aspectAction($event)"
            :extra="{clearable:false}"
            :mode="mode")
    div(v-else)
      v-row
        v-col(
          v-for="aspect in aspects" :key="aspect.name"
          v-if="!hide_aspect_col(aspect)"
          alignSelf="stretch" cols="12" :sm="6" :md="4" :lg="4" :xl="2")
          Aspect(:aspect="aspect"
            :ext_value.sync="i_values[aspect.name]"
            :conditionals="i_values"
            @update:error="errors[aspect.name] = $event"
            @update:state="state[aspect.name] = $event"
            @aspectAction="aspectAction($event)"
            :extra="{clearable:false}"
            :mode="mode")
    slot(name="pre_validation")
    v-row.mt-2(v-if="show_validation")
      AspectSetValidation(:aspects="aspects" :aspects_state="state")
</template>

<script>
import {aspect_default_value} from "~/lib/aspect"
import Aspect from "~/components/Aspect"
import {ASP_ERROR, ASP_UNSET, VIEW} from "~/lib/consts"
import AspectSetValidation from "~/components/AspectSetValidation";
import AspectListMixin from "~/components/global/AspectListMixin";

export default {
  name: "AspectSet",
  components: {AspectSetValidation, Aspect},
  mixins: [AspectListMixin],
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
    include_validation: {
      type: Boolean
    },
    hide_validation_if_valid: {
      type: Boolean,
      default: true
    },
    compact: Boolean
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
      // state should replace, error including: unset, set, error, disabled
      errors: this.$_.mapValues(aspectMap, () => null),
      state: this.$_.mapValues(aspectMap, () => null),
      initial_values: null,
      has_changes: false,
    }
  },
  computed: {
    aspect_names() {
      return this.$_.map(this.aspects, "name")
    },
    normal_grid() {
      return !this.compact
    },
    has_error() {
      return this.$_.filter(this.errors, e => e).length > 0
    },
    is_complete() {
      for(let aspect of this.aspect_names){
          // console.log(aspect, this.state[aspect])
          if([ASP_UNSET,ASP_ERROR].includes(this.state[aspect])) {
            return false
          }
      }
      return true
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
  methods: {
    aspectAction(event) {
      this.$emit("aspectAction",event)
    },
    hide_aspect_col(aspect) {
      return this.state[aspect.name] === 'disabled' && aspect.attr?.hide_on_disabled
    }
  },
  watch: {
    i_values: {
      deep: true,
      handler() {
        this.$emit("update:values", this.i_values)
        this.has_changes = !this.$_.isEqual(this.initial_values, this.i_values)
      }
    },
    has_errors: {
      deep: true,
      handler(has_errs) {
        // console.log("er up")
        this.$emit("has_errors", has_errs)
      }
    },
    state: {
      immediate: true,
      deep: true,
      handler: function (state) {
        // console.log("set state", state)
        this.$emit("update:state", state)
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
