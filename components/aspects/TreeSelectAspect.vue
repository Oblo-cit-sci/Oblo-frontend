<template lang="pug">
  div
    v-flex(text-xs-left)
      v-autocomplete(
        outlined
        single-line
        :disabled="disabled"
        :items="flat_options"
        :value="value"
        @change="emit($event)"
        :aspect_loc="aspect_loc"
        :prependIcon="prependIcon"
        @click:prepend="openDialog()")
      v-dialog(width="500" v-model="dialogOpen")
        TreleafPicker(
          :tree="tree"
          :attr="aspect.attr"
          v-on:selected="selected($event)"
          :disabled="disabled"
          :keep_selection="true")
</template>

<script>
    import AspectMixin from "./AspectMixin";
    import TreleafPicker from "../TreleafPicker";
    import TextShort from "./TextShortAspect";
    import {flatten_tree_to_options} from "../../lib/options";

    export default {
        name: "TreeSelectAspect",
        components: {TextShort, TreleafPicker},
        mixins: [AspectMixin],
        data() {
            return {
                tree: {},
                flat_options: [],
                dialogOpen: false,
            }
        },
        created() {
            // build the given_options (all tree available) from what is passed
            let passed_tree = this.aspect.items;
            // a "*" means, lookup code and set the values as tree
            if (typeof (passed_tree) === "string") {
                let type_char = passed_tree.charAt(0);
                //console.log("tree, cja", type_char, )
                if (type_char === "*") {
                    this.tree = this.$store.state.codes[passed_tree.substring(1)];
                }
            }
            // flat_options // TODO maybe store them...

            let options = {}
            if (this.aspect.attr.allow_select_levels) {
                options.include_levels = this.aspect.attr.allow_select_levels
            }
            this.flat_options = flatten_tree_to_options(this.tree, options)
        },
        methods: {
            openDialog(short_persistence) {
                if (!this.disabled) {
                    this.dialogOpen = true
                }
            },
            selected(val) {
                console.log("TS Aspect", val.value)
                this.dialogOpen = false;
                this.emit(val.value)
            },
            emit(val) {
                console.log("emit", val)
                this.value_change(val)
            }
        },
        computed: {
            prependIcon() {
                return this.edit ? 'mdi-file-tree' : ''
            }
        }
    }
</script>

<style scoped>


</style>
