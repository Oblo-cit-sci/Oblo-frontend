<template lang="pug">
  div(
    :class="[{composite: (aspect.type === 'composite' && mode === 'edit'),  disabled: disable, invisible_class: invisible_class}]"
    :id="aspect_id" v-if="visible && has_value")
    Title_Description(
      v-if="show_title_description"
      :aspect="aspect"
      :no_title="extra.no_title"
      :note=note
      :disabled="disable"
      :disabled_text="disabled_text"
      :mode="real_mode")
    v-switch(v-if="has_alternative && mode === 'edit'"
      v-model="use_regular"
      hideDetails
      :label="use_regular ? regular_value_text: alternative_value_text"
      color="primary")
    div(v-if="mode === 'view' && !use_regular") {{alternative_value_text}}
    component(
      v-if="use_regular && !disable"
      :is="aspectComponent(aspect, mode)"
      :mvalue="mvalue"
      :aspect="aspect"
      :aspect_loc="aspect_loc"
      :disabled="regular_disable"
      :mode="real_mode"
      :extra="extra"
      v-bind="extra"
      v-on:update_value="update_value($event)"
      @update:error="$emit('update:error', ($event))"
      v-on:aspectAction="$emit('aspectAction',$event)")
    div(v-if="has_action && edit")
      AspectAction(:aspect="aspect" :mvalue="mvalue" :extra="extra")
    div(v-if="!use_regular && aspect.attr.alternative !== undefined")
      Title_Description(:aspect="aspect.attr.alternative")
      component(
        :is="aspectComponent(alternative, mode)"
        :value="value"
        :aspect="alternative"
        :aspect_loc="aspect_loc"
        v-bind="extra"
        v-bind:aspect="aspect.attr.alternative"
        v-on:update_value="update_value($event)"
        :mode="alt_mode")
</template>

<script>

  import {DRAFT, VIEW} from "~/lib/consts";

  import Title_Description from "./util/Title_Description";
  import {
    aspect_default_value,
    aspect_loc2aspect_descr_loc,
    aspect_loc_str,
    get_aspect_vue_component
  } from "~/lib/aspect";
  import AspectMixin from "./aspects/AspectMixin";
  import {TEMPLATES_NOTE} from "~/store/templates";
  import AspectAction from "~/components/aspect_utils/AspectAction"
  import {ENTRIES_SET_ENTRY_VALUE} from "~/store/entries"

  export default {
    name: "Aspect",
    components: {
      AspectAction,
      Title_Description
    },
    mixins: [AspectMixin],
    props: {},
    data() {
      return {}
    },
    created() {
      // todo no idea, why the shortcut below does not work
      // console.log("c", this.aspect)
      // console.log("aspect create", this.aspect.name, this.value)
      if (!this.has_value) {
        console.log("has no value", this.aspect.name)
      }
      if (this.aspect.attr.cache) {
        const entry = this.get_entry()
        if (entry.version === 0 && entry.status === DRAFT && this.$_.isEqual(this.mvalue, aspect_default_value(this.aspect))) {
          const cached_value = this.$store.getters["get_aspect_cache"](entry.template.slug, this.aspect.name)
          if (cached_value) {
            this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {aspect_loc: this.aspect_loc, value: cached_value})
          }
        }
      }
    },
    // boolean check is not required, since "false" is the default
    computed: {
      // at the moment
      show_title_description() {
        if (((this.aspect.attr && this.aspect.attr.placeholder) || this.aspect.type === "options") && this.mode === VIEW) {
          return false
        }
        if (this.extra.hasOwnProperty("show_title_descr")) {
          return this.extra.show_title_descr
        } else
          return true
      },
      visible() {
        return !this.disable || !this.aspect.attr.hide_on_disabled
      },
      real_mode() {
        if ((this.aspect.attr && this.aspect.attr.ref_value) || this.fixed_value) {
          return VIEW
        }
        if (this.aspect.attr && this.aspect.attr.mode !== undefined) {
          return this.aspect.attr.mode
        } else
          return this.mode
      },
      regular_value_text() {
        // TODO 1. should be deprecated
        return this.aspect.attr["alternative-true"] ||
          this.aspect.attr.alternative["regular_text"] || "regular value"
      },
      alternative_value_text() {
        // TODO 1. should be deprecated
        return this.aspect.attr["alternative-false"] ||
          this.aspect.attr.alternative["alternative_text"] || "alternative value"
      },
      alt_mode() {
        if (this.fixed_value)
          return VIEW
        else
          return this.aspect.attr.alternative.attr.mode || this.mode
      },
      disable() {
        return this.condition_fail || this.$_.get(this.aspect.attr, "disable", false)
      },
      has_action() {
        return this.aspect.attr.hasOwnProperty("action")
      },
      regular_disable() {
        return this.disable || !this.use_regular
      },
      disabled_text() {
        if (this.condition_fail) {
          return this.aspect.attr.condition.disabled_text
        } else {
          return "disabled"
        }
      },
      aspect_id() {
        return aspect_loc_str(this.$_.tail(this.aspect_loc))
      },
      fixed_value() {
        if (this.use_regular) {
          return this.aspect.attr.hasOwnProperty("value")
        } else {
          return this.aspect.attr.alternative.attr.hasOwnProperty("value")
        }
      },
      invisible_class() {
        //console.log(this.aspect.name "inv", this.aspect.attr.hasOwnProperty("visible") )
        return (this.aspect.attr && this.aspect.attr.hasOwnProperty("visible")) ? (!this.aspect.attr.visible) : false
      }
    },
    methods: {
      note() {
        let note_text = ""
        if (this.aspect_loc) {
          const aspect_descr_loc = aspect_loc2aspect_descr_loc(this.aspect_loc)
          note_text = this.$store.getters[TEMPLATES_NOTE](aspect_descr_loc)
        }
        return {text: note_text, note_class: "note"}
      },
      aspectComponent(aspect, mode) {
        return get_aspect_vue_component(aspect, mode, this.extra)
      }
    },
    watch: {}
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
