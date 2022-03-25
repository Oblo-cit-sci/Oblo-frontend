<template lang="pug">
  div
    h3 {{$t("comp.entry_validation.h1")}}
    div(v-if="has_missing")
      b {{$t("comp.entry_validation.has_missing")}}
      div {{$t("comp.entry_validation.has_missing_t")}}
    div(v-else) {{$t("comp.entry_validation.ok")}}
    .required_aspect.red--text(v-for="(aspect, i) in missing" :key="i") {{aspect}}
</template>

<script>
import {
  aspect_raw_default_value,
  pack_value, unpack,
  attr
} from "~/lib/aspect";
import {COMPOSITE, LIST} from "~/lib/consts";
import {item_count_name} from "~/lib/listaspects";
import AspectConditionChecker from "~/components/aspect_utils/AspectConditionChecker";
import AspectValueValidation from "~/components/aspect_utils/AspectValueValidation";
import {constant} from "lodash";


const OK = 0
const MISSING = 1
const LIST_NOT_ENOUGH = 2
const COMPOSITE_INCOMPLETE = 3
const LISTITEM_INCOMPLETE = 4
const INVALID_VALUE = 5

/**
 * Requires EntryMixin?
 */
export default {
  name: "EntryValidation",
  props: {
    value: Boolean, // we use that in the parent to have as v-model
    entry: Object,
    template: Object,
  },
  components: {},
  mixins: [AspectConditionChecker, AspectValueValidation],
  data() {
    return {}
  },
  created() {
    // console.log("this.missing", this.missing)
    if (this.missing.length === 0) {
      this.$emit("input", true)
    }
  },
  computed: {
    missing() {
      const aspects = this.template.aspects
      // console.log("validation update")
      let missing = []
      for (let aspect of aspects) {
        // let required = true
        let required = this.$_.get(attr(aspect), "required", true)
        // console.log(aspect.name,  required)
        if (required) {
          const unpacked_value = unpack(this.entry.values[aspect.name]) || aspect_raw_default_value(aspect)
          // THAT'S THE SPICE
          const validation = this.validate_aspect(aspect, unpacked_value, this.entry.values)
          const valid = validation[0]
          let add_text = undefined
          if (valid === OK) {
            // nothing to do
          } else {
            add_text = this.invalid_string(validation, aspect, unpacked_value)
          }
          if (add_text) {
            if (this.has_pages) {
              let page = (attr(aspect).page || 0) + 1
              add_text += `, page: ${page}`
            }
            missing.push(add_text)
          }
        }
      }
      return missing
    },
    has_missing() {
      return this.missing.length > 0
    }
  },
  methods: {
    validate_aspect(aspect, unpacked_value, conditionals) {
      let required = this.$_.get(attr(aspect), "required", true)
      if (!required) {
        return [OK]
      }

      const a_default = aspect_raw_default_value(aspect)

      if (this._condition_fail(aspect, conditionals)) {
        return [OK]
      }

      const value_validation = this.aspect_value_validation(aspect, unpacked_value)
      if (value_validation !== null) {
        return [INVALID_VALUE, value_validation]
      }

      if (unpacked_value === null) {
        // console.warn("no raw value", aspect.label, raw_value)
        return [MISSING, null]
      }
      if (this.$_.isEqual(unpacked_value, a_default)) {
        // console.warn("aspect validation. raw-value is default", aspect.label, raw_value, a_default)
        return [MISSING, null]
      } else if ([LIST].includes(aspect.type)) {
        if (attr(aspect).min !== null && unpacked_value.length < attr(aspect).min) {
          return [LIST_NOT_ENOUGH, ""]
        }
        if (aspect.type === LIST) {
          let incomplete_items = []
          for (let item_index in unpacked_value) {
            const item = unpack(unpacked_value[item_index]) || null
            const validation = this.validate_aspect(aspect.list_items, item , conditionals)
            if (validation[0] !== OK) {
              incomplete_items.push([validation, aspect.list_items, item, parseInt(item_index)])
            }
          }
          if (incomplete_items.length > 0) {
            return [LISTITEM_INCOMPLETE, incomplete_items]
          } else {
            return [OK]
          }
        }
      } else if (aspect.type === COMPOSITE) {
        let missing_components = []
        for (let component of aspect.components) {
          let comp_conditionals = this.entry.values
          if (attr(aspect).use_components_as_conditionals) {
            comp_conditionals = unpacked_value
          } else if (attr(aspect).merge_in_components_as_conditionals) {
            comp_conditionals = Object.assign(this.$_.cloneDeep(unpacked_value), conditionals)
          }
          const component_value = unpack(unpacked_value[component.name]) || aspect_raw_default_value(component)
          // console.log("validate-component",aspect.name, component.name, component_value, comp_conditionals)
          let component_validations = this.validate_aspect(component, component_value, comp_conditionals)
          if (component_validations[0] !== OK) {
            missing_components.push([component_validations, component, component_value])
          }
        }
        if (missing_components.length > 0) {
          // console.warn("component validation fail", aspect.name, missing_components)
          return [COMPOSITE_INCOMPLETE, missing_components]
        } else {
          return [OK]
        }
      }
      // default
      return [OK]
    },
    invalid_string(validation, aspect, unpacked_value, skip_composite_wrapper=false) {
      const error_type = validation[0]
      const error_data = validation[1]
      const aspect_label = aspect.label
      switch (error_type) {
        case MISSING:
          return this.$t("comp.entry_validation.msgs.missing", {aspect_label})
        case LIST_NOT_ENOUGH:
          return this.$t("comp.entry_validation.msgs.list_not_enough", {
            aspect_label,
            item_name: item_count_name(aspect, unpacked_value.length)
          }) + " (" + unpacked_value.length + "/" + aspect.attr.min + ")"
        case COMPOSITE_INCOMPLETE:
          let component_validation_strings = []
          for (let comp_validation of error_data) {
            const [comp_validation_type, comp, comp_value] = comp_validation
            component_validation_strings.push(this.invalid_string(comp_validation_type, comp, comp_value))
          }
          if(skip_composite_wrapper) {
            return component_validation_strings.join(", ")
          }
          return this.$t("comp.entry_validation.msgs.composite_incomplete", {
            aspect_label,
            invalid_components_msgs: component_validation_strings.join(", ")
          })
        case LISTITEM_INCOMPLETE:
          let list_item_validation_strings = []
          for (let item_validation of error_data) {
            const [item_validation_type, list_item, item_value, index] = item_validation
            const item_str = this.invalid_string(item_validation_type, list_item, item_value, true)
            list_item_validation_strings.push(`${index}:(${item_str})`)
          }
          return this.$t("comp.entry_validation.msgs.listitem_incomplete", {
            aspect_label,
            invalid_item_msgs: list_item_validation_strings.join(", ")// "("+this.$_.map(this.invalid_string(error_data[0], aspect.list_items, unpacked_value)) + ")".join(", ")
          })
        case INVALID_VALUE:
          return this.$t("comp.entry_validation.msgs.invalid_value", {
            aspect_label
          })
        default:
          console.warn("Unknown error-type", error_type)
          return undefined
      }
    }
  },
  watch: {
    missing(val, prev_val) {
      if (val.length === 0)
        this.$emit("input", true)
      else if (prev_val.length === 0) {
        this.$emit("input", false)
      }
    }
  }
}
</script>

<style scoped>

.required_aspect {
  margin: 1% 0 0 0;
}
</style>
