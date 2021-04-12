<template lang="pug">
</template>

<script>
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import EntryNavMixin from "~/components/EntryNavMixin"
import {EDIT} from "~/lib/consts"

/**
 * query params
 *  - type (default: entry)
 *    - template
 */
export default {
  name: "create",
  mixins: [EntryCreateMixin, EntryNavMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  created() {
    switch (this.object_type) {
      case "entry": {
        const entry = this.create_entry(this.$route.query.template)
        if(entry) {
          this.to_entry(entry.uuid, EDIT, {}, false)
        } else {
          console.log("ups page")
        }
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
