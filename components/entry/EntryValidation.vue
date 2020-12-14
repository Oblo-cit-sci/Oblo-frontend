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
    aspect_default_value,
    aspect_raw_default_value,
    disabled_by_condition,
    label,
    loc_append,
    pack_value
  } from "~/lib/aspect";
  import {ASPECT, COMPONENT, COMPOSITE, EDIT, ENTRYLIST, INDEX, LIST} from "~/lib/consts";
  import {item_count_name} from "~/lib/listaspects";


  const OK = 0
  const MISSING = 1
  const LIST_NOT_ENOUGH = 2
  const COMPOSITE_INCOMPLETE = 3
  const LISTITEM_INCOMPLETE = 4

  export default {
    name: "EntryValidation",
    props: {
      value: Boolean, // we use that in the parent to have as v-model
      entry: Object,
      template_slug: String
    },
    components: {},
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
      template() {
        const lang = this.$store.getters["user/settings"].domain_language
        return this.$store.getters["templates/entry_type"](this.template_slug, lang)
      },
      missing() {
        const aspects = this.template.aspects
        // console.log("validation update")
        let missing = []
        for (let aspect of aspects) {

          let required = true
          required = this.$_.get(aspect,"attr.required", true)
          if (required) {
            // todo, value thing not so elegant...
            // todo not always packed
            // const unpacked = this.$_.get(aspect, "attr.unpacked", false)
            const a_w_value = this.entry.values[aspect.name] || aspect_default_value(aspect)
            let a_value = a_w_value.value
            // if (!unpacked) {
            // a_value = a_w_value.value
            // }
            const base_aspect_loc = loc_append([[EDIT, this.entry.uuid]], ASPECT, aspect.name)
            const validation = this.validate_aspect(aspect, a_w_value, base_aspect_loc)
            const valid = validation[0]
            const invalid_message = validation[1]
            let add_text = ""
            const aspect_label = label(aspect)
            if (valid === MISSING) {
              add_text = this.$t("comp.entry_validation.msgs.missing", {aspect_label})
            } else if (valid === LIST_NOT_ENOUGH) {
              add_text = this.$t("comp.entry_validation.msgs.list_not_enough", {
                aspect_label,
                item_name: item_count_name(aspect, a_value.length)
              }) + " (" + a_value.length + "/" + aspect.attr.min + ")"
            } else if (valid === COMPOSITE_INCOMPLETE) {
              add_text = this.$t("comp.entry_validation.msgs.composite_incomplete", {
                aspect_label,
                invalid_components_msgs: invalid_message.join(", ")
              })
            } else if (valid === LISTITEM_INCOMPLETE) {
              add_text = this.$t("comp.entry_validation.msgs.listitem_incomplete", {
                aspect_label,
                invalid_item_msgs: invalid_message.join(", ")
              })
            }
            if (add_text) {
              if (this.has_pages) {
                let page = (aspect.attr.page || 0) + 1
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
      attr(aspect) {
        return aspect.attr || {}
      },
      validate_aspect(aspect, a_w_value, aspect_loc, item_index) {
        //console.log(aspect.name, a_w_value, aspect, aspect_loc)
        let required = true
        if (this.$_.get(aspect, "attr.required")) {
          required = aspect.attr.required
        }
        if (!required) {
          return [OK]
        }
        const raw_value = this.$_.get(aspect, "attr.unpacked", false) ? a_w_value : a_w_value.value
        //console.log(raw_value)
        //console.log("val", aspect.name, aspect_loc)

        const a_default = aspect_raw_default_value(aspect)
        if (this.attr(aspect).IDAspect) {
          return [OK]
        }
        if (disabled_by_condition(this.$store, aspect, aspect_loc, item_index)) {
          return [OK]
        }
        if (!raw_value) {
          return [MISSING, ""]
        }
        if (this.$_.isEqual(raw_value,a_default)) {
          return [MISSING, ""]
        } else if ([LIST, ENTRYLIST].includes(aspect.type)) {
          if (this.attr(aspect).min !== null && raw_value.length < this.attr(aspect).min) {
            return [LIST_NOT_ENOUGH, ""]
          }
          if (aspect.type === LIST) {
            //let item_validations = []
            let incomplete_items = []
            for (let item_index in raw_value) {
              const item = raw_value[item_index]
              const item_loc = loc_append(aspect_loc, INDEX, item_index)
              const validation = this.validate_aspect(aspect.list_items, item || pack_value(null), item_loc, item_index)
              if (validation[0] !== OK) {
                incomplete_items.push(parseInt(item_index) + 1)
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
            const comp_loc = loc_append(aspect_loc, COMPONENT, component.name)
            //console.log("-> comp", component.name, raw_value[component.name])
            let component_validations = this.validate_aspect(component, raw_value[component.name] || pack_value(null), comp_loc, item_index)
            if (component_validations[0] !== OK) {
              missing_components.push(label(component))
            }
          }
          if (missing_components.length > 0) {
            return [COMPOSITE_INCOMPLETE, missing_components]
          } else {
            return [OK]
          }
        }
        // default
        return [OK]
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
