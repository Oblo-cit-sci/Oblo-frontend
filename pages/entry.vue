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
      entry: null
    }
  },
  created() {
    // todo some in case we want edit in main page, it wouldnt be set to edit yet, cuz this is the only place edit is set...
    this.guarantee_entry(this.query_entry_uuid, this.query_entry_access_key).then(entry => {
      this.entry = entry
      this.$store.dispatch("entries/set_edit", this.query_entry_uuid)
    }, err => {
      this.err_error_snackbar(err)
      this.home()
    })
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
