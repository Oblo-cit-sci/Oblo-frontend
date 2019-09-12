<template lang="pug">
  div(
    :class="[{ composite: aspect.type === 'composite',  disabled: disable}]"
    :id="aspect_id")
    Title_Description(
      v-if="show_title_description"
      v-bind="title_description(aspect)"
      :disabled="disable"
      :disabled_text="disabled_text"
      :mode="real_mode")
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
      :value="raw_value"
      :extra="extra"
      :disabled="regular_disable"
      :mode="real_mode"
      v-on:update_value="update_value($event)"
      v-on:entryAction="$emit('entryAction',$event)"
      v-on:aspectAction="aspectAction($event)")
    div(v-if="!use_regular")
      Title_Description(v-bind="title_description(aspect.attr.alternative)")
      component(
        :is="aspectComponent(aspect.attr.alternative)"
        v-bind:aspect="aspect.attr.alternative"
        v-on:update_value="update_value($event)"
        :value="raw_value"
        :mode="alt_mode")
</template>

<script>

    import {ASPECTACTION, VIEW} from "../lib/consts";

    import Title_Description from "./Title_Description";
    import {
        aspect_label,
        aspect_loc_str,
        aspect_loc_str2arr,
        aspect_raw_default_value,
        MAspectComponent
    } from "../lib/aspect";
    import {ENTRIES_SET_ENTRY_VALUE, ENTRIES_VALUE} from "../lib/store_consts";
    import {aspect_loc_uuid, complete_aspect_loc} from "../lib/client";

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
            disabled: {
                type: Boolean,
                default: false
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
                condition: null,
                use_regular: null
            }
        },
        created() {
            try {
                this.has_alternative = this.aspect.attr.hasOwnProperty("alternative")
                if (this.aspect.attr.hasOwnProperty("condition")) {
                    this.condition = this.aspect.attr.condition
                }
                if (!this.aspect_loc) {
                    console.log("Aspect.created: no aspect_loc defined for", this.aspect.name, "emitting up results")
                }
                this.use_regular = this.value.hasOwnProperty("regular") ? this.value.regular : true

            } catch (e) {
                console.log("DEV, crash on Aspect", this.aspect.name, this.aspect, this.aspect_loc)
                console.log(e)
            }
        },
        // boolean check is not required, since "false" is the default
        computed: {
            condition_fail() {
                //console.log("condition_fail?", this.aspect, this.aspect.name, this.condition)
                if (!this.condition) {
                    return false
                } else {
                    //console.log("checking", this.aspect.name)
                    //console.log("dep on location", this.$_.concat([this.aspect_loc[0]], this.condition.aspect))
                    let condition_value = this.$store.getters["entries/value"](
                        this.$_.concat([this.aspect_loc[0]], this.condition.aspect)).value
                    if(condition_value === null) {
                        return false
                    }
                    const compare = this.condition.compare || "equal"
                    switch (compare) {
                        case "equal":
                            return condition_value !== this.aspect.attr.condition.value
                        case "unequal":
                            return condition_value === this.aspect.attr.condition.value
                    }
                }
            },
            value: function () {
                if (this.aspect.attr.ref_value) {
                    let location_array = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc), aspect_loc_str2arr(this.aspect.attr.ref_value))
                    return this.$store.getters[ENTRIES_VALUE](location_array)
                } else if(this.aspect.attr.ref_length) { // this is for lists
                    let location_array = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc), aspect_loc_str2arr(this.aspect.attr.ref_length))
                    const fixed_length = this.$store.getters[ENTRIES_VALUE](location_array).value.length
                    this.extra["ref_length"] = fixed_length
                    return this.$store.getters["entries/value"](this.aspect_loc)
                } else {
                    return this.$store.getters["entries/value"](this.aspect_loc)
                }
            },
            show_title_description() {
                if (this.extra.hasOwnProperty("show_title_descr")) {
                    return this.extra.show_title_descr
                } else
                    return true
            },
            real_mode() {
                if(this.aspect.attr.ref_value) {
                    return VIEW
                }
                if (this.aspect.attr.mode !== undefined) {
                    return this.aspect.attr.mode
                } else
                    return this.mode
            },
            raw_value() {
                return this.value.value
            },
            regular_value_text() {
                return this.aspect.attr["alternative-true"] || "regular value"
            },
            alternative_value_text() {
                return this.aspect.attr["alternative-false"] || "alternative value"
            },
            alt_mode() {
                return this.aspect.attr.alternative.attr.mode || this.mode
            },
            disable() {
                return this.disabled || this.condition_fail || this.aspect.attr.disable
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
                return aspect_loc_str(this.aspect_loc)
            },
        },
        methods: {
            title_description(aspect) {
                //console.log("title_description", aspect_descr)
                return {
                    title: this.extra.no_title ? "" : aspect_label(aspect),
                    description: aspect.description || ""
                }
            },
            aspectAction(event) {
                console.log("aspect-acion yeah", event)
                this.$emit(ASPECTACTION, event)
            },
            aspectComponent(aspect_descr, mode) {
                return MAspectComponent(aspect_descr, mode, this.extra)
            },
            update_value(event) {
                //console.log("aspect.emit_up", this.aspect_loc, this.value, event)
                if (this.has_alternative && this.use_regular) {
                    if (this.aspect.attr.hasOwnProperty("alternative-activate-on-value")) {
                        if (event === this.aspect.attr["alternative-activate-on-value"]) {
                            this.use_regular = false
                            console.log("weird stop in aspect...")
                            return
                        }
                    }
                }
                let up_value = {value: event}
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
                if (!val) {
                    const fixed_value = this.aspect.attr.alternative.attr.value
                    if (fixed_value !== undefined) {
                        this.update_value(fixed_value)
                    } else {
                        this.update_value(aspect_raw_default_value(this.aspect.attr.alternative))
                    }
                } else {
                    this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
                        aspect_loc: this.aspect_loc,
                        value: aspect_raw_default_value(this.aspect)
                    })
                }
            }
        }
    }
</script>

<style scoped>
  .composite {
    border-left: 1px #8080806b solid;
    padding-left: 5px;
  }

</style>
