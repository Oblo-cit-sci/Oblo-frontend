<template lang="pug">
  div(
    :class="[{ composite: aspect.type === 'composite',  disabled: disabled || condition_fail}]")
    Title_Description(
      v-if="show_title_description"
      v-bind="title_description(aspect)"
      :disabled="disable"
      :disabled_text="disabled_text"
      :mode="mode")
    v-switch(v-if="has_alternative"
      v-model="use_regular"
      hideDetails
      :label="use_regular ? regular_value_text: alternative_value_text"
      color="primary")
    component(
      v-if="use_regular"
      :is="aspectComponent(aspect, mode)"
      :aspect="aspect"
      :value="raw_value"
      :extra="extra"
      :extra_update=extra_update
      :disabled="regular_disable"
      :mode="mode"
      v-on:update:value="emit_up($event)"
      v-on:entryAction="$emit('entryAction',$event)"
      v-on:aspectAction="aspectAction($event)")
    div(v-if="!use_regular")
      Title_Description(v-bind="title_description(aspect.attr.alternative)")
      component(
        :is="aspectComponent(aspect.attr.alternative)"
        v-bind:aspect="aspect.attr.alternative"
        v-on:update:value="emit_up($event)"
        :value="raw_value"
        :mode="alt_mode")
    div(v-if="listitem_icons")
      v-btn(small @click="$emit('entryAction', {action: 'clear'})") delete {{extra.itemname}}
</template>

<script>

    import {ASPECTACTION} from "../lib/consts";

    import {
        aspect_default_value,
        aspect_raw_default_value,
        MAspectComponent
    } from "../lib/entry";

    import Title_Description from "./Title_Description";
    import {aspect_label} from "../lib/aspect";

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
            value: Object, // a wrapper, which  might encode "exceptional_value"
            extra: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            extra_update: {
                type: Boolean
            }
        },
        data() {
            return {
                has_alternative: false,
                use_regular: this.value.hasOwnProperty("regular") ? this.value.regular : true,
                condition: null,
                condition_fail: false,
            }
        },
        created() {
            //console.log(this.aspect.name, this.value, this.use_regular)
            try {
                //console.log("aspect", this.aspect.name, this.value)
                //console.log("aspect " + this.aspect.name + " created with value", this.value)
                this.has_alternative = this.aspect.attr.hasOwnProperty("alternative")

                if (this.aspect.attr.hasOwnProperty("condition")) {
                    this.condition = this.aspect.attr.condition
                }

            } catch (e) {
                console.log("DEV, crash on Aspect", this.aspect.name, this.aspect, this.value)
            }
        },
        // boolean check is not required, since "false" is the default
        computed: {
            listitem_icons() {
                return (this.extra.listitem || false)
            },
            show_title_description() {
                if (this.extra.hasOwnProperty("show_title_descr")) {
                    return this.extra.show_title_descr
                } else
                    return true
            },
            raw_value() {
                //console.log("raw value of", this.aspect.name, this.value)
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
                return this.disabled || this.condition_fail  || this.aspect.attr.disabled
            },
            regular_disable() {
                return this.disable || !this.use_regular
            },
            disabled_text() {
                if (this.condition_fail) {
                    //console.log("disabled_text text", this.aspect.attr.condition.disabled_text)
                    return this.aspect.attr.condition.disabled_text
                } else {
                    return "disabled"
                }
            }
        },
        methods: {
            title_description(aspect_descr) {
                if (!aspect_descr.hasOwnProperty("name")) {
                    //console.log("warning: aspect", aspect_descr, "has no name")
                }
                return {
                    title: this.extra.no_title ? "" : aspect_label(aspect_descr),
                    description: aspect_descr.description || ""
                }
            },
            aspectAction(event) {
                this.$emit(ASPECTACTION, event)
            },
            aspectComponent(aspect_descr, mode) {
                // todo false, false are just default, ... better a config obj
                return MAspectComponent(aspect_descr, mode, this.extra)
            },
            emit_up(event) {
                //console.log("aspect emit up", event)
                if (this.has_alternative && this.use_regular) {
                    if (this.aspect.attr.hasOwnProperty("alternative-activate-on-value")) {
                        if (event === this.aspect.attr["alternative-activate-on-value"]) {
                            this.use_regular = false
                            console.log("weird stop in aspect...")
                            return
                        }
                    }
                }
                this.value.value = event
                const up_value = Object.assign(this.$_.cloneDeep(this.value), {value: event})
                this.$emit('update:value', up_value)
            }
        },
        watch: {
            use_regular(val) {
                if (!val) {
                    const fixed_value = this.aspect.attr.alternative.attr.value
                    if (fixed_value !== undefined) {
                        this.$emit('update:value', {value: fixed_value, regular: false})
                    } else {
                        this.$emit('update:value', {value: aspect_raw_default_value(this.aspect.attr.alternative), regular: false})
                    }
                } else {
                    this.$emit('update:value', aspect_default_value(this.aspect))
                }
            },
            extra_update(val) {
                if (this.condition) {
                    if (!this.extra.condition || !this.extra.condition.value) {
                        this.condition_fail = false
                    } else {
                        const compare = this.condition.compare || "equal"
                        let v = null
                        switch (compare) {
                            case "equal":
                                v = this.extra.condition.value !== this.aspect.attr.condition.value
                                break
                            case "unequal":
                                v = this.extra.condition.value === this.aspect.attr.condition.value
                                break
                        }
                        this.condition_fail = v;
                        if (this.condition_fail) {
                            this.$emit('update:value', aspect_default_value(this.aspect))
                        }
                    }
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
