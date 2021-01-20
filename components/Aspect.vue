<template lang="pug">
  div.pa-2(
    :class="[{composite: (aspect.type === 'composite' && mode === 'edit'),  disabled: disable, invisible_class: invisible_class}]"
    :id="aspect_id" v-if="visible && has_value")
    Title_Description(
      :style="{'display': 'inline-block'}"
      v-if="show_title_description"
      :aspect="aspect"
      :no_title="extra.no_title"
      :description_as_html="descr_as_html"
      :note=note
      :disabled="disable"
      :disabled_text="disabled_text"
      :mode="real_mode")
      span.grey--text(v-if="is_optional") &nbsp;({{$t("comp.aspect.optional")}})
    v-icon.ml-2(v-if="is_flex" color='green' size="32" @click="flip_flex_mode") {{flex_switch_icon}}
    component(
      v-if="!disable"
      :is="aspectComponent(aspect, mode)"
      :mvalue="mvalue"
      :aspect="aspect"
      :aspect_loc="aspect_loc"
      :disabled="disable"
      :mode="real_mode"
      :extra="extra"
      v-bind="extra"
      :conditionals="conditionals"
      @has_changed="$emit('has_changed',$event)"
      :change_status="has_changed"
      v-on:update_value="update_value($event)"
      @update:error="$emit('update:error', $event)"
      v-on:aspectAction="aspectAction($event)")
    div(v-if="has_action && edit")
      AspectAction(:aspect="aspect" :mvalue="mvalue" :extra="extra")
</template>

<script>

import {DRAFT, EDIT, FLEX, VIEW} from "~/lib/consts";

import Title_Description from "./util/Title_Description";
import {
  aspect_default_value,
  aspect_loc2aspect_descr_loc,
  aspect_loc_str,
  get_aspect_vue_component
} from "~/lib/aspect";
import AspectMixin from "./aspects/AspectMixin";
import AspectAction from "~/components/aspect_utils/AspectAction"


export default {
  name: "Aspect",
  components: {
    AspectAction,
    Title_Description
  },
  mixins: [AspectMixin],
  data() {
    return {
      flex_mode: null
    }
  },
  created() {
    // todo no idea, why the shortcut below does not work
    // console.log("aspect create", this.aspect.name, this.value)
    if (!this.has_value) {
      console.log("has no value", this.aspect.name)
    }
    if (this.attr.cache) {
      const entry = this.get_entry()
      if (entry.version === 0 && entry.status === DRAFT && this.$_.isEqual(this.mvalue, aspect_default_value(this.aspect))) {
        const cached_value = this.$store.getters["get_aspect_cache"](entry.template.slug, this.aspect.name)
        if (cached_value) {
          this.$store.dispatch("entries/set_entry_value", {aspect_loc: this.aspect_loc, value: cached_value})
        }
      }
    }

    if (this.is_flex) {
      this.flex_mode = VIEW
    }
  },
  // boolean check is not required, since "false" is the default
  computed: {
    descr_as_html() {
      return this.attr.descr_as_html
    },
    flex_switch_icon() {
      return this.flex_mode === VIEW ? "mdi-pencil-outline" : "mdi-check"
    },
    // at the moment
    show_title_description() {
      if (((this.attr && this.attr.placeholder) || this.aspect.type === "options") && this.mode === VIEW) {
        return false
      }
      if (this.extra.hasOwnProperty("show_title_descr")) {
        return this.extra.show_title_descr
      } else
        return true
    },
    visible() {
      return !this.disable || !this.attr.hide_on_disabled
    },
    is_flex() {
      return this.mode === FLEX
    },
    real_mode() {
      // console.log("real-mode", this.aspect.name, this.attr)
      if ((this.attr.ref_value) || this.fixed_value) {
        return VIEW
      }
      if (this.attr.mode !== undefined) {
        return this.attr.mode
      }
      // console.log("is flex", this.is_flex, this.flex_mode)
      if (this.is_flex) {
        return this.flex_mode
      }
      return this.mode
    },
    disable() {
      // console.log("Aspect.disable?", this.aspect.name, this.condition_fail)
      return this.condition_fail || this.attr.disable
    },
    has_action() {
      return this.attr.hasOwnProperty("action")
    },
    disabled_text() {
      if (this.condition_fail) {
        return this.attr.condition.disabled_text
      } else {
        return "disabled"
      }
    },
    aspect_id() {
      return aspect_loc_str(this.$_.tail(this.aspect_loc))
    },
    fixed_value() {
      return this.attr.hasOwnProperty("value")
    },
    invisible_class() {
      return !this.$_.get(this.attr, "visible", true)
    }
  },
  methods: {
    aspectAction(event) {
      if (event.action !== "clear" || this.extra.listitem)
        this.$emit('aspectAction',event)
    },
    flip_flex_mode() {
      this.flex_mode = this.flex_mode === VIEW ? EDIT : VIEW
      this.$emit("flex_mode_change", this.flex_mode)
    },
    // to be called from parent (with ref)
    set_flex_mode(mode) {
      this.flex_mode = mode
    },
    note() {
      let note_text = ""
      if (this.aspect_loc) {
        const aspect_descr_loc = aspect_loc2aspect_descr_loc(this.aspect_loc)
        note_text = this.$store.getters["templates/note"](aspect_descr_loc)
      }
      return {text: note_text, note_class: "note"}
    },
    aspectComponent(aspect, mode) {
      return get_aspect_vue_component(aspect, mode, this.extra)
    }
  }
}
</script>

<style scoped>
/* ignore warning about being not used */
.composite {
  border-left: 1px #8080806b solid;
  padding-left: 5px;
}

.invisible_class {
  display: none
}
</style>
