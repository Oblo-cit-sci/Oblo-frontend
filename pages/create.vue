<template lang="pug">
</template>

<script>
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import EntryNavMixin from "~/components/EntryNavMixin"
import {EDIT} from "~/lib/consts"
import TemplateHelperMixin from "~/components/templates/TemplateHelperMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"

/**
 * query params
 *  - type (default: entry)
 *    - template
 */
export default {
  name: "create",
  mixins: [EntryCreateMixin, EntryNavMixin, TemplateHelperMixin, URLQueryMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  created() {
    switch (this.object_type) {
      case "entry": {
        const slug = this.$route.query.template
        const language = this.query_language || this.$store.getters.ui_language
        this.guarantee_template_code_with_references(slug, language).then((res) => {
          console.log("GUARANTEEE", res)
          const entry = this.create_entry(slug, language)
          if (entry) {
            this.to_entry(entry.uuid, EDIT, {}, false)
          } else {
            console.log("ups page")
          }
        })
      }
    }
  },
  computed: {
    object_type() {
      return this.$route.query.type || "entry"
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
