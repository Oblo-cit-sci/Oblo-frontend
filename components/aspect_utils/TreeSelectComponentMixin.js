import {flatten_tree_to_options, tree_options_add_ids} from "~/lib/options";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";

export default {
    // todo maybe mixin: AspectComponentMixin
    name: "TreeSelectComponentMixin",
    mixins: [OptionsMixin],
    props: {},
    data() {
        return {
            "tree": {}
        }
    },
    methods: {
        calc_options(only_levels) {
            // build the given_options (all tree available) from what is passed
            // let passed_tree = this.aspect.items;
            if (typeof this.aspect.items === "string") {
                this.tree = this.get_tree_codes_tree(this.aspect.items)
                this.prepare_tree_nodes(this.tree, only_levels)
                // todo SELECT_MIXIN!!
                this.from_code_entry = true
                const match = this.check_language_match(this.aspect.items)
                this.code_entry_language_match = match[0]
                this.code_entry_language = match[2]
                //
            } else {
                this.tree = this.aspect.items
            }
            // console.log(this.tree, options.include_levels)
            // console.log(this.flat_options[0].parents)
        },
        get_tree_codes_tree(code_slug) {
            const code_entry = this.get_lang_code_entry(code_slug)
            if (code_entry.rules.code_schema === "value_tree") {
                return this.$_.cloneDeep(code_entry.values)
            } else {
                console.error("code entry is not of type tree")
            }
        },
        prepare_tree_nodes(tree, only_levels) {
            let next_id = 1
            const rec_add_id = (node, level=0) => {
                // console.log(node.text, level)
                node.id = next_id
                next_id++
                if (only_levels) {
                    if (only_levels.length > 0 && !only_levels.includes(level)) {
                        node.dis = true
                    }
                }
                for (let child of node.children || []) {
                    rec_add_id(child, level + 1)
                }
            }
            rec_add_id(tree.root)
        },
        get_flat_options(options) {
            return flatten_tree_to_options(this.tree, options)
        }
    }
}

