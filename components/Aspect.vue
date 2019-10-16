<template lang="pug">
  div(
    :class="[{ composite: (aspect.type === 'composite' && mode === 'edit'),  disabled: disable}]"
    :id="aspect_id" v-if="enabled_visible")
    Title_Description(
      v-if="show_title_description"
      v-bind="title_description(aspect)"
      :disabled="disable"
      :disabled_text="disabled_text"
      :mode="real_mode"
      :placeholder="is_placeholder")
    v-switch(v-if="has_alternative"
      v-model="use_regular"
      hideDetails
      :label="use_regular ? regular_value_text: alternative_value_text"
      color="primary")
    component(
      v-if="use_regular"
      :is="aspectComponent(aspect, mode)"
      :aspect="aspect"
      :aspect_loc="aspect_loc"
      :mvalue="value"
      :extra="extra"
      :disabled="regular_disable"
      :mode="real_mode"
      v-on:update_value="update_value($event)"
      v-on:entryAction="$emit('entryAction',$event)")
    div(v-if="!use_regular")
      Title_Description(v-bind="title_description(aspect.attr.alternative)")
      component(
        :is="aspectComponent(aspect.attr.alternative)"
        v-bind:aspect="aspect.attr.alternative"
        v-on:update_value="update_value($event)"
        :mvalue="value"
        :mode="alt_mode")
</template>

