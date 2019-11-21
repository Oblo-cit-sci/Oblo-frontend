<template lang="pug">
  div(
    :class="[{ composite: (aspect.type === 'composite' && mode === 'edit'),  disabled: disable, invisible_class: invisible_class}]"
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
    div(v-if="!use_regular && aspect.attr.alternative !== undefined")
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
        get_aspect_vue_component, label, pack_value
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
            aspect_loc: {
                type: Array,
                required: true
            },
            extra: {
                type: Object,
                default: () => {
                    return {}
                }
            },
        },
        data() {
            return {
                use_regular: true // leave it null, to catch create triggering watcher
            }
        },
        created() {
            // todo no idea, why the shortcut below does not work
            if (!this.has_value) {
                console.log("has no value", this.aspect.name)
                this.use_regular = true
            } else {
                this.use_regular = this.value.hasOwnProperty("regular") ? this.value.regular : true
            }
        },
        // boolean check is not required, since "false" is the default
        computed: {
            // at the moment
            has_value() {
                return this.value || false
            },
            has_alternative() {
                return this.aspect.attr.hasOwnProperty("alternative")
            },
            condition_fail() {
                //console.log("condition_fail?", this.aspect, this.aspect.name, this.condition)
                // todo this getting of the value, could mayeb also go into the helper...
                if (this.aspect.attr.hasOwnProperty("condition")) {
                    //console.log("condition", this.aspect.name, this.extra[LIST_INDEX])
                    let aspect_location = complete_aspect_loc(
                        aspect_loc_uuid(this.aspect_loc),
                        aspect_loc_str2arr(this.aspect.attr.condition.aspect),
                        this.extra[LIST_INDEX])
                    //console.log("val", aspect_location)
                    let condition_value = this.$store.getters[ENTRIES_VALUE](aspect_location)
                    return !check_condition_value(condition_value, this.aspect.attr.condition)
                } else {
                    return false
                }
            },
            value: function () {
                //console.log(this.aspect.name)
                if (this.aspect.attr.IDAspect) {
                    let this_uuid = aspect_loc_uuid(this.aspect_loc)
                    let entry = this.$store.getters[ENTRIES_GET_ENTRY](this_uuid)
                    let index = this.$_.last(entry.refs.parent.aspect_loc)[1]
                    return {value: index + 1}
                }
                if (this.aspect.attr.ref_value) {
                    //console.log("ref")
                    // GRAB REF
                    let aspect_location = complete_aspect_loc(
                        aspect_loc_uuid(this.aspect_loc),
                        aspect_loc_str2arr(this.aspect.attr.ref_value),
                        this.extra[LIST_INDEX])
                    // console.log("value ref,  ",this.aspect.name, aspect_location)
                    let ref_value = this.$store.getters[ENTRIES_VALUE](aspect_location)
                    //console.log("ref value", ref_value)
                    if(ref_value === undefined) {
                        console.log("broken ref!")
                        ref_value = aspect_default_value(this.aspect)
                    }

                    if (ref_value.hasOwnProperty(REGULAR)) {
                        delete ref_value[REGULAR]
                    }

                    if (this.aspect.attr.ref_update === "create") {
                        //console.log("ref-create", this.aspect_loc)
                        let stored_value = this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
                        //console.log("stored", stored_value)
                        if (this.$_.isEqual(stored_value, aspect_default_value(this.aspect))) {
                            //console.log("ref-create:updating")
                            this.update_value(ref_value.value)
                            return ref_value
                        }
                        else {
                            return stored_value
                        }
                    } else {
                        //console.log("updating")
                        this.update_value(ref_value.value)
                        return ref_value
                    }
                } else if (this.aspect.attr.ref_length) { // this is for lists
                    let location_array = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc), aspect_loc_str2arr(this.aspect.attr.ref_length))

                    // USES lists or ints
                    const length_value = this.$store.getters[ENTRIES_VALUE](location_array).value
                    // todo use the aspect_descr to find out if its a list or an int
                    if(Array.isArray(length_value)) {
                        this.extra["ref_length"] = length_value.length
                    } else {
                        this.extra["ref_length"] = parseInt(length_value)
                    }

                    return this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
                } else {
                    let value = this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
                    if(value === undefined) {
                        console.log("undefined", this.aspect)
                        let raw__new_value = aspect_raw_default_value(this.aspect)
                        this.update_value(raw__new_value)
                        return pack_value(raw__new_value)
                    }
                    return value
                }
            },
            show_title_description() {
                if ((this.aspect.attr.placeholder || this.aspect.type === "options") && this.mode === VIEW) {
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
                if (this.aspect.attr.ref_value || this.fixed_value) {
                    return VIEW
                }
                if (this.aspect.attr.mode !== undefined) {
                    return this.aspect.attr.mode
                } else
                    return this.mode
            },
            regular_value_text() {
                return this.aspect.attr["alternative-true"] || "regular value"
            },
            alternative_value_text() {
                return this.aspect.attr["alternative-false"] || "alternative value"
            },
            alt_mode() {
                if (this.fixed_value)
                    return VIEW
                else
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
            fixed_value() {
                if (this.use_regular) {
                    return this.aspect.attr.hasOwnProperty("value")
                } else {
                    return this.aspect.attr.alternative.attr.hasOwnProperty("value")
                }
            },
            invisible_class() {
                //console.log(this.aspect.name "inv", this.aspect.attr.hasOwnProperty("visible") )
                return this.aspect.attr.hasOwnProperty("visible") ? (!this.aspect.attr.visible) : false
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
                return {
                    title: this.extra.no_title ? "" : this.aspect_label(aspect),
                    description: aspect.description || ""
                }
            },
            aspect_label(aspect) {
                return label(aspect)
            },
            aspectComponent(aspect, mode) {
                return get_aspect_vue_component(aspect, mode, this.extra)
            },
            update_value(event) {
                //console.log("saving", event, this.aspect.name)
                if(this.aspect.attr.ref_value) {
                    let stored_value = this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
                    if(stored_value.value === event) {
                        //console.log("not emitting ref_value", event, stored_value)
                        return
                    }
                }
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

  .invisible_class {
    display: none
  }
</style>
