<template lang="pug">
  Entry(:entry="entry" :mode="mode")
</template>

<script>


import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
import Entry from "../components/entry/Entry";
import {VIEW} from "~/lib/consts"

// todo, use mapgetters with entries context
export default {
  name: "entry",
  mixins: [PersistentStorageMixin],
  components: {
    Entry
  },
  data() {
    return {}
  },
  created() {
    // todo some in case we want edit in main page, it wouldnt be set to edit yet, cuz this is the only place edit is set...
    if (!this.$store.getters["entries/has_full_entry"](this.uuid)) {
      // actually should be home or back. but we should always have it...
      this.$router.push("/")
    }
    this.$store.dispatch("entries/set_edit", this.uuid)
  },
  beforeRouteEnter(to, from, next) {
    if (!to.query.uuid) {
      // todo page not found :(
      next(false)
    } else {
      next()
    }
  },
  mounted() {

  },
  beforeRouteLeave(to, from, next) {
    if (this.entry.is_draft) {
      this.persist_entries()
    }
    next()
  },
  computed: {
    uuid() {
      return this.$route.query.uuid
    },
    entry() {
      return this.$store.getters["entries/get_edit"]()
    },
    mode() {
      return this.$route.query.entry_mode || VIEW
    }
  },
  methods: {

  }
}
</script>

<style scoped>

</style>