<script>

    import {LIST_INDEX, REGULAR, VIEW} from "../lib/consts";

    import Title_Description from "./Title_Description";
    import {
        aspect_default_value,
        aspect_loc_str,
        aspect_loc_str2arr, aspect_loc_uuid,
        aspect_raw_default_value, check_condition_value, complete_aspect_loc,
        get_aspect_vue_component, pack_value
    } from "../lib/aspect";
    import {ENTRIES_GET_ENTRY, ENTRIES_SET_ENTRY_VALUE, ENTRIES_VALUE} from "../lib/store_consts";

    export default {
        name: "Aspect",
        components: {
            Title_Description
        },
        props: {
            mode: {
                type: String,
                default: "view"
            },
            aspect: Object,
            aspect_loc:
                {type: Array},
            //value: Object, // a wrapper, which  might encode "exceptional_value"
            extra: {
                type: Object,
                default: () => {
                    return {}
                }
            },
        },
        data() {
            return {
                has_alternative: false,
                use_regular:  null // leave it null, to catch create triggering watcher
            }
        },
        created() {
            try {
                this.has_alternative = this.aspect.attr.hasOwnProperty("alternative")
                if (!this.aspect_loc) {
                    console.log("Aspect.created: no aspect_loc defined for", this.aspect.name, "emitting up results")
                }
                try {
                    this.use_regular = this.value.hasOwnProperty("regular") ? this.value.regular : true
                } catch (e) {
                    console.log("Aspect.created, ERROR, no value for aspect:", this.aspect.name)
                    this.update_value(aspect_raw_default_value(this.aspect))
                    this.use_regular = true
                }
            } catch (e) {
                console.log("DEV, crash on Aspect", this.aspect.name, this.aspect, this.aspect_loc)
                console.log(e)
            }
        },
        // boolean check is not required, since "false" is the default
        computed: {
            condition_fail() {
                //console.log("condition_fail?", this.aspect, this.aspect.name, this.condition)
                // todo this getting of the value, could mayeb also go into the helper...
                if (this.aspect.attr.hasOwnProperty("condition")) {
                    let aspect_location = complete_aspect_loc(
                        aspect_loc_uuid(this.aspect_loc),
                        aspect_loc_str2arr(this.aspect.attr.condition.aspect),
                        this.extra[LIST_INDEX])
                    let condition_value = this.$store.getters[ENTRIES_VALUE](aspect_location)
                    return !check_condition_value(condition_value, this.aspect.attr.condition)
                } else {
                    return false
                }
            },
            value: function () {
                if (this.aspect.attr.IDAspect) {
                    let this_uuid = aspect_loc_uuid(this.aspect_loc)
                    let entry = this.$store.getters[ENTRIES_GET_ENTRY](this_uuid)
                    let index = this.$_.last(entry.refs.parent.aspect_loc)[1]
                    return {value: index + 1}
                }
                if (this.aspect.attr.ref_value) {
                    if (this.aspect.attr.ref_update === "create") {
                        // console.log("ref-create", this.aspect_loc)
                        let value = this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
                        // console.log("stored value", value, "default", aspect_default_value(this.$store, this.aspect))
                        // console.log(value !== aspect_default_value(this.$store, this.aspect))
                        if (!this.$_.isEqual(value, aspect_default_value(this.aspect))) {
                            return value
                        }
                    }
                    // console.log("calculating and setting")
                    let aspect_location = complete_aspect_loc(
                        aspect_loc_uuid(this.aspect_loc),
                        aspect_loc_str2arr(this.aspect.attr.ref_value),
                        this.extra[LIST_INDEX])
                    // console.log("value ref,  ",this.aspect.name, aspect_location)
                    let value = this.$store.getters[ENTRIES_VALUE](aspect_location)
                    console.log("Aspect.value ref_value: received value", value)
                    // console.log("my stored value", this.$store.getters["entries/value"](this.aspect_loc))
                    if (value.hasOwnProperty(REGULAR)) {
                        delete value[REGULAR]
                    }
                    this.update_value(value.value)
                    return value
                } else if (this.aspect.attr.ref_length) { // this is for lists
                    let location_array = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc), aspect_loc_str2arr(this.aspect.attr.ref_length))
                    this.extra["ref_length"] = this.$store.getters[ENTRIES_VALUE](location_array).value.length
                    return this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
                } else {
                    return this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
                }
            },
            show_title_description() {
                if (this.extra.hasOwnProperty("show_title_descr")) {
                    return this.extra.show_title_descr
                } else
                    return true
            },
            enabled_visible() {
                return !this.disable || !this.aspect.attr.hide_on_disabled
            },
            real_mode() {
                if (this.aspect.attr.ref_value) {
                    return VIEW
                }
                if (this.aspect.attr.mode !== undefined) {
                    return this.aspect.attr.mode
                } else
                    return this.mode
            },
            is_placeholder() {
                if(this.aspect.attr.placeholder) {
                    return true
                } else {
                    return false
                }
            },
            /*raw_value() {
                if (!this.value) { // failsafe
                    return aspect_raw_default_value(this.aspect)
                } else {
                    return this.value.value
                }
            },*/
            aspect_label() {
                if (this.aspect.label !== undefined) {
                    return this.aspect.label
                } else {
                    return this.aspect.name
                }
            },
            regular_value_text() {
                return this.aspect.attr["alternative-true"] || "regular value"
            },
            alternative_value_text() {
                return this.aspect.attr["alternative-false"] || "alternative value"
            },
            alt_mode() {
                console.log(this.aspect)
                return this.aspect.attr.alternative.attr.mode || this.mode
            },
            disable() {
                return this.condition_fail || this.aspect.attr.disable
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
                return {
                    title: this.extra.no_title ? "" : this.aspect_label,
                    description: aspect.description || ""
                }
            },
            aspectComponent(aspect, mode) {
                return get_aspect_vue_component(aspect, mode, this.extra)
            },
            update_value(event) {
                //console.log("aspect.update_value", event, "reg ?", this.use_regular)
                if (this.has_alternative && this.use_regular) {
                    if (this.aspect.attr.hasOwnProperty("alternative-activate-on-value")) {
                        if (event === this.aspect.attr["alternative-activate-on-value"]) {
                            this.use_regular = false
                            console.log("weird stop in aspect...")
                            return
                        }
                    }
                }
                let up_value = pack_value(event)
                if (!this.use_regular) {
                    up_value.regular = false
                } else {
                    delete up_value.regular
                }
                this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {aspect_loc: this.aspect_loc, value: up_value})
            }
        },
        watch: {
            use_regular(val, old_val) {
                // catch from created. keep this!
                if (old_val === null) {
                    return
                }
                // use alternative aspect
                if (!val) {
                    const fixed_value = this.aspect.attr.alternative.attr.value
                    if (fixed_value !== undefined) {
                        this.update_value(fixed_value)
                    } else {
                        this.update_value(aspect_raw_default_value(this.aspect.attr.alternative))
                    }
                } else {
                    this.update_value(aspect_raw_default_value(this.aspect))
                }
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

</style>
