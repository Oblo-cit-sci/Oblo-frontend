<template lang="pug">
  div
    div(v-if="edit && !selected_aspect")
      SingleSelect(
        :options="options"
        :select_sync="false"
        v-on:selection="option_selected($event)"
        :only_value="true")
    div(v-if="selected_option")
      Aspect(
        v-bind:aspect="selected_aspect"
        :aspect_loc="aspect_loc"
        :extra="extra"
        mode="edit")
</template>

<script>

    import AspectMixin from "./AspectMixin"
    import Aspect from "../Aspect"
    import {aspect_default_value, aspect_raw_default_value, packed_aspect_default_value} from "../../lib/aspect";
    import SingleSelect from "../SingleSelect";
    import {string_list2options} from "../../lib/client";
    import {ENTRIES_SET_ENTRY_VALUE} from "../../lib/store_consts";
    import {OPTION} from "../../lib/consts";

    export default {
        name: "OptionsAspect",
        components: {SingleSelect, Aspect},
        mixins: [AspectMixin],
        data() {
            return {
                selected_option: null,
                selected_aspect: null,
                opt_values: [],
                options: string_list2options(this.$_.map(this.aspect.options, o => o.name))
            }
        },
        created() {
            console.log(this.mvalue)
            if (this.mvalue.hasOwnProperty(OPTION)) {
                this.option_selected(this.mvalue.option, false)
            }
        },
        methods: {
            option_selected(option, selected = true) {
                this.selected_option = option
                this.selected_aspect = this.$_.find(this.aspect.options, o => o.name === option)
                if (selected) {
                    let value = aspect_default_value(this.selected_aspect)
                    value.option = option
                    this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
                        aspect_loc: this.aspect_loc,
                        value: value
                    })
                }
                //this.value_change(aspect_raw_default_value(this.selected_aspect))
            }
        }
    }
</script>

<style scoped>

</style>

