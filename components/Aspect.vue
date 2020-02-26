<template lang="pug">
  div(
    :class="[{composite: (aspect.type === 'composite' && mode === 'edit'),  disabled: disable, invisible_class: invisible_class, update_hint:new_in_update}]"
    :id="aspect_id" v-if="visible && has_value")
    Title_Description(
      v-if="show_title_description"
      v-bind="title_description(aspect)"
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
      :value="value"
      :aspect="aspect"
      :aspect_loc="aspect_loc"
      :disabled="regular_disable"
      :mode="real_mode"
      v-on:update_value="update_value($event)"
      @update:error="$emit('update:error', ($event))"
      v-on:entryAction="$emit('entryAction',$event)")
    div(v-if="!use_regular && aspect.attr.alternative !== undefined")
      Title_Description(v-bind="title_description(aspect.attr.alternative)")
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

  import {VIEW} from "../lib/consts";

  import Title_Description from "./Title_Description";
  import {
    aspect_loc2aspect_descr_loc,
    aspect_loc_str,
    get_aspect_vue_component, label
  } from "../lib/aspect";
  import AspectMixin from "./aspects/AspectMixin";
  import {ENTRYTYPES_NOTE} from "../lib/store_consts";

  export default {
    name: "Aspect",
    components: {
      Title_Description
    },
    mixins: [AspectMixin],
    props: {},
    data() {
      return {
        new_in_update: false
      }
    },
    created() {
      // todo no idea, why the shortcut below does not work
      // console.log("c", this.aspect)
      if (!this.has_value) {
        console.log("has no value", this.aspect.name)
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
        return this.condition_fail || (this.aspect.attr && this.aspect.attr.disable)
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
      title_description(aspect) {
        // todo. probably not needed anymore
        if (!aspect) {
          return {
            title: "",
            description: ""
          }
        }
        let note_text = ""
        if(this.aspect_loc) {
          const aspect_descr_loc = aspect_loc2aspect_descr_loc(this.aspect_loc)
          note_text = this.$store.getters[ENTRYTYPES_NOTE](aspect_descr_loc)
        }
        return {
          title: this.extra.no_title ? "" : this.aspect_label(aspect),
          description: aspect.description || "",
          note: {text: note_text, note_class: "note"}
        }
      },
      aspect_label(aspect) {
        return label(aspect)
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

  .update_hint {
    border-left: 2px orange solid;
    padding-left: 5px;
  }

  .invisible_class {
    display: none
  }
</style>
