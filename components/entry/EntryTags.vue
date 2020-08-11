<template lang="pug">
  div
    Taglist(:tags="listed_tags" :slide="slide")
    TagTree(v-for="(tree, index) in tag_tree" :key="index"
      :source_entry_slug="tree.source_entry")
</template>

<script>
import Taglist from "~/components/global/Taglist"
import TagTree from "~/components/global/TagTree"


/**
 *  FOR something like in the rules of an template.
 *  but the tree is not implemented yet.
 *  needs to specify if its for the preview, or entry (in the top)
 *  cuz we want the tree for the entry and for the preview an overview:
 *  just the systems with counts of elements/liccis
 *     "tags_config": [
      {
        "name": "tag_tree",
        "from_tags": ["subsystem", "licci"],
        "source_entry": "licci_tree"
      }
    ],
 *
 */
export default {
  name: "EntryTags",
  mixins: [],
  components: {TagTree, Taglist},
  props: {
    slide: Boolean,
    tags: {
      type: Object,
      default: () => {
      }
    },
    config: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  computed: {
    listed_tags() {
      // console.log(this.$_.toPairs(this.tags))
      return this.$_.fromPairs(this.$_.filter(this.$_.toPairs(this.tags), ([group_name, tags]) => {
        return !this.filter_from_list.includes(group_name)
      }))
    },
    filter_from_list() {
      return this.$_.flatten(this.config.map(tag_cf => {
        if(tag_cf.name === "tag_tree") {
          return tag_cf.from_tags
        }
        return []
      }))
    },
    tag_tree() {
      // console.log(this.$_.filter(this.config, tag_cf => tag_cf.name === "tag_tree"))
      return this.$_.filter(this.config, tag_cf => tag_cf.name === "tag_tree")
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
