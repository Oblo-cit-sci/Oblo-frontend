<template lang="pug">
  div
    div(v-if="edit && !selected_aspect")
      SingleSelect(
        :options="options"
        :selection.sync="selected_option"
        :select_sync="true"
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
    import {packed_aspect_default_value} from "../../lib/aspect";
    import SingleSelect from "../SingleSelect";
    import {string_list2options} from "../../lib/client";

    export default {
        name: "OptionsAspect",
        components: {SingleSelect, Aspect},
        mixins: [AspectMixin],
        data() {
            return {
                selected_option: null,
                opt_values: [],
                options: string_list2options(this.$_.map(this.aspect.options, o => o.name))
            }
        },
        created() {
            for (let index in this.aspect.options) {
                this.opt_values[index] = packed_aspect_default_value(this.aspect.options[index])
            }
        },
        methods: {

        },
        computed: {
            selected_aspect() {
                return this.aspect.options.find(o => o.name === this.selected_option)
            }
        }
    }
</script>

<style scoped>

</style>

