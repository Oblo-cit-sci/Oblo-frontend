<template lang="pug">
  div(v-if="entry")
    Entry(:entry="entry" :mode="entry_mode")
</template>

<script>


import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
import Entry from "../components/entry/Entry";
import {VIEW} from "~/lib/consts"
import URLQueryMixin from "~/components/util/URLQueryMixin";
import EntryFetchMixin from "~/components/entry/EntryFetchMixin";
import NavBaseMixin from "~/components/NavBaseMixin";

// todo, use mapgetters with entries context
export default {
  name: "entry",
  mixins: [EntryFetchMixin, PersistentStorageMixin, URLQueryMixin, NavBaseMixin],
  components: {
    Entry
  },
  data() {
    return {
      has_entry: false
    }
  },
  created() {
    console.log(this.$store.getters["entries/has_full_entry"](this.query_entry_uuid))
    this.has_entry = this.$store.getters["entries/has_full_entry"](this.query_entry_uuid)
    if (!this.has_entry) {
      // actually should be home or back. but we should always have it...
      this.guarantee_entry(this.query_entry_uuid, this.query_entry_access_key).then(entry => {
        this.has_entry = true
        this.$store.dispatch("entries/set_edit", this.query_entry_uuid)
      }, err => {
        this.err_error_snackbar(err)
        this.home()
      })
    }
    this.$store.dispatch("entries/set_edit", this.query_entry_uuid)
  },
  beforeRouteEnter(to, from, next) {
    if (!to.query.uuid) {
      next(false)
    } else {
      next()
    }
  },
  mounted() {

  },
  computed: {
    entry() {
      if (this.has_entry)
        return this.$store.getters["entries/get_edit"]()
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.entry) {
      if (this.entry.is_draft) {
        this.persist_entries()
      }
    }
    next()
  },
  methods: {}
}
</script>

<style scoped>

</style>
