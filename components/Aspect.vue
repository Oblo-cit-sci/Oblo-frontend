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
      span.grey--text(v-if="show_is_optional") &nbsp;({{$t("comp.aspect.optional")}})
    component(
      v-if="!disable"
      :is="aspectComponent(aspect, mode)"
      :mvalue="mvalue"
      :aspect="aspect"
      :entry_uuid="entry_uuid"
      :disabled="disable"
      :mode="real_mode"
      :extra="merge_extra"
      v-bind="merge_extra"
      :conditionals="conditionals"
      @has_changed="$emit('has_changed',$event)"
      ref="aspect_component"
      :change_status="has_changed"
      v-on:update_value="update_value($event)"
      @update:error="$emit('update:error', $event)"
      @aspectAction="aspectAction($event)")
    div(v-if="has_action && is_editable_mode")
      AspectAction(:aspect="aspect" :mvalue="mvalue" :extra="extra" @aspectAction="aspectAction($event)" :has_changed="has_changed")
</template>

<script>


import {ASP_DISABLED, ASP_SET, ASP_UNSET, DRAFT, EDIT, META, REVIEW, VIEW} from "~/lib/consts";


import Title_Description from "./util/Title_Description";
import {
  aspect_default_value, aspect_raw_default_value,
  get_aspect_vue_component, is_editable_mode, pack_value, unpack
} from "~/lib/aspect";
import AspectAction from "~/components/aspect_utils/AspectAction"
import AspectConditionChecker from "~/components/aspect_utils/AspectConditionChecker"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"

/**
 * @group Aspects
 * this is the Component for creating all kinds of Aspects
 */
