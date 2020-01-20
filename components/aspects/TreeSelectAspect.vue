<template lang="pug">
  div(v-if="!readOnly")
    v-autocomplete(
      outlined
      single-line
      :disabled="disabled"
      clearable
      :items="flat_options"
      :value="value"
      @change="emit($event)"
      :aspect_loc="aspect_loc"
      :prependIcon="prependIcon"
      @click:prepend="openDialog()")
    v-dialog(width="800" v-model="dialogOpen")
      TreleafPicker(
        :tree="tree"
        :attr="aspect.attr"
        v-on:selected="selected($event)"
        :disabled="disabled"
        :keep_selection="true")
  div(v-else)
    div {{value}}
</template>

<script>
    import AspectMixin from "./AspectMixin";
    import TreleafPicker from "../input/TreleafPicker";
    import TextShort from "./TextShortAspect";
    import {flatten_tree_to_options} from "../../lib/options";
    import {EDIT} from "../../lib/consts";

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
            // todo move this to a function
            if(this.mode === EDIT) {
                // build the given_options (all tree available) from what is passed
                let passed_tree = this.aspect.items;
                // a "*" means, lookup code and set the values as tree
                if (typeof (passed_tree) === "string") {
                    let type_char = passed_tree.charAt(0);
                    //console.log("tree, cja", type_char, )
                    if (type_char === "*") {
                        //console.log("tree")
                        this.tree = this.$store.getters.get_code(passed_tree.substring(1));
                    }
                }
                // flat_options // TODO maybe store them...
                let options = {}
                if (this.aspect.attr.allow_select_levels) {
                    options.include_levels = this.aspect.attr.allow_select_levels
                }
                this.flat_options = flatten_tree_to_options(this.tree, options)
                //console.log(this.flat_options)
            }
        },
        methods: {
            openDialog(short_persistence) {
                if (!this.disabled) {
                    this.dialogOpen = true
                }
            },
            selected(val) {
                this.dialogOpen = false;
                if(val) {
                    this.emit(val.value)
                }
                //console.log(val)
            },
            emit(val) {
                this.value_change(val)
            }
        },
        computed: {
            prependIcon() {
                return this.edit ? 'mdi-file-tree' : ''
            }
            /*description() {
                let has_d = this.value.hasOwnProperty("description")
                console.log("hasd", has_d)
                return this.value.description
            }*/
        }
    }
</script>

<style scoped>


</style>
