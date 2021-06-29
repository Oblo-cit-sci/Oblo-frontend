<template lang="pug">
  div(v-if="is_editable_mode")
    LanguageCodeFallback(v-if="!code_entry_language_match")
    v-checkbox(
      v-if="select_check"
      v-model="check_box_value"
      :label="check_box_value ? options[1].text : options[0].text")
    SingleSelect(v-else :options="options"
      :selection.sync="selection"
      :force_view="force_view"
      :disabled="disabled"
      :data_source="data_source"
      v-bind="extra"
      :hide_details="hide_details"
      :clearable="!is_required")
  div(v-else)
    div(v-if="value")
      div
        div.mt-1(v-if="value_icon")
          v-img(:src="value_icon" contain max-height="40")
        div
          p.pl-2(v-if="select_check" class="text-uppercase") {{check_box_value ? options[1].text : options[0].text}}
          p.body-1.readonly-aspect.break_word(v-else) {{view_mode_text}}
        div.pt-2(v-if="view_mode_description" style="clear:left") {{$t('comp.select_asp.descr')}}: {{view_mode_description}}
</template>

<script>
import SelectMixin from "./SelectMixin";
import AspectComponentMixin from "./AspectComponentMixin";
import LanguageCodeFallback from "~/components/aspect_utils/LanguageCodeFallback";
import SingleSelect from "~/components/input/SingleSelect";

export default {
  name: "SelectAspect",
  components: {SingleSelect, LanguageCodeFallback},
  mixins: [SelectMixin, AspectComponentMixin],
  props: {
    aspect: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      init: true
    }
  },
  created() {
    if (this.select_check) {
      this.check_box_value = this.value === this.options[1].value // or maybe a value/default...
      if (this.aspect.items.length !== 2) {
        console.log("Aspect ", this.aspect.name, "is a select with check but has not exactly 2 items")
      }
    }
    this.set_selection()
  },
  methods: {
    set_selection() {
      // console.log("SelectAspect", this.value)
      // debugger
      if (this.value !== null) {
        // console.log(this.value)
        this.selection = this.$_.find(this.options, (o) => {
          return o.value === this.value
        })
        if (this.selection === undefined) {
          this.selection = null
          this.update_value(null)
        }
      } else {
        // console.log(this.selection)
        this.selection = null
        this.init = false
      }
    },
  },
  computed: {
    force_view() {
      return this.attr.force_view
    },
    has_error() {
      return this.is_required && !this.value
    },
    view_mode_text() {
      if (this.selection) {
        return this.selection.text || this.selection.value
      }
    },
    view_mode_description() {
      if (this.selection) {
        return this.selection.description
      }
    },
    data_source() {
      if (typeof this.aspect.items === "string")
        return this.aspect.items
    },
    value_icon() {
      if (this.selection) {
        if (this.selection.icon) {
          if (this.data_source) {
            return this.$api.entry.url_slug_attachment(this.data_source, this.selection.icon)
          } else {
            return this.$api.static.url(this.selection.icon)
          }
        }
      }
    },
  },
  watch: {
    value() {
      this.set_selection()
    },
    has_error() {
      this.update_error(this.has_error)
    },
    selection() {
      let send_value = this.selection
      // console.log("watch sel",)
      //console.log("Select-selection", this.selection, "/",val, "/",prev_val, !prev_val)
      if (this.init) {
        this.init = false
        return
      }
      if (this.selection === null)
        this.update_value(null)
      else {
        // todo que?
        if (this.attr.only_value) {
          send_value = this.selection
        }
        this.update_mvalue(send_value)
      }
    },
    check_box_value(val) {
      this.update_value(val ? this.options[1].value : this.options[0].value)
    }
  }
}
</script>

<style scoped>

</style>
