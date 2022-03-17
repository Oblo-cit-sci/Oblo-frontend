<template lang="pug">
  div(v-if="entry")
    EntryFullView(v-if="entry_mode === 'view'" :entry="entry" :mode="entry_mode")
    EntryFullEdit(v-else :entry="entry" :mode="entry_mode")
</template>

<script>


import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
import Entry from "../components/entry/Entry";
import {DRAFT, VIEW} from "~/lib/consts"
import URLQueryMixin from "~/components/util/URLQueryMixin";
import EntryFetchMixin from "~/components/entry/EntryFetchMixin";
import NavBaseMixin from "~/components/NavBaseMixin";
import EntryHelperMethodsMixin from "~/components/entry/EntryHelperMethodsMixin";
import EntryFullView from "~/components/entry/EntryFullView"
import EntryFullEdit from "~/components/entry/EntryFullEdit"

// todo, use mapgetters with entries context
export default {
  name: "entry",
  mixins: [EntryFetchMixin, PersistentStorageMixin, URLQueryMixin, NavBaseMixin, EntryHelperMethodsMixin],
  components: {
    EntryFullEdit,
    EntryFullView,
    Entry
  },
  data() {
    return {
      has_entry: false
    }
  },
  created() {
    // console.log(this.$store.getters["entries/has_full_entry"](this.query_entry_uuid))
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
  computed: {
    entry() {
      if (this.has_entry)
        return this.$store.getters["entries/get_edit"]()
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.entry) {
      if (this.entry.status === DRAFT) {
        this.$store.dispatch("entries/save_entry", {entry: this.entry, template: this.get_template(this.entry)})
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
