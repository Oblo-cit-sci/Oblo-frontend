import {MULTISELECT, OPTIONS, SELECT, TREE, TREEMULTISELECT} from "~/lib/consts";
import {unpack} from "~/lib/aspect";

export default {
  name: "SelectComponentMixin",
  props: {
    data_source: String
  },
  methods: {
    get_icon_url(icon) {
      if (this.data_source) {
        return this.$api.entry.url_slug_attachment(this.data_source, icon)
      } else {
        return this.$api.static.url(icon)
      }
    },
    get_texts_of_mvalues(mvalue, aspect) {
      /**
       * TODO deprecated
       * get the values from a list of items (select, multiselect)
       */
        // console.log("mvalue", mvalue)
      const aspect_type = aspect.type
      if ([MULTISELECT, SELECT].includes(aspect_type)) {
        // todo, the items could should in cases come from a code-entry
        return aspect.items.filter(i => unpack(mvalue).includes(i.value)).map(v => v.text)
      } else if ([TREE, TREEMULTISELECT].includes(aspect_type)) { // also treemultiselect ?
        return this.get_text_of_tree_values(unpack(mvalue), aspect.items)
      } else if (aspect_type === OPTIONS) {
        // debugger
        // console.log("mvalue", mvalue, aspect.options)
        const option_aspect = this.$_.find(aspect.options, o => o.name === mvalue.option)
        // console.log(option_aspect)
        return this.get_texts_of_mvalues(unpack(mvalue), option_aspect)
      } else {
        console.log("filterselect... shouldnt happen")
        return ""
      }
    },
    get_text_of_tree_values(values, tree) {
      // console.log(tree)
      // console.log(values)
      const results = []
      const find_rec = (node) => {
        // this.$_.find(values, v => v.)
        if (values.includes(node.value)) {
          results.push(node.text)
        }
        for (let kid of node.children || []) {
          find_rec(kid)
        }
      }
      find_rec(tree.root)
      return results
    }
  }
}