export default {
  name: "Aspect",
  components: {
    AspectAction,
    Title_Description
  },
  mixins: [AspectConditionChecker],
  props: {
    aspect: {
      type: Object,
      required: true
    },
    ext_value: {
      type: Object,
      default: undefined
    },
    mode: {
      type: String,
      default: VIEW,
      validator: (value) => {
        return [VIEW, EDIT, REVIEW].includes(value)
      }
    },
    is_entry_meta: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    entry_uuid: String,
    conditionals: {
      type: [Array, Object]
    },
    extra: {
      type: Object,
      default: () => {
        return {}
      }
    },
    is_set: {
      type: Boolean
    }
  },
  data() {
    return {
      original_value: null
    }
  },
  /**
   * checks if there is a value. and eventually sets the caches
   */
  created() {
    // todo no idea, why the shortcut below does not work
    // console.log("aspect create", this.aspect.name, this.value)
    if (!this.has_value) {
      console.log("has no value", this.aspect.name)
    }
    if (this.track_change) {
      this.original_value = this.$_.cloneDeep(this.value)
    }
    if (this.attr.cache) {
      const entry = this.get_entry()
      if (entry.version === 0 && entry.status === DRAFT && this.$_.isEqual(this.mvalue, aspect_default_value(this.aspect))) {
        const cached_value = this.$store.getters["get_aspect_cache"](entry.template.slug, this.aspect.name)
        if (cached_value) {
          // cleaner to call emit otherwise we end up in an endless loop
          // this.update_value(cached_value)
          this.$emit("update:ext_value", cached_value)
        }
      }
    }
  },
  // boolean check is not required, since "false" is the default
  computed: {
    attr() {
      return this.$_.get(this.aspect, "attr", {})
    },
    track_change() {
      return this.attr.track_change || false
    },
    is_required() {
      return this.$_.get(this.attr, "required", true)
    },
    is_editable_mode() {
      return is_editable_mode(this.mode)
    },
    show_is_optional() {
      return !this.is_required && this.is_editable_mode
    },
    disable() {
      // console.log("Aspect.disable?", this.aspect.name, this.condition_fail)
      return this.condition_fail || this.attr.disable || this.disabled
    },
    condition_fail() {
      return this._condition_fail(this.aspect, this.conditionals)
    },
    has_value() {
      return this.mvalue !== undefined || false
    },
    readOnly() {
      return this.mode === VIEW
    },
    asp_state() {
      // console.log("asp-state", this.aspect.name, this.i_is_set, this.disable)
      if (this.i_is_set) {
        return ASP_SET
      } else if (this.disable) {
        return ASP_DISABLED
      } else {
        return ASP_UNSET
      }
      // ERROR?
    },
    mvalue() {
      if (this.ext_value !== undefined) {
        return this.ext_value
      } else {
        const raw = aspect_raw_default_value(this.aspect)
        console.log("no aspect-loc and no ext_value using default value", raw)
        return {value: raw}
      }
    },
    value() {
      return unpack(this.mvalue)
    },
    i_is_set() {
      return this.value !== aspect_raw_default_value(this.aspect)
    },
    has_changed() {
      // console.log("aspmxn.has_changed", this.aspect.type, !this.$_.isEqual(this.value, this.original_value))
      //   this.value, this.original_value, !this.$_.isEqual(this.value,  this.original_value))
      return this.track_change && !this.$_.isEqual(this.value, this.original_value)
    },
    /**
     * if description is html
     */
    descr_as_html() {
      return this.$_.get(this.attr, "descr_as_html", false)
    },
    merge_extra() {
      const merge = Object.assign(Object.assign({}, this.extra), this.attr.extra)
      if (merge.add_undo) {
        merge.prependIcon = "mdi-undo"
      }
      return merge
    },
    // at the moment
    show_title_description() {
      if (((this.attr && this.attr.placeholder) || this.aspect.type === "options") && !this.is_editable_mode) {
        return false
      }
      if (this.extra.hasOwnProperty("show_title_descr")) {
        return this.extra.show_title_descr
      } else return !this.$_.get(this.extra, "no_title", false);
    },
    visible() {
      let hide_on_disable = this.$_.get(this.attr, "hide_on_disabled", true)
      return this.attr.visible === false || !this.disable || !hide_on_disable
    },
    /**
     * @returns {String|string|null|*}
     */
    real_mode() {
      // console.log("real-mode", this.aspect.name, this.attr)
      if (this.fixed_value) {
        return VIEW
      }
      if (this.attr.mode !== undefined) {
        return this.attr.mode
      }
      return this.mode
    },
    has_action() {
      return this.attr.action !== undefined
    },
    disabled_text() {
      if (this.disable) {
        if (this.condition_fail) {
          return this.attr.condition.disabled_text
        } else {
          return "disabled"
        }
      }
    },
    /**
     * the html-element id pased on the location. important for scrolling...
     * @returns {string}
     */
    aspect_id() {
      return `${this.aspect.name}_${this._uid}`
    },
    fixed_value() {
      return this.attr.hasOwnProperty("value")
    },
    invisible_class() {
      return !this.$_.get(this.attr, "visible", true)
    }
  },
  methods: {
    update_value(packed_value) {
      // console.log(packed_value)
      let up_value = packed_value
      if (packed_value.only_value) {
        up_value = packed_value.value === undefined ? null : packed_value.value
      }
      // todo this does not make a lot of sense yet...
      if (this.attr.cache) {
        this.$store.commit("add_cache", {
          template: this.get_entry().template.slug,
          aspect: this.aspect.name,
          mvalue: packed_value
        })
      }
      this.$emit("update:ext_value", up_value)
    },
    toString(value) {
      return value || ""
    },
    get_entry() {
      return this.$store.getters["entries/get_entry"](this.entry_uuid)
    },
    refresh_original() {
      this.original_value = this.$_.cloneDeep(this.value)
      if (this.$refs.aspect_component.refresh_original) {
        this.$refs.aspect_component.refresh_original()
      }
    },
    /**
     * execute the action emitted by the concrete aspect-component
     * @param event
     */
    aspectAction(event) {
      // console.log("asp-act", event, this.merge_extra.add_undo)
      if (event.action !== "clear" || this.extra.listitem)
        this.$emit('aspectAction', event)
      if (event.action === "clickPrepend" && this.merge_extra.add_undo) {
        // console.log("reset")
        this.update_value(pack_value(this.original_value))
      }
    },

    /**
     * @vuese
     * return the concrete component based on the type and the mode
     * @param aspect
     * @param mode VIEW | EDIT
     * @returns {any}
     */
    aspectComponent(aspect, mode) {
      return get_aspect_vue_component(aspect, mode, this.extra)
    }
  },
  watch: {
    asp_state: {
      immediate: true,
      handler(value) {
        this.$emit("update:state", value)
      }
    },
    // todo maybe use the default methods from AspectBaseMixin
    condition_fail(fail) {
      if (fail) {
        if (this.value !== aspect_raw_default_value(this.aspect)) {
          this.update_value({
            value: aspect_raw_default_value(this.aspect)
          })
        }
      }
    },
    has_changed(change) {
      // console.log("aspect_mxn.has_changed", this.aspect.name, this.aspect.type, change)
      this.$emit("has_changed", {name: this.aspect.name, change})
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
